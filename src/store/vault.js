// Vault unlock lifecycle (option A, docs/vault-key-design.md), behind VAULT_UNLOCK_KEY_ENABLED.
// The derived CryptoKey lives in a closure: never reactive, never cached, never serialised.
// `records` holds ciphertext envelopes only; loadFromServer/pushToServer sync them with /vaults/primary
// (docs/vault-ux-design.md). lock/forget/setup/put/get/unlock never touch the network.
import { ref, computed, watch } from 'vue';
import { defineStore } from 'pinia';
import { useUserStore } from '@/store';
import { VAULT_UNLOCK_KEY_ENABLED } from '../utils/secrets';
import {
    VAULT_KDF_LIMITS, createVaultParams, deriveVaultKey, deriveVaultKeyRaw, importVaultKey,
    generateRecoveryCode, encodeKeyMaterial, decodeKeyMaterial,
    sealEnvelope, openEnvelope, validatePhrase,
    assertApiSafe, vaultUsage, VaultDisabledError, VaultLockedError, VaultEnvelopeError,
} from '../utils/vaultKey';
import { encodeVaultBlob, decodeVaultBlob, sameEnvelope, toBase64url } from '../utils/vaultBlob';
import { VaultService, VaultApiError, isFreshSignInRequired } from '../services/VaultService';
import { PasskeyService } from '../services/PasskeyService';
import { sealPasskeyWrap, openPasskeyWrap, createPrfSalt } from '../utils/vaultPasskey';
import { authenticateWithPrf } from '../utils/webauthn';

const VERIFIER_PLAINTEXT = 'jisme-vault-ok';
const checkUsage = owner => vaultUsage('vault-check', owner);
const recordUsage = (owner, id) => vaultUsage('record', owner, String(id));
const recoveryUsage = owner => vaultUsage('vault-recovery', owner);
const VAULT_ID = 'primary';
const SYNC_MESSAGES = Object.freeze({
    load: 'Could not load the vault from the server.',
    save: 'Could not save the vault to the server; your changes are saved on this device only.',
    differentPhrase: 'The vault on the server was unlocked with a different phrase.',
    conflict: 'Vault sync conflict; your changes are saved on this device only.',
    freshSignIn: 'Fresh sign-in required to save the vault.',
    reseal: 'The vault on the server uses outdated security parameters; it needs a re-seal before it can be used.',
});

const useVaultStore = defineStore('vault', () => {
    const userStore = useUserStore();
    const isEnabled = VAULT_UNLOCK_KEY_ENABLED;
    const vaultService = new VaultService();
    const passkeyService = new PasskeyService();

    let key = null;
    let epoch = 0; // bumped on every lock and key install: in-flight derivations/seals/opens are discarded
    let setupInFlight = false; // only one setup may race to install a key
    const owner = ref(null);
    const verifier = ref(null);
    const recovery = ref(null); // recovery envelope (seals the vault key under the recovery code)
    const records = ref({});
    // Passkey (PRF) wraps of the vault key, one per credential (docs/passkey-ux-design.md).
    const passkeyWraps = ref([]);
    const hasPasskeyUnlock = computed(() => passkeyWraps.value.length > 0);
    // Short-TTL vault token from POST vaults/unlock/passkey (closure only, like the key).
    let vaultSession = null;
    const isUnlocked = ref(false);
    const hasVault = computed(() => !!verifier.value);
    const hasRecovery = computed(() => !!recovery.value);
    // True when the vault was unlocked with the recovery code (a new phrase must be set)
    // or when the vault's KDF params are weaker than this client will seal with.
    const needsPhraseReset = ref(false);
    const needsReseal = ref(false);
    // Anti-downgrade pin (docs/vault-recovery-design.md): the iterations this client itself
    // sealed with (setup/resetPhrase). Sealing is refused below `pinned ?? defaultIterations`.
    let pinnedIterations = null;
    const sealFloor = () => pinnedIterations ?? VAULT_KDF_LIMITS.defaultIterations;
    // Server sync state (local only; cleared by forget()).
    const serverRevision = ref(null);
    const hasServerVault = ref(false);
    const isSyncing = ref(false);
    const syncError = ref(null);
    const needsFreshSignIn = ref(false);
    let loadGeneration = 0; // bumped by forget() and each new load: stale loads are discarded
    let syncsInFlight = 0;
    const beginSync = () => { syncsInFlight++; isSyncing.value = true; };
    const endSync = () => { syncsInFlight--; isSyncing.value = syncsInFlight > 0; };

    const requireEnabled = () => { if (!isEnabled) throw new VaultDisabledError(); };
    const signedInOwner = () => (userStore.isLoggedIn && userStore.user?.uuid) || null;
    // Vault API calls prefer a live passkey vault token, else the session token.
    const apiToken = () => (vaultSession && Date.now() < vaultSession.expiresAt
        ? vaultSession.token : userStore.user.token);

    function requireUnlocked () {
        const who = signedInOwner();
        if (!key || !who || who !== owner.value) throw new VaultLockedError();
        return { who, activeKey: key, started: epoch };
    }

    // Forget the key synchronously. Ciphertext stays so the phrase can restore the vault.
    function lock () {
        epoch++;
        key = null;
        vaultSession = null;
        isUnlocked.value = false;
    }

    // Forget everything for this owner (full sign-out or account switch).
    // The anti-downgrade pin survives: this client keeps refusing to seal below its own floor.
    function forget () {
        lock();
        owner.value = null;
        verifier.value = null;
        recovery.value = null;
        records.value = {};
        passkeyWraps.value = [];
        loadGeneration++;
        serverRevision.value = null;
        hasServerVault.value = false;
        syncError.value = null;
        needsFreshSignIn.value = false;
        needsPhraseReset.value = false;
        needsReseal.value = false;
    }

    // Auto-lock, session expiry and sign-out clear the user synchronously: follow them.
    watch(() => userStore.user?.uuid ?? null, (uuid) => {
        if (!uuid) lock();
        else if (owner.value && uuid !== owner.value) forget();
    }, { flush: 'sync' });

    // Auto-load on sign-in. Not flush:'sync': the user store sets `user` before `isLoggedIn`,
    // so this waits for both. Fire and forget; loadFromServer records its own errors.
    watch(signedInOwner, (who) => {
        if (who && isEnabled && !userStore.isDemo && !verifier.value) {
            loadFromServer().catch(() => { syncError.value = SYNC_MESSAGES.load; });
        }
    });

    // Seals the raw key material under a freshly generated recovery code (recovery wrapping).
    // Payload: JSON { key: base64(32-byte raw vault key), params: the phrase KDF params }.
    // The code itself is returned to the caller ONCE and never stored or sent anywhere.
    async function sealRecoveryEnvelope (rawKey, params, who, iterations) {
        const recoveryCode = generateRecoveryCode();
        const recoveryParams = createVaultParams({ iterations });
        const recoveryKey = await deriveVaultKey(recoveryCode, recoveryParams);
        const envelope = await sealEnvelope(recoveryKey, recoveryParams,
            JSON.stringify({ key: encodeKeyMaterial(rawKey), params }), recoveryUsage(who));
        return { recoveryCode, envelope };
    }

    async function setup (phrase, { loginPassword, iterations } = {}) {
        requireEnabled();
        const who = signedInOwner();
        if (!who) throw new VaultLockedError();
        if (verifier.value && owner.value === who) throw new Error('A vault unlock phrase is already set up.');
        if (setupInFlight) throw new Error('A vault unlock phrase setup is already in progress.');
        // Mandatory: the phrase must provably differ from the login password.
        if (typeof loginPassword !== 'string' || !loginPassword.trim()) {
            throw new Error('Vault setup requires your login password to check the phrase differs from it.');
        }
        const normalized = validatePhrase(phrase, { loginPassword });
        const params = createVaultParams({ iterations });
        setupInFlight = true;
        let rawKey = null;
        try {
            const started = epoch;
            rawKey = await deriveVaultKeyRaw(normalized, params);
            const derived = await importVaultKey(rawKey);
            const check = await sealEnvelope(derived, params, VERIFIER_PLAINTEXT, checkUsage(who));
            const { recoveryCode, envelope: recoveryEnvelope } =
                await sealRecoveryEnvelope(rawKey, params, who, params.iterations);
            // Locked, signed out/switched, or a vault was imported meanwhile: never overwrite it.
            if (started !== epoch || signedInOwner() !== who || verifier.value) throw new VaultLockedError();
            epoch++; // any put/get holding a previous key is discarded
            owner.value = who;
            verifier.value = check;
            recovery.value = recoveryEnvelope;
            records.value = {};
            key = derived;
            isUnlocked.value = true;
            pinnedIterations = params.iterations; // anti-downgrade pin
            return recoveryCode;
        } finally {
            if (rawKey) rawKey.fill(0);
            setupInFlight = false;
        }
    }

    async function unlock (phrase) {
        requireEnabled();
        const who = signedInOwner();
        const check = verifier.value;
        if (!who || !check || owner.value !== who) throw new VaultLockedError();
        const started = epoch;
        const derived = await deriveVaultKey(phrase, check.params);
        if (await openEnvelope(derived, check, checkUsage(who)) !== VERIFIER_PLAINTEXT) throw new VaultEnvelopeError();
        if (started !== epoch || signedInOwner() !== who || verifier.value !== check) throw new VaultLockedError();
        key = derived;
        isUnlocked.value = true;
    }

    // Unlock with the one-time recovery code instead of the phrase: open the recovery
    // envelope, import the wrapped vault key, confirm it against the check verifier, and
    // demand a phrase reset (needsPhraseReset) before normal use. Every failure is the
    // uniform VaultEnvelopeError: no oracle on which check rejected the code.
    async function unlockWithRecovery (code) {
        requireEnabled();
        const who = signedInOwner();
        const check = verifier.value;
        const recoveryEnvelope = recovery.value;
        if (!who || !check || !recoveryEnvelope || owner.value !== who) throw new VaultLockedError();
        const started = epoch;
        const recoveryKey = await deriveVaultKey(code, recoveryEnvelope.params);
        let raw = null;
        try {
            let payload = null;
            try {
                payload = JSON.parse(await openEnvelope(recoveryKey, recoveryEnvelope, recoveryUsage(who)));
            } catch (error) {
                if (error instanceof VaultEnvelopeError) throw error;
                throw new VaultEnvelopeError(); // non-JSON plaintext: still uniform
            }
            raw = decodeKeyMaterial(payload?.key);
            // The payload must claim the params the check verifier was sealed with.
            if (!payload?.params || !sameEnvelope(payload.params, check.params)) throw new VaultEnvelopeError();
            const recovered = await importVaultKey(raw);
            if (await openEnvelope(recovered, check, checkUsage(who)) !== VERIFIER_PLAINTEXT) throw new VaultEnvelopeError();
            if (started !== epoch || signedInOwner() !== who || verifier.value !== check) throw new VaultLockedError();
            key = recovered;
            isUnlocked.value = true;
            needsPhraseReset.value = true; // the recovery code was used: a new phrase is required
        } finally {
            if (raw) raw.fill(0);
        }
    }

    // Re-seal the whole vault under a new phrase (after recovery unlock, or to upgrade KDF
    // params): every record is decrypted with the active key and re-sealed with the new one,
    // a fresh recovery code wraps the new key, and the old phrase/code stop working.
    // Returns the NEW recovery code, shown to the user exactly once.
    async function resetPhrase (newPhrase, { loginPassword, iterations } = {}) {
        requireEnabled();
        const { who, activeKey, started } = requireUnlocked();
        if (typeof loginPassword !== 'string' || !loginPassword.trim()) {
            throw new Error('Vault re-seal requires your login password to check the phrase differs from it.');
        }
        const normalized = validatePhrase(newPhrase, { loginPassword });
        const newParams = createVaultParams({ iterations });
        if (newParams.iterations < sealFloor()) {
            throw new RangeError(`Vault re-seal requires at least ${ sealFloor() } PBKDF2 iterations.`);
        }
        let rawKey = null;
        try {
            rawKey = await deriveVaultKeyRaw(normalized, newParams);
            const newKey = await importVaultKey(rawKey);
            const reopened = {};
            for (const [id, envelope] of Object.entries(records.value)) {
                const plaintext = await openEnvelope(activeKey, envelope, recordUsage(who, String(id)));
                reopened[id] = await sealEnvelope(newKey, newParams, plaintext, recordUsage(who, String(id)));
            }
            const newCheck = await sealEnvelope(newKey, newParams, VERIFIER_PLAINTEXT, checkUsage(who));
            const { recoveryCode, envelope: recoveryEnvelope } =
                await sealRecoveryEnvelope(rawKey, newParams, who, newParams.iterations);
            if (started !== epoch || signedInOwner() !== who) throw new VaultLockedError();
            epoch++; // any put/get holding the previous key is discarded
            key = newKey;
            verifier.value = newCheck;
            recovery.value = recoveryEnvelope;
            records.value = reopened;
            passkeyWraps.value = []; // they wrapped the previous key: re-enable passkey unlock
            pinnedIterations = newParams.iterations;
            needsReseal.value = false;
            needsPhraseReset.value = false;
            return recoveryCode;
        } finally {
            if (rawKey) rawKey.fill(0);
        }
    }

    // Anti-downgrade: refuse to seal records under params weaker than this client's floor
    // (pinned at setup/resetPhrase, defaulting to 600k iterations).
    function requireSealableParams () {
        if (verifier.value?.params?.iterations < sealFloor()) {
            needsReseal.value = true;
            throw new VaultEnvelopeError();
        }
    }

    async function put (id, value) {
        requireEnabled();
        const { who, activeKey, started } = requireUnlocked();
        requireSealableParams();
        const envelope = await sealEnvelope(activeKey, verifier.value.params, JSON.stringify(value), recordUsage(who, String(id)));
        if (started !== epoch) throw new VaultLockedError();
        records.value = { ...records.value, [id]: envelope };
    }

    async function get (id) {
        requireEnabled();
        const { who, activeKey, started } = requireUnlocked();
        // Own keys only: ids like 'toString' / 'constructor' must not hit Object.prototype.
        const envelope = Object.hasOwn(records.value, id) ? records.value[id] : undefined;
        if (!envelope) return undefined;
        const plaintext = await openEnvelope(activeKey, envelope, recordUsage(who, String(id)));
        if (started !== epoch) throw new VaultLockedError(); // locked meanwhile: never hand out plaintext
        return JSON.parse(plaintext);
    }

    // API-ready, ciphertext-only snapshot (for the future vault endpoints).
    function exportVault () {
        if (!verifier.value) return null;
        const snapshot = { owner: owner.value, verifier: verifier.value, records: records.value };
        if (recovery.value) snapshot.recovery = recovery.value;
        if (passkeyWraps.value.length) snapshot.passkeys = passkeyWraps.value;
        return assertApiSafe(JSON.parse(JSON.stringify(snapshot)));
    }

    function importVault (data) {
        requireEnabled();
        const who = signedInOwner();
        if (!who || !data || data.owner !== who || !data.verifier) throw new VaultLockedError();
        assertApiSafe(data);
        const sameVerifier = owner.value === who && JSON.stringify(verifier.value) === JSON.stringify(data.verifier);
        if (!sameVerifier) lock(); // a different verifier means a different key
        owner.value = who;
        verifier.value = JSON.parse(JSON.stringify(data.verifier));
        recovery.value = data.recovery ? JSON.parse(JSON.stringify(data.recovery)) : null;
        records.value = JSON.parse(JSON.stringify(data.records || {}));
        passkeyWraps.value = Array.isArray(data.passkeys) ? JSON.parse(JSON.stringify(data.passkeys)) : [];
        // Anti-downgrade (advisory): accept the vault read-only, but flag weak params so the
        // UI can demand a re-seal; put() refuses to seal below the floor independently.
        if (data.verifier.params.iterations < sealFloor()) needsReseal.value = true;
    }

    // GET /vaults/primary and import it (locked) as this owner's vault. Never throws on API errors.
    async function loadFromServer () {
        requireEnabled();
        const who = signedInOwner();
        if (!who) return;
        const generation = ++loadGeneration;
        const current = () => generation === loadGeneration && signedInOwner() === who;
        beginSync();
        try {
            const res = await vaultService.getVault(apiToken(), VAULT_ID);
            if (!current()) return; // signed out / switched / forgotten meanwhile: discard silently
            if (!res.found) {
                hasServerVault.value = false;
                serverRevision.value = null;
                syncError.value = null;
                return;
            }
            const { check, recovery: serverRecovery, records: serverRecords, passkeys: serverPasskeys } = decodeVaultBlob(res.envelope);
            // Anti-downgrade (pinned): a server vault sealed weaker than this client's own
            // params is refused outright — nothing is imported, the user keeps the local vault.
            if (pinnedIterations && check.params.iterations < pinnedIterations) {
                needsReseal.value = true;
                syncError.value = SYNC_MESSAGES.reseal;
                return;
            }
            if (verifier.value && owner.value === who && sameEnvelope(verifier.value, check)) {
                records.value = { ...serverRecords, ...records.value }; // same key: keep local edits (local wins)
                passkeyWraps.value = mergeWraps(serverPasskeys, passkeyWraps.value);
            } else {
                importVault({ owner: who, verifier: check, recovery: serverRecovery ?? null, records: serverRecords, passkeys: serverPasskeys ?? [] }); // locks on a new verifier
            }
            hasServerVault.value = true;
            serverRevision.value = res.revision;
            syncError.value = null;
        } catch (error) {
            if (!current()) return;
            if (error instanceof VaultApiError && error.status === 404) {
                hasServerVault.value = false;
                serverRevision.value = null;
            } else {
                syncError.value = SYNC_MESSAGES.load;
            }
        } finally {
            endSync();
        }
    }

    // PUT the ciphertext vault with optimistic concurrency; one merge-and-retry on 409.
    async function pushToServer () {
        requireEnabled();
        const { who, started } = requireUnlocked();
        if (!verifier.value) throw new VaultLockedError();
        const live = () => started === epoch && signedInOwner() === who;
        // Re-exported on every attempt so a merge is included; the token is read late (fresh sign-in).
        const putCurrent = (expectedRevision) => vaultService.putVault(apiToken(), VAULT_ID, {
            expectedRevision, envelope: encodeVaultBlob(exportVault()),
        });
        needsFreshSignIn.value = false;
        syncError.value = null;
        beginSync();
        try {
            let result;
            try {
                result = await putCurrent(serverRevision.value ?? 0);
            } catch (error) {
                if (!(error instanceof VaultApiError && error.status === 409)) throw error;
                if (!live()) return;
                const server = await vaultService.getVault(apiToken(), VAULT_ID);
                if (!live()) return;
                let expected = 0;
                if (server.found) {
                    const { check, records: serverRecords, passkeys: serverPasskeys } = decodeVaultBlob(server.envelope);
                    if (!sameEnvelope(check, verifier.value)) {
                        syncError.value = SYNC_MESSAGES.differentPhrase; // never overwrite another key's vault
                        return;
                    }
                    records.value = { ...serverRecords, ...records.value }; // server-only ids kept, local wins
                    passkeyWraps.value = mergeWraps(serverPasskeys, passkeyWraps.value);
                    expected = server.revision ?? error.body?.currentRevision ?? 0;
                }
                try {
                    result = await putCurrent(expected);
                } catch (retryError) {
                    if (live()) {
                        if (isFreshSignInRequired(retryError)) {
                            // The retry itself can meet the 300s rule: surface the re-auth prompt, not a conflict.
                            needsFreshSignIn.value = true;
                            syncError.value = SYNC_MESSAGES.freshSignIn;
                        } else {
                            syncError.value = SYNC_MESSAGES.conflict; // single retry: no loops
                        }
                    }
                    return;
                }
            }
            if (!live()) return;
            serverRevision.value = result.revision;
            hasServerVault.value = true;
        } catch (error) {
            if (!live()) return; // locked / signed out meanwhile: abort silently
            if (isFreshSignInRequired(error)) {
                needsFreshSignIn.value = true;
                syncError.value = SYNC_MESSAGES.freshSignIn;
            } else {
                syncError.value = SYNC_MESSAGES.save;
            }
        } finally {
            endSync();
        }
    }

    // Union by credential id; local wins (same verifier, so both sides wrap the same key).
    function mergeWraps (server = [], local = []) {
        const byId = new Map((server || []).map(w => [w.credentialId, w]));
        for (const w of local) byId.set(w.credentialId, w);
        return [...byId.values()];
    }

    // Enable passkey unlock: the phrase re-derives the raw vault key (checked against the
    // verifier), a PRF ceremony yields a per-credential secret, and the raw key is sealed under
    // HKDF(PRF) — all locally. The local challenge is fine: the assertion is discarded, only the
    // PRF output matters. The caller pushes the vault so the wrap reaches the server blob.
    async function enablePasskeyUnlock (phrase) {
        requireEnabled();
        const who = signedInOwner();
        const check = verifier.value;
        if (!who || !check || owner.value !== who) throw new VaultLockedError();
        const started = epoch;
        let raw = null;
        let prfOutput = null;
        try {
            raw = await deriveVaultKeyRaw(phrase, check.params);
            const derived = await importVaultKey(raw);
            if (await openEnvelope(derived, check, checkUsage(who)) !== VERIFIER_PLAINTEXT) throw new VaultEnvelopeError();
            const verified = (userStore.user?.passkeys || [])
                .filter(p => p && p.verified === true && typeof p.id === 'string')
                .map(p => ({ id: p.id, type: 'public-key' }));
            const challenge = toBase64url(globalThis.crypto.getRandomValues(new Uint8Array(32)));
            const result = await authenticateWithPrf(
                { challenge, allowCredentials: verified, userVerification: 'required', timeout: 60000 },
                { salt: createPrfSalt() },
            );
            prfOutput = result.prfOutput;
            const wrap = await sealPasskeyWrap(raw, check.params, prfOutput, { owner: who, credentialId: result.credentialId });
            if (started !== epoch || signedInOwner() !== who || verifier.value !== check) throw new VaultLockedError();
            passkeyWraps.value = [...passkeyWraps.value.filter(w => w.credentialId !== wrap.credentialId), wrap];
            return wrap.credentialId;
        } finally {
            if (raw) raw.fill(0);
            if (prfOutput) prfOutput.fill(0);
        }
    }

    function disablePasskeyUnlock (credentialId) {
        passkeyWraps.value = passkeyWraps.value.filter(w => w.credentialId !== credentialId);
    }

    // Unlock with a passkey: server challenge -> PRF ceremony (evalByCredential over the wraps)
    // -> local unwrap + verifier check -> assertion (only) to POST vaults/unlock/passkey for a
    // short-TTL vault token -> install key. The PRF output never leaves this function.
    async function unlockWithPasskey () {
        requireEnabled();
        const who = signedInOwner();
        const check = verifier.value;
        const wraps = passkeyWraps.value;
        if (!who || !check || owner.value !== who || !wraps.length) throw new VaultLockedError();
        const started = epoch;
        const options = await passkeyService.vaultUnlockOptions(userStore.user.token);
        const { assertion, credentialId, prfOutput } = await authenticateWithPrf(options || {}, { wraps });
        let raw = null;
        try {
            const wrap = wraps.find(w => w.credentialId === credentialId);
            if (!wrap) throw new VaultEnvelopeError();
            const opened = await openPasskeyWrap(prfOutput, wrap, who);
            raw = opened.raw;
            if (!sameEnvelope(opened.params, check.params)) throw new VaultEnvelopeError();
            const unwrapped = await importVaultKey(raw);
            if (await openEnvelope(unwrapped, check, checkUsage(who)) !== VERIFIER_PLAINTEXT) throw new VaultEnvelopeError();
            if (started !== epoch || signedInOwner() !== who || verifier.value !== check) throw new VaultLockedError();
            const session = await passkeyService.vaultUnlock(userStore.user.token, assertion);
            if (started !== epoch || signedInOwner() !== who || verifier.value !== check) throw new VaultLockedError();
            key = unwrapped;
            vaultSession = vaultSessionFrom(session);
            isUnlocked.value = true;
        } finally {
            prfOutput.fill(0);
            if (raw) raw.fill(0);
        }
    }

    // { token, expiresIn (s) | expiresAt (ISO/ms) } -> closure session; null when unusable.
    function vaultSessionFrom (body) {
        if (!body || typeof body.token !== 'string' || !body.token) return null;
        let expiresAt = Date.now() + 5 * 60 * 1000;
        if (Number.isFinite(body.expiresIn)) expiresAt = Date.now() + body.expiresIn * 1000;
        else if (body.expiresAt) {
            const at = new Date(body.expiresAt).getTime();
            if (!Number.isNaN(at)) expiresAt = at;
        }
        return { token: body.token, expiresAt };
    }

    // Re-authenticate (refreshes the session's auth_time), then retry the push.
    async function retryPushAfterFreshSignIn (password) {
        requireEnabled();
        await userStore.verifyPassword({ password });
        needsFreshSignIn.value = false;
        await pushToServer();
    }

    return {
        isEnabled,
        isUnlocked,
        hasVault,
        hasRecovery,
        hasPasskeyUnlock,
        needsPhraseReset,
        needsReseal,
        records,
        serverRevision,
        hasServerVault,
        isSyncing,
        syncError,
        needsFreshSignIn,
        loadFromServer,
        pushToServer,
        retryPushAfterFreshSignIn,
        setup,
        unlock,
        unlockWithRecovery,
        enablePasskeyUnlock,
        disablePasskeyUnlock,
        unlockWithPasskey,
        resetPhrase,
        lock,
        forget,
        put,
        get,
        exportVault,
        importVault,
    };
});

export default useVaultStore;

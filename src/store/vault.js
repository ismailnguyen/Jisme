// Vault unlock lifecycle (option A, docs/vault-key-design.md), behind VAULT_UNLOCK_KEY_ENABLED.
// The derived CryptoKey lives in a closure: never reactive, never cached, never serialised.
// `records` holds ciphertext envelopes only; loadFromServer/pushToServer sync them with /vaults/primary
// (docs/vault-ux-design.md). lock/forget/setup/put/get/unlock never touch the network.
import { ref, computed, watch } from 'vue';
import { defineStore } from 'pinia';
import { useUserStore } from '@/store';
import { VAULT_UNLOCK_KEY_ENABLED } from '../utils/secrets';
import {
    createVaultParams, deriveVaultKey, sealEnvelope, openEnvelope, validatePhrase,
    assertApiSafe, vaultUsage, VaultDisabledError, VaultLockedError, VaultEnvelopeError,
} from '../utils/vaultKey';
import { encodeVaultBlob, decodeVaultBlob, sameEnvelope } from '../utils/vaultBlob';
import { VaultService, VaultApiError, isFreshSignInRequired } from '../services/VaultService';

const VERIFIER_PLAINTEXT = 'jisme-vault-ok';
const checkUsage = owner => vaultUsage('vault-check', owner);
const recordUsage = (owner, id) => vaultUsage('record', owner, String(id));
const VAULT_ID = 'primary';
const SYNC_MESSAGES = Object.freeze({
    load: 'Could not load the vault from the server.',
    save: 'Could not save the vault to the server; your changes are saved on this device only.',
    differentPhrase: 'The vault on the server was unlocked with a different phrase.',
    conflict: 'Vault sync conflict; your changes are saved on this device only.',
    freshSignIn: 'Fresh sign-in required to save the vault.',
});

const useVaultStore = defineStore('vault', () => {
    const userStore = useUserStore();
    const isEnabled = VAULT_UNLOCK_KEY_ENABLED;
    const vaultService = new VaultService();

    let key = null;
    let epoch = 0; // bumped on every lock and key install: in-flight derivations/seals/opens are discarded
    let setupInFlight = false; // only one setup may race to install a key
    const owner = ref(null);
    const verifier = ref(null);
    const records = ref({});
    const isUnlocked = ref(false);
    const hasVault = computed(() => !!verifier.value);
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

    function requireUnlocked () {
        const who = signedInOwner();
        if (!key || !who || who !== owner.value) throw new VaultLockedError();
        return { who, activeKey: key, started: epoch };
    }

    // Forget the key synchronously. Ciphertext stays so the phrase can restore the vault.
    function lock () {
        epoch++;
        key = null;
        isUnlocked.value = false;
    }

    // Forget everything for this owner (full sign-out or account switch).
    function forget () {
        lock();
        owner.value = null;
        verifier.value = null;
        records.value = {};
        loadGeneration++;
        serverRevision.value = null;
        hasServerVault.value = false;
        syncError.value = null;
        needsFreshSignIn.value = false;
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
        try {
            const started = epoch;
            const derived = await deriveVaultKey(normalized, params);
            const check = await sealEnvelope(derived, params, VERIFIER_PLAINTEXT, checkUsage(who));
            // Locked, signed out/switched, or a vault was imported meanwhile: never overwrite it.
            if (started !== epoch || signedInOwner() !== who || verifier.value) throw new VaultLockedError();
            epoch++; // any put/get holding a previous key is discarded
            owner.value = who;
            verifier.value = check;
            records.value = {};
            key = derived;
            isUnlocked.value = true;
        } finally {
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

    async function put (id, value) {
        requireEnabled();
        const { who, activeKey, started } = requireUnlocked();
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
        return assertApiSafe(JSON.parse(JSON.stringify({ owner: owner.value, verifier: verifier.value, records: records.value })));
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
        records.value = JSON.parse(JSON.stringify(data.records || {}));
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
            const res = await vaultService.getVault(userStore.user.token, VAULT_ID);
            if (!current()) return; // signed out / switched / forgotten meanwhile: discard silently
            if (!res.found) {
                hasServerVault.value = false;
                serverRevision.value = null;
                syncError.value = null;
                return;
            }
            const { check, records: serverRecords } = decodeVaultBlob(res.envelope);
            if (verifier.value && owner.value === who && sameEnvelope(verifier.value, check)) {
                records.value = { ...serverRecords, ...records.value }; // same key: keep local edits (local wins)
            } else {
                importVault({ owner: who, verifier: check, records: serverRecords }); // locks on a new verifier
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
        const putCurrent = (expectedRevision) => vaultService.putVault(userStore.user.token, VAULT_ID, {
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
                const server = await vaultService.getVault(userStore.user.token, VAULT_ID);
                if (!live()) return;
                let expected = 0;
                if (server.found) {
                    const { check, records: serverRecords } = decodeVaultBlob(server.envelope);
                    if (!sameEnvelope(check, verifier.value)) {
                        syncError.value = SYNC_MESSAGES.differentPhrase; // never overwrite another key's vault
                        return;
                    }
                    records.value = { ...serverRecords, ...records.value }; // server-only ids kept, local wins
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
        lock,
        forget,
        put,
        get,
        exportVault,
        importVault,
    };
});

export default useVaultStore;

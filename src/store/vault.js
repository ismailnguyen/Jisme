// Vault unlock lifecycle (option A, docs/vault-key-design.md), behind VAULT_UNLOCK_KEY_ENABLED.
// The derived CryptoKey lives in a closure: never reactive, never cached, never serialised.
// `records` holds ciphertext envelopes only; it stands in for the future API vault.
import { ref, computed, watch } from 'vue';
import { defineStore } from 'pinia';
import { useUserStore } from '@/store';
import { VAULT_UNLOCK_KEY_ENABLED } from '../utils/secrets';
import {
    createVaultParams, deriveVaultKey, sealEnvelope, openEnvelope, validatePhrase,
    assertApiSafe, vaultUsage, VaultDisabledError, VaultLockedError, VaultEnvelopeError,
} from '../utils/vaultKey';

const VERIFIER_PLAINTEXT = 'jisme-vault-ok';
const checkUsage = owner => vaultUsage('vault-check', owner);
const recordUsage = (owner, id) => vaultUsage('record', owner, String(id));

const useVaultStore = defineStore('vault', () => {
    const userStore = useUserStore();
    const isEnabled = VAULT_UNLOCK_KEY_ENABLED;

    let key = null;
    let epoch = 0; // bumped on every lock and key install: in-flight derivations/seals/opens are discarded
    let setupInFlight = false; // only one setup may race to install a key
    const owner = ref(null);
    const verifier = ref(null);
    const records = ref({});
    const isUnlocked = ref(false);
    const hasVault = computed(() => !!verifier.value);

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
    }

    // Auto-lock, session expiry and sign-out clear the user synchronously: follow them.
    watch(() => userStore.user?.uuid ?? null, (uuid) => {
        if (!uuid) lock();
        else if (owner.value && uuid !== owner.value) forget();
    }, { flush: 'sync' });

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

    return {
        isEnabled,
        isUnlocked,
        hasVault,
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

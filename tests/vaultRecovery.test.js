// Recovery code, phrase reset and anti-downgrade (flag forced ON; fetch mocked; WebCrypto real).
// NOTE (limitation): the setup/recovery UI in VaultUnlockPanel.vue is covered at the STORE level
// only — this suite runs in a plain node environment, so the component itself is never mounted.
import { beforeEach, describe, test, expect, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useUserStore } from '../src/store';
import useVaultStore from '../src/store/vault';
import {
    VAULT_KDF_LIMITS, createVaultParams, deriveVaultKey, deriveVaultKeyRaw, importVaultKey,
    generateRecoveryCode, encodeKeyMaterial, decodeKeyMaterial, sealEnvelope, openEnvelope,
    vaultUsage, VaultEnvelopeError, VaultLockedError,
} from '../src/utils/vaultKey';
import { encodeVaultBlob, decodeVaultBlob, toBase64url } from '../src/utils/vaultBlob';
vi.mock('../src/utils/secrets', async (original) => ({ ...await original(), VAULT_UNLOCK_KEY_ENABLED: true }));

const PHRASE = 'correct horse battery staple';
const PHRASE2 = 'a fresh and memorable second phrase';
const SECRET = 'synthetic secret value';
const LOGIN = 'synthetic login password';
const fast = { iterations: VAULT_KDF_LIMITS.minIterations, loginPassword: LOGIN };
const strong = { iterations: VAULT_KDF_LIMITS.defaultIterations, loginPassword: LOGIN };
const alice = () => ({ uuid: 'alice', token: 'synthetic-token', public_encryption_key: 'synthetic-key' });

let users, vault;
function freshStores () {
    setActivePinia(createPinia());
    users = useUserStore(); users.user = alice(); users.isLoggedIn = true;
    vault = useVaultStore();
}
beforeEach(freshStores);

const json = (status, body) => new Response(body === undefined ? '' : JSON.stringify(body), {
    status, headers: { 'Content-Type': 'application/json' },
});
const ctBlob = (envelope) => JSON.parse(Buffer.from(envelope.ct, 'base64url').toString('utf8'));

// Every request: phrases, recovery codes and plaintext secrets never leave the device —
// including inside the base64url ct (decoded before checking).
let requests;
function guarded (handler, secrets = []) {
    requests = [];
    return vi.fn(async (url, options = {}) => {
        const body = options.body === undefined ? '' : String(options.body);
        const all = [PHRASE, PHRASE2, SECRET, ...secrets];
        for (const secret of all) expect(body).not.toContain(secret);
        const parsed = body ? JSON.parse(body) : undefined;
        if (parsed?.envelope?.ct) {
            const blobJson = JSON.stringify(ctBlob(parsed.envelope));
            for (const secret of all) expect(blobJson).not.toContain(secret);
        }
        const method = options.method || 'GET';
        requests.push({ method, url: String(url), body: parsed });
        return handler({ method, url: String(url), body: parsed }, requests.length);
    });
}

// Builds a server-side vault (exported + API envelope) in an isolated pinia, then gives fresh stores.
async function serverVault (entries = { one: { password: SECRET } }, opts = fast, phrase = PHRASE) {
    setActivePinia(createPinia());
    const u = useUserStore(); u.user = alice(); u.isLoggedIn = true;
    const v = useVaultStore();
    const code = await v.setup(phrase, opts);
    for (const [id, value] of Object.entries(entries)) await v.put(id, value);
    const exported = v.exportVault();
    freshStores();
    return { code, exported, envelope: encodeVaultBlob(exported) };
}

describe('recovery primitives (vaultKey)', () => {
    test('generateRecoveryCode: 32-char base64url (24 bytes), unique per call', () => {
        const code = generateRecoveryCode();
        expect(code).toMatch(/^[A-Za-z0-9_-]{32}$/);
        expect(generateRecoveryCode()).not.toBe(code);
        expect(generateRecoveryCode()).not.toBe(code);
    });

    test('deriveVaultKeyRaw imports to exactly the key deriveVaultKey produces', async () => {
        const params = createVaultParams(fast);
        const viaDerive = await deriveVaultKey(PHRASE, params);
        const raw = await deriveVaultKeyRaw(PHRASE, params);
        const viaImport = await importVaultKey(raw);
        const sealed = await sealEnvelope(viaDerive, params, 'round trip', 'test-usage');
        await expect(openEnvelope(viaImport, sealed, 'test-usage')).resolves.toBe('round trip');
        raw.fill(0);
    });

    test('recovery wrap/unwrap roundtrip; wrong code and junk key material fail uniformly', async () => {
        const params = createVaultParams(fast);
        const raw = await deriveVaultKeyRaw(PHRASE, params);
        const key = await importVaultKey(raw);
        const check = await sealEnvelope(key, params, 'jisme-vault-ok', 'check-usage');
        const code = generateRecoveryCode();
        const recoveryParams = createVaultParams(fast);
        const recoveryKey = await deriveVaultKey(code, recoveryParams);
        const usage = vaultUsage('vault-recovery', 'alice');
        const envelope = await sealEnvelope(recoveryKey, recoveryParams,
            JSON.stringify({ key: encodeKeyMaterial(raw), params }), usage);
        const again = await deriveVaultKey(code, envelope.params);
        const payload = JSON.parse(await openEnvelope(again, envelope, usage));
        expect(payload.params).toEqual(params);
        const recoveredRaw = decodeKeyMaterial(payload.key);
        const recovered = await importVaultKey(recoveredRaw);
        await expect(openEnvelope(recovered, check, 'check-usage')).resolves.toBe('jisme-vault-ok');
        // wrong recovery code
        const wrong = await deriveVaultKey(generateRecoveryCode(), envelope.params);
        await expect(openEnvelope(wrong, envelope, usage)).rejects.toThrow(VaultEnvelopeError);
        // junk / wrong-length key material
        for (const bad of ['', 'AAAA', 42, null, 'not base64!!']) {
            expect(() => decodeKeyMaterial(bad)).toThrow(VaultEnvelopeError);
        }
        raw.fill(0); recoveredRaw.fill(0);
    });
});

describe('recovery code in the store', () => {
    test('setup returns the recovery code exactly once and never retains it in state', async () => {
        const code = await vault.setup(PHRASE, fast);
        expect(code).toMatch(/^[A-Za-z0-9_-]{32}$/);
        expect(vault.hasRecovery).toBe(true);
        const exported = vault.exportVault();
        expect(exported.recovery.version).toBe(1);
        expect(exported.recovery.alg).toBe('PBKDF2-SHA256/AES-256-GCM');
        expect(JSON.stringify(exported) + JSON.stringify(vault.$state)).not.toContain(code);
        expect(JSON.stringify(exported)).not.toContain(PHRASE);
    });

    test('unlockWithRecovery unlocks and demands a phrase reset; wrong code stays locked', async () => {
        const code = await vault.setup(PHRASE, fast);
        await vault.put('one', { password: SECRET });
        vault.lock();
        await expect(vault.unlockWithRecovery(generateRecoveryCode())).rejects.toThrow(VaultEnvelopeError);
        expect(vault.isUnlocked).toBe(false);
        await vault.unlockWithRecovery(code);
        expect(vault.isUnlocked).toBe(true);
        expect(vault.needsPhraseReset).toBe(true);
        expect(await vault.get('one')).toEqual({ password: SECRET });
    });

    test('tampered recovery payload (params lie) is rejected even with the right code', async () => {
        const code = await vault.setup(PHRASE, fast);
        vault.lock();
        const exported = vault.exportVault();
        const rParams = exported.recovery.params;
        const rKey = await deriveVaultKey(code, rParams);
        const usage = vaultUsage('vault-recovery', 'alice');
        const payload = JSON.parse(await openEnvelope(rKey, exported.recovery, usage));
        payload.params = createVaultParams(fast); // claims different phrase params
        const tampered = await sealEnvelope(rKey, rParams, JSON.stringify(payload), usage);
        vault.importVault({ ...exported, recovery: tampered });
        await expect(vault.unlockWithRecovery(code)).rejects.toThrow(VaultEnvelopeError);
        expect(vault.isUnlocked).toBe(false);
    });

    test('phrase reset end-to-end: old phrase stops working, new phrase and new code do', async () => {
        const code = await vault.setup(PHRASE, fast);
        await vault.put('one', { password: SECRET });
        vault.lock();
        await vault.unlockWithRecovery(code);
        const code2 = await vault.resetPhrase(PHRASE2, fast);
        expect(code2).toMatch(/^[A-Za-z0-9_-]{32}$/);
        expect(code2).not.toBe(code);
        expect(vault.needsPhraseReset).toBe(false);
        expect(vault.isUnlocked).toBe(true);
        await vault.put('two', { b: 2 });
        vault.lock();
        await expect(vault.unlock(PHRASE)).rejects.toThrow(VaultEnvelopeError);
        await vault.unlock(PHRASE2);
        expect(await vault.get('one')).toEqual({ password: SECRET });
        expect(await vault.get('two')).toEqual({ b: 2 });
        vault.lock();
        await vault.unlockWithRecovery(code2);
        expect(vault.isUnlocked).toBe(true);
        vault.lock();
        await expect(vault.unlockWithRecovery(code)).rejects.toThrow(VaultEnvelopeError);
        expect(vault.isUnlocked).toBe(false);
    });

    test('resetPhrase enforces the same phrase policy as setup', async () => {
        await vault.setup(PHRASE, fast);
        await vault.unlock(PHRASE);
        await expect(vault.resetPhrase('short', fast)).rejects.toThrow(/12/);
        await expect(vault.resetPhrase(PHRASE2, { iterations: fast.iterations })).rejects.toThrow(/login password/i);
        await expect(vault.resetPhrase(PHRASE2, { ...fast, loginPassword: PHRASE2 })).rejects.toThrow(/login password/i);
        expect(vault.isUnlocked).toBe(true); // failed resets never lock or mutate the vault
        expect((await vault.get('missing') ?? null)).toBeNull();
    });

    test('a legacy v1 blob (no recovery envelope) still loads; re-seal restores recovery', async () => {
        const { exported } = await serverVault();
        const v1 = { v: 1, ct: toBase64url(JSON.stringify({
            version: 1, check: exported.verifier, records: exported.records,
        })) };
        expect(decodeVaultBlob(v1).recovery).toBeUndefined();
        vi.stubGlobal('fetch', guarded(() => json(200, { vaultId: 'primary', revision: 1, envelope: v1 })));
        await vault.loadFromServer();
        expect(vault.hasVault).toBe(true);
        expect(vault.hasRecovery).toBe(false);
        // No recovery envelope: a state error (VaultLockedError), not a crypto oracle.
        await expect(vault.unlockWithRecovery('legacy vaults have no code')).rejects.toThrow(VaultLockedError);
        await vault.unlock(PHRASE);
        // The weak legacy vault must re-seal at (at least) the client default, not stay weak.
        await expect(vault.resetPhrase(PHRASE2, fast)).rejects.toThrow(/iterations/i);
        const code = await vault.resetPhrase(PHRASE2, strong);
        expect(vault.hasRecovery).toBe(true);
        vault.lock();
        await vault.unlockWithRecovery(code);
        expect(vault.isUnlocked).toBe(true);
    });

    test('no recovery code, phrase or secret ever appears in a request body (decode ct too)', async () => {
        const secrets = [];
        let stored = null;
        const handler = ({ method, body }) => {
            if (method === 'PUT') { stored = body.envelope; return json(201, { vaultId: 'primary', revision: 1 }); }
            return stored ? json(200, { vaultId: 'primary', revision: 1, envelope: stored }) : json(404, {});
        };
        const code1 = await vault.setup(PHRASE, fast);
        secrets.push(code1);
        await vault.put('one', { password: SECRET });
        vi.stubGlobal('fetch', guarded(handler, secrets));
        await vault.pushToServer();
        const blob1 = ctBlob(stored);
        expect(blob1.version).toBe(2);
        expect(blob1.recovery.version).toBe(1);
        freshStores();
        vi.stubGlobal('fetch', guarded(handler, secrets));
        await vault.loadFromServer();
        await vault.unlockWithRecovery(code1);
        const code2 = await vault.resetPhrase(PHRASE2, strong);
        secrets.push(code2);
        await vault.pushToServer();
        const blob2 = ctBlob(stored);
        expect(blob2.check.params.iterations).toBe(VAULT_KDF_LIMITS.defaultIterations);
        expect(blob2.recovery.version).toBe(1);
        vault.lock();
        await vault.unlock(PHRASE2);
        expect(await vault.get('one')).toEqual({ password: SECRET });
        // Second phase: one GET (load) and one PUT (post-reset push), nothing else.
        expect(requests.map(r => r.method)).toEqual(['GET', 'PUT']);
    });
});

describe('anti-downgrade (client-side param policy)', () => {
    test('unpinned client accepts a weak legacy vault read-only, then re-seals and pushes strong params', async () => {
        const { envelope } = await serverVault(); // fast: 100k < client default 600k
        vi.stubGlobal('fetch', guarded(({ method }) => method === 'GET'
            ? json(200, { vaultId: 'primary', revision: 3, envelope })
            : json(201, { vaultId: 'primary', revision: 4 })));
        await vault.loadFromServer();
        expect(vault.hasVault).toBe(true);
        expect(vault.needsReseal).toBe(true); // advisory: accepted, but flagged
        expect(vault.syncError).toBeNull();
        await vault.unlock(PHRASE);
        await expect(vault.put('two', { b: 2 })).rejects.toThrow(VaultEnvelopeError); // refuse to seal weak
        expect(await vault.get('one')).toEqual({ password: SECRET }); // reading still works
        const code = await vault.resetPhrase(PHRASE2, strong); // re-seal under strong params
        expect(vault.needsReseal).toBe(false);
        await vault.put('two', { b: 2 });
        await vault.pushToServer();
        const put = requests.find(r => r.method === 'PUT');
        expect(put.body.expectedRevision).toBe(3);
        const blob = ctBlob(put.body.envelope);
        expect(blob.version).toBe(2);
        expect(blob.check.params.iterations).toBe(VAULT_KDF_LIMITS.defaultIterations);
        expect(blob.recovery.version).toBe(1);
        expect(blob.records.two).toBeDefined();
        vault.lock();
        await expect(vault.unlock(PHRASE)).rejects.toThrow(VaultEnvelopeError);
        await vault.unlock(PHRASE2);
        expect(await vault.get('one')).toEqual({ password: SECRET });
        vault.lock();
        await vault.unlockWithRecovery(code);
        expect(vault.isUnlocked).toBe(true);
    });

    test('pinned client refuses a weaker server vault outright and keeps its own records', async () => {
        const { envelope } = await serverVault({ evil: { a: 2 } }); // attacker/server downgraded vault
        await vault.setup(PHRASE, strong); // pins the client floor at the default (600k)
        await vault.put('local', { a: 1 });
        const before = vault.exportVault();
        vi.stubGlobal('fetch', guarded(() => json(200, { vaultId: 'primary', revision: 9, envelope })));
        await vault.loadFromServer();
        expect(vault.needsReseal).toBe(true);
        expect(vault.syncError).toMatch(/re-seal/i);
        expect(vault.exportVault()).toEqual(before); // nothing imported
        expect(vault.hasServerVault).toBe(false);
        await vault.put('local2', { b: 2 }); // its own strong vault still seals fine
        const code = await vault.resetPhrase(PHRASE, strong); // re-seal clears the state
        expect(vault.needsReseal).toBe(false);
        vi.stubGlobal('fetch', guarded(({ method }) => method === 'PUT'
            ? json(201, { vaultId: 'primary', revision: 10 })
            : json(200, { vaultId: 'primary', revision: 9, envelope })));
        await vault.pushToServer();
        vault.lock();
        await vault.unlockWithRecovery(code);
        expect(await vault.get('local2')).toEqual({ b: 2 });
    });

    test('resetPhrase refuses to re-seal below the pinned floor', async () => {
        await vault.setup(PHRASE, strong);
        await vault.unlock(PHRASE);
        await expect(vault.resetPhrase(PHRASE2, fast)).rejects.toThrow(/iterations/i);
        expect(vault.needsReseal).toBe(false);
        expect(vault.isUnlocked).toBe(true);
    });
});

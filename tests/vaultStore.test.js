// Store lifecycle with the feature flag forced ON (config only; WebCrypto stays real).
import { beforeEach, test, expect, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useUserStore } from '../src/store';
import useVaultStore from '../src/store/vault';
import { VAULT_KDF_LIMITS, VaultEnvelopeError, VaultLockedError, assertApiSafe } from '../src/utils/vaultKey';
vi.mock('../src/utils/secrets', async (original) => ({ ...await original(), VAULT_UNLOCK_KEY_ENABLED: true }));

const PHRASE = 'correct horse battery staple';
const OTHER_PHRASE = 'another sufficiently long phrase';
// setup() requires the login password (M2); a synthetic one keeps the policy check active.
const fast = { iterations: VAULT_KDF_LIMITS.minIterations, loginPassword: 'synthetic login password' };
const alice = () => ({ uuid: 'alice', token: 'synthetic-token', public_encryption_key: 'synthetic-key' });
const keysOf = (value) => value && typeof value === 'object'
    ? Object.entries(value).flatMap(([k, v]) => [k, ...keysOf(v)]) : [];
let users, vault;
beforeEach(() => {
    setActivePinia(createPinia());
    users = useUserStore(); users.user = alice(); users.isLoggedIn = true;
    vault = useVaultStore();
});

test('setup derives the key locally and seals records without any network call', async () => {
    expect(vault.isEnabled).toBe(true);
    await vault.setup(PHRASE, fast);
    expect(vault.isUnlocked).toBe(true);
    expect(vault.hasVault).toBe(true);
    await vault.put('one', { password: 'synthetic secret' });
    expect(await vault.get('one')).toEqual({ password: 'synthetic secret' });
    expect(JSON.stringify(vault.exportVault())).not.toContain('synthetic secret');
    expect(fetch).not.toHaveBeenCalled();
});

test('lock forgets the key; unlocking with the phrase restores the in-memory vault', async () => {
    await vault.setup(PHRASE, fast);
    await vault.put('one', { password: 'synthetic secret' });
    vault.lock();
    expect(vault.isUnlocked).toBe(false);
    expect(vault.hasVault).toBe(true);
    await expect(vault.get('one')).rejects.toThrow(VaultLockedError);
    await expect(vault.put('two', {})).rejects.toThrow(VaultLockedError);
    await vault.unlock(PHRASE);
    expect(vault.isUnlocked).toBe(true);
    expect(await vault.get('one')).toEqual({ password: 'synthetic secret' });
});

test('wrong phrase is rejected and leaves the vault locked', async () => {
    await vault.setup(PHRASE, fast);
    vault.lock();
    await expect(vault.unlock('definitely the wrong phrase')).rejects.toThrow(VaultEnvelopeError);
    expect(vault.isUnlocked).toBe(false);
});

test('setup enforces phrase policy, including distinct from the login password', async () => {
    await expect(vault.setup('short', fast)).rejects.toThrow(/12/);
    await expect(vault.setup(PHRASE, { ...fast, loginPassword: PHRASE })).rejects.toThrow(/login password/i);
    expect(vault.hasVault).toBe(false);
});

test('automatic lock revokes the vault key synchronously, before any await', async () => {
    await vault.setup(PHRASE, fast);
    const locking = users.lock('Idle', { force: true });
    expect(vault.isUnlocked).toBe(false);
    await locking;
    expect(vault.hasVault).toBe(true);
    users.user = alice(); users.isLoggedIn = true;
    await vault.unlock(PHRASE);
    expect(vault.isUnlocked).toBe(true);
});

test('unlock requires the signed-in owner of the vault', async () => {
    await vault.setup(PHRASE, fast);
    await users.lock();
    await expect(vault.unlock(PHRASE)).rejects.toThrow(VaultLockedError);
    expect(vault.isUnlocked).toBe(false);
});

test('a different account signing in forgets the previous vault entirely', async () => {
    await vault.setup(PHRASE, fast);
    await vault.put('one', { password: 'synthetic secret' });
    await users.lock();
    users.user = { uuid: 'bob', token: 'b', public_encryption_key: 'k' }; users.isLoggedIn = true;
    expect(vault.hasVault).toBe(false);
    expect(vault.exportVault()).toBeNull();
});

test('full sign-out (no cache preservation) forgets verifier and ciphertext', async () => {
    await vault.setup(PHRASE, fast);
    await vault.put('one', { a: 1 });
    await users.signOut();
    expect(vault.isUnlocked).toBe(false);
    expect(vault.hasVault).toBe(false);
});

test('a lock during an in-flight unlock wins: the derived key is never installed', async () => {
    await vault.setup(PHRASE, fast);
    vault.lock();
    const unlocking = vault.unlock(PHRASE);
    vault.lock();
    await expect(unlocking).rejects.toThrow(VaultLockedError);
    expect(vault.isUnlocked).toBe(false);
});

test('records are bound to their id: swapping ciphertexts is detected', async () => {
    await vault.setup(PHRASE, fast);
    await vault.put('one', { a: 1 });
    await vault.put('two', { a: 2 });
    const exported = vault.exportVault();
    vault.importVault({ ...exported, records: { one: exported.records.two, two: exported.records.one } });
    await expect(vault.get('one')).rejects.toThrow(VaultEnvelopeError);
});

test('exported vault is API-safe: envelopes only, no PRF fields, phrase or key', async () => {
    await vault.setup(PHRASE, fast);
    await vault.put('one', { a: 1 });
    const exported = vault.exportVault();
    expect(() => assertApiSafe(exported)).not.toThrow();
    expect(keysOf(exported).filter(k => /prf/i.test(k))).toEqual([]);
    expect(JSON.stringify(exported)).not.toContain(PHRASE);
    expect(exported).toMatchObject({ owner: 'alice', verifier: { version: 1 }, records: { one: { version: 1 } } });
});

// --- review fixes ---

test('M1: two parallel setups cannot both succeed; the surviving phrase unlocks', async () => {
    const results = await Promise.allSettled([vault.setup(PHRASE, fast), vault.setup(OTHER_PHRASE, fast)]);
    expect(results.map(r => r.status)).toEqual(['fulfilled', 'rejected']);
    vault.lock();
    await expect(vault.unlock(OTHER_PHRASE)).rejects.toThrow(VaultEnvelopeError);
    await vault.unlock(PHRASE);
    expect(vault.isUnlocked).toBe(true);
});

test('M1: a put between racing setups is never sealed under an orphaned key', async () => {
    const first = vault.setup(PHRASE, fast);
    const second = vault.setup(OTHER_PHRASE, fast).catch(err => err);
    await first;
    await vault.put('one', { a: 1 });
    await second;
    vault.lock();
    await vault.unlock(PHRASE);
    expect(await vault.get('one')).toEqual({ a: 1 });
});

test('M1: a setup may run again after a failed one (guard is released)', async () => {
    await expect(vault.setup('short', fast)).rejects.toThrow(/12/);
    await vault.setup(PHRASE, fast);
    expect(vault.isUnlocked).toBe(true);
});

test('M1: a vault imported during an in-flight setup is never overwritten', async () => {
    await vault.setup(PHRASE, fast);
    await vault.put('one', { a: 1 });
    const exported = vault.exportVault();
    vault.forget();
    const setting = vault.setup(OTHER_PHRASE, fast);
    vault.importVault(exported);
    await expect(setting).rejects.toThrow(VaultLockedError);
    await vault.unlock(PHRASE);
    expect(await vault.get('one')).toEqual({ a: 1 });
});

test('M2: setup requires the login password and compares it normalised', async () => {
    const { iterations } = fast;
    await expect(vault.setup(PHRASE, { iterations })).rejects.toThrow(/login password/i);
    await expect(vault.setup(PHRASE, { iterations, loginPassword: '' })).rejects.toThrow(/login password/i);
    await expect(vault.setup(PHRASE, { iterations, loginPassword: ' CORRECT Horse Battery Staple\n' })).rejects.toThrow(/login password/i);
    expect(vault.hasVault).toBe(false);
});

test('M3: unlock against a malformed verifier always fails with the uniform error', async () => {
    await vault.setup(PHRASE, fast);
    const exported = vault.exportVault();
    for (const params of [
        { ...exported.verifier.params, salt: 'not base64!!' },
        { ...exported.verifier.params, iterations: 10 },
        { ...exported.verifier.params, salt: 42 },
    ]) {
        vault.importVault({ ...exported, verifier: { ...exported.verifier, params } });
        const error = await vault.unlock(PHRASE).catch(err => err);
        expect(error).toBeInstanceOf(VaultEnvelopeError);
        expect(vault.isUnlocked).toBe(false);
    }
});

test('L1: record ids that shadow Object.prototype are just ordinary ids', async () => {
    await vault.setup(PHRASE, fast);
    for (const id of ['toString', 'constructor', 'hasOwnProperty', '__proto__', 'valueOf']) {
        expect(await vault.get(id)).toBeUndefined();
    }
    await vault.put('constructor', { a: 1 });
    await vault.put('__proto__', { b: 2 });
    expect(await vault.get('constructor')).toEqual({ a: 1 });
    expect(await vault.get('__proto__')).toEqual({ b: 2 });
    expect(await vault.get('toString')).toBeUndefined();
    vault.importVault(vault.exportVault());
    expect(await vault.get('__proto__')).toEqual({ b: 2 });
});

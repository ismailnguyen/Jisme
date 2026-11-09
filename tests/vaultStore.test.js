// Store lifecycle with the feature flag forced ON (config only; WebCrypto stays real).
import { beforeEach, test, expect, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useUserStore } from '../src/store';
import useVaultStore from '../src/store/vault';
import { VAULT_KDF_LIMITS, VaultEnvelopeError, VaultLockedError, assertApiSafe } from '../src/utils/vaultKey';
vi.mock('../src/utils/secrets', async (original) => ({ ...await original(), VAULT_UNLOCK_KEY_ENABLED: true }));

const PHRASE = 'correct horse battery staple';
const fast = { iterations: VAULT_KDF_LIMITS.minIterations };
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

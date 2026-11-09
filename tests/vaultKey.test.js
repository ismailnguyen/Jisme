// Real WebCrypto (Node 22 globalThis.crypto); nothing in the crypto path is mocked.
import { test, expect, describe, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import {
    VAULT_ENVELOPE_VERSION, VAULT_ALG, VAULT_KDF_LIMITS,
    createVaultParams, deriveVaultKey, sealEnvelope, openEnvelope,
    validatePhrase, assertApiSafe, vaultUsage, VaultEnvelopeError, VaultDisabledError,
} from '../src/utils/vaultKey';
import { VAULT_UNLOCK_KEY_ENABLED } from '../src/utils/secrets';
import { useUserStore } from '../src/store';
import useVaultStore from '../src/store/vault';

const PHRASE = 'correct horse battery staple';
const fast = () => createVaultParams({ iterations: VAULT_KDF_LIMITS.minIterations });
const keysOf = (value) => value && typeof value === 'object'
    ? Object.entries(value).flatMap(([k, v]) => [k, ...keysOf(v)]) : [];

describe('key derivation', () => {
    test('defaults to bounded PBKDF2-SHA-256 params with a fresh 16-byte salt', () => {
        const a = createVaultParams(), b = createVaultParams();
        expect(a).toMatchObject({ kdf: 'PBKDF2', hash: 'SHA-256', iterations: 600000 });
        expect(atob(a.salt)).toHaveLength(16);
        expect(a.salt).not.toBe(b.salt);
        expect(() => createVaultParams({ iterations: 1000 })).toThrow();
        expect(() => createVaultParams({ iterations: 50_000_000 })).toThrow();
    });

    test('derives a non-extractable AES-GCM key restricted to encrypt/decrypt', async () => {
        const key = await deriveVaultKey(PHRASE, fast());
        expect(key.extractable).toBe(false);
        expect(key.algorithm).toMatchObject({ name: 'AES-GCM', length: 256 });
        expect([...key.usages].sort()).toEqual(['decrypt', 'encrypt']);
    });

    test('rejects out-of-bounds or malformed params before doing any work', async () => {
        const params = fast();
        for (const bad of [
            { ...params, iterations: 1 },
            { ...params, iterations: 10_000_000_000 },
            { ...params, iterations: 150000.5 },
            { ...params, salt: btoa('short') },
            { ...params, hash: 'SHA-1' },
            { ...params, kdf: 'scrypt' },
            null,
        ]) {
            await expect(deriveVaultKey(PHRASE, bad)).rejects.toThrow(VaultEnvelopeError);
        }
    });

    test('phrase policy: minimum length and distinct from the login password', () => {
        expect(() => validatePhrase('short')).toThrow(/12/);
        expect(() => validatePhrase(PHRASE, { loginPassword: PHRASE })).toThrow(/login password/i);
        expect(validatePhrase(PHRASE, { loginPassword: 'other password' })).toBe(PHRASE.normalize('NFKC'));
    });

    test('phrase is NFKC-normalised so equivalent unicode input unlocks', async () => {
        const params = fast();
        const composed = await deriveVaultKey('café au lait phrase', params);
        const decomposed = await deriveVaultKey('café au lait phrase', params);
        const env = await sealEnvelope(composed, params, 'x', 'test');
        expect(await openEnvelope(decomposed, env, 'test')).toBe('x');
    });
});

describe('envelope v1', () => {
    test('round-trips with the documented versioned shape and per-use nonces', async () => {
        const params = fast();
        const key = await deriveVaultKey(PHRASE, params);
        const a = await sealEnvelope(key, params, 'secret value', 'record:alice:1');
        const b = await sealEnvelope(key, params, 'secret value', 'record:alice:1');
        expect(Object.keys(a).sort()).toEqual(['alg', 'ciphertext', 'nonce', 'params', 'version']);
        expect(a).toMatchObject({ version: VAULT_ENVELOPE_VERSION, alg: VAULT_ALG, params });
        expect(VAULT_ENVELOPE_VERSION).toBe(1);
        expect(atob(a.nonce)).toHaveLength(12);
        expect(a.nonce).not.toBe(b.nonce);
        expect(a.ciphertext).not.toBe(b.ciphertext);
        expect(JSON.stringify(a)).not.toContain('secret value');
        expect(await openEnvelope(key, a, 'record:alice:1')).toBe('secret value');
    });

    test('usage binding: envelope cannot be replayed under another purpose or owner', async () => {
        const params = fast();
        const key = await deriveVaultKey(PHRASE, params);
        const env = await sealEnvelope(key, params, 'v', 'record:alice:1');
        for (const usage of ['record:alice:2', 'record:bob:1', 'vault-check:alice']) {
            await expect(openEnvelope(key, env, usage)).rejects.toThrow(VaultEnvelopeError);
        }
    });

    test('wrong phrase and any tampering fail with one generic error', async () => {
        const params = fast();
        const key = await deriveVaultKey(PHRASE, params);
        const wrong = await deriveVaultKey('not the right phrase!', params);
        const env = await sealEnvelope(key, params, 'v', 'u');
        const flip = (b64) => { const s = atob(b64); return btoa(String.fromCharCode(s.charCodeAt(0) ^ 1) + s.slice(1)); };
        const variants = [
            [wrong, env],
            [key, { ...env, ciphertext: flip(env.ciphertext) }],
            [key, { ...env, nonce: flip(env.nonce) }],
            [key, { ...env, nonce: btoa('short') }],
            [key, { ...env, version: 2 }],
            [key, { ...env, alg: 'AES-CBC' }],
            [key, { ...env, params: { ...params, iterations: params.iterations + 1 } }],
            [key, { ...env, params: { ...params, iterations: 1 } }],
            [key, { ...env, ciphertext: undefined }],
            [key, null],
        ];
        const messages = new Set();
        for (const [k, e] of variants) {
            const error = await openEnvelope(k, e, 'u').catch(err => err);
            expect(error).toBeInstanceOf(VaultEnvelopeError);
            messages.add(error.message);
        }
        expect(messages.size).toBe(1);
    });

    test('envelopes are API-safe: no PRF-named fields, phrase or key material', async () => {
        const params = fast();
        const key = await deriveVaultKey(PHRASE, params);
        const env = await sealEnvelope(key, params, 'v', 'u');
        expect(keysOf(env).filter(k => /prf/i.test(k))).toEqual([]);
        expect(JSON.stringify(env)).not.toContain(PHRASE);
        expect(() => assertApiSafe(env)).not.toThrow();
        expect(() => assertApiSafe({ envelope: env, extensions: { prf: { first: 'x' } } })).toThrow(/prf/i);
        expect(() => assertApiSafe({ PRFOutput: 'x' })).toThrow(/prf/i);
        expect(() => assertApiSafe({ key })).toThrow();
        expect(() => assertApiSafe({ raw: new Uint8Array(4) })).toThrow();
    });
});

describe('review fixes', () => {
    test('M2: login-password check folds case, width and surrounding whitespace', () => {
        for (const login of [' Correct Horse Battery Staple ', 'CORRECT HORSE BATTERY STAPLE\t', 'ｃｏｒｒｅｃｔ horse battery staple']) {
            expect(() => validatePhrase(PHRASE, { loginPassword: login })).toThrow(/login password/i);
        }
        expect(() => validatePhrase('Straße und mehr text', { loginPassword: 'STRASSE UND MEHR TEXT' })).toThrow(/login password/i);
    });

    test('M3: every derive failure is the same VaultEnvelopeError (bad base64, KDF errors)', async () => {
        const params = fast();
        const bad = [
            () => deriveVaultKey(PHRASE, { ...params, salt: 'not base64!!' }),
            () => deriveVaultKey(PHRASE, { ...params, salt: '%%%%' }),
            () => deriveVaultKey(PHRASE, { get kdf () { throw new TypeError('boom'); } }),
        ];
        for (const run of bad) {
            const error = await run().catch(err => err);
            expect(error).toBeInstanceOf(VaultEnvelopeError);
            expect(error.message).toBe(new VaultEnvelopeError().message);
        }
        const spy = vi.spyOn(globalThis.crypto.subtle, 'deriveKey').mockRejectedValueOnce(new DOMException('x', 'OperationError'));
        try {
            await expect(deriveVaultKey(PHRASE, params)).rejects.toThrow(VaultEnvelopeError);
        } finally {
            spy.mockRestore();
        }
    });

    test('M3: sealEnvelope with a non-base64 salt fails as VaultEnvelopeError, not DOMException', async () => {
        const params = fast();
        const key = await deriveVaultKey(PHRASE, params);
        await expect(sealEnvelope(key, { ...params, salt: 'not base64!!' }, 'v', 'u')).rejects.toThrow(VaultEnvelopeError);
    });

    test('L2: usage strings are unambiguous JSON arrays (no separator collisions)', () => {
        expect(vaultUsage('record', 'a', 'b:c')).not.toBe(vaultUsage('record', 'a:b', 'c'));
        expect(vaultUsage('record', 'alice', '1')).toBe(JSON.stringify(['record', 'alice', '1']));
        expect(vaultUsage('vault-check', 'alice')).not.toBe(vaultUsage('record', 'alice'));
    });
});

describe('feature flag', () => {
    test('is OFF by default so production behaviour is unchanged', () => {
        expect(VAULT_UNLOCK_KEY_ENABLED).toBe(false);
    });

    test('vault store refuses to derive or store anything while disabled', async () => {
        setActivePinia(createPinia());
        const users = useUserStore(); users.user = { uuid: 'alice', token: 't' }; users.isLoggedIn = true;
        const vault = useVaultStore();
        expect(vault.isEnabled).toBe(false);
        await expect(vault.setup(PHRASE)).rejects.toThrow(VaultDisabledError);
        await expect(vault.unlock(PHRASE)).rejects.toThrow(VaultDisabledError);
        await expect(vault.put('1', { a: 1 })).rejects.toThrow(VaultDisabledError);
        expect(vault.isUnlocked).toBe(false);
        expect(vault.hasVault).toBe(false);
        expect(fetch).not.toHaveBeenCalled();
    });
});

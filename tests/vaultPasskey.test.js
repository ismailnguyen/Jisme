// Passkey (WebAuthn PRF) vault unlock: pure derivation + wrap codec (docs/passkey-ux-design.md).
// WebCrypto stays real; no network, no WebAuthn.
import { describe, test, expect } from 'vitest';
import { hkdfSync } from 'node:crypto';
import {
    PASSKEY_WRAP_VERSION, PASSKEY_WRAP_ALG, PRF_SALT_BYTES,
    createPrfSalt, derivePasskeyWrapBits, derivePasskeyWrapKey,
    sealPasskeyWrap, openPasskeyWrap, isPasskeyWrap, extractPrfOutput,
} from '../src/utils/vaultPasskey';
import { VaultEnvelopeError, assertApiSafe } from '../src/utils/vaultKey';
import { encodeVaultBlob, decodeVaultBlob, fromBase64url, toBase64url } from '../src/utils/vaultBlob';

const prf = (fill) => new Uint8Array(32).fill(fill);
const RAW = () => new Uint8Array(32).map((_, i) => i + 1);
const PARAMS = { kdf: 'PBKDF2', hash: 'SHA-256', iterations: 100000, salt: 'AAAAAAAAAAAAAAAAAAAAAA==' };
const ctx = (over = {}) => ({ owner: 'alice', credentialId: 'cred-1', salt: toBase64url(new Uint8Array(32).fill(9)), ...over });

describe('PRF bytes -> unlock key', () => {
    test('derivePasskeyWrapBits is HKDF-SHA-256(prf, salt, info bound to owner + credential)', async () => {
        const c = ctx();
        const bits = await derivePasskeyWrapBits(prf(7), c);
        const info = JSON.stringify(['jisme/vault-passkey/v1', 'alice', 'cred-1']);
        const expected = new Uint8Array(hkdfSync('sha256', prf(7), fromBase64url(c.salt), info, 32));
        expect(bits).toEqual(expected);
        expect(bits.length).toBe(32);
    });

    test('derivation is deterministic and domain separated', async () => {
        const a = await derivePasskeyWrapBits(prf(7), ctx());
        expect(await derivePasskeyWrapBits(prf(7), ctx())).toEqual(a);
        expect(await derivePasskeyWrapBits(prf(8), ctx())).not.toEqual(a);
        expect(await derivePasskeyWrapBits(prf(7), ctx({ owner: 'bob' }))).not.toEqual(a);
        expect(await derivePasskeyWrapBits(prf(7), ctx({ credentialId: 'cred-2' }))).not.toEqual(a);
        expect(await derivePasskeyWrapBits(prf(7), ctx({ salt: createPrfSalt() }))).not.toEqual(a);
    });

    test('the derived CryptoKey is non-extractable AES-GCM', async () => {
        const key = await derivePasskeyWrapKey(prf(7), ctx());
        expect(key.extractable).toBe(false);
        expect(key.algorithm.name).toBe('AES-GCM');
    });

    test('short or non-byte PRF output is rejected uniformly', async () => {
        await expect(derivePasskeyWrapBits(new Uint8Array(16), ctx())).rejects.toThrow(VaultEnvelopeError);
        await expect(derivePasskeyWrapBits('not bytes', ctx())).rejects.toThrow(VaultEnvelopeError);
        await expect(derivePasskeyWrapBits(prf(1), ctx({ salt: 'short' }))).rejects.toThrow(VaultEnvelopeError);
    });

    test('createPrfSalt is 32 random bytes, base64url', () => {
        const a = createPrfSalt(); const b = createPrfSalt();
        expect(fromBase64url(a).length).toBe(PRF_SALT_BYTES);
        expect(a).not.toBe(b);
    });
});

describe('passkey wrap', () => {
    test('seal/open round-trips the raw vault key and its params', async () => {
        const wrap = await sealPasskeyWrap(RAW(), PARAMS, prf(7), { owner: 'alice', credentialId: 'cred-1' });
        expect(wrap).toMatchObject({ version: PASSKEY_WRAP_VERSION, alg: PASSKEY_WRAP_ALG, credentialId: 'cred-1' });
        expect(isPasskeyWrap(wrap)).toBe(true);
        const { raw, params } = await openPasskeyWrap(prf(7), wrap, 'alice');
        expect(raw).toEqual(RAW());
        expect(params).toEqual(PARAMS);
    });

    test('the wrap never contains the PRF output nor the raw key, and is API-safe', async () => {
        const output = prf(7);
        const wrap = await sealPasskeyWrap(RAW(), PARAMS, output, { owner: 'alice', credentialId: 'cred-1' });
        const text = JSON.stringify(wrap);
        expect(text).not.toContain(toBase64url(output));
        expect(text).not.toContain(Buffer.from(output).toString('base64'));
        expect(text).not.toContain(Buffer.from(RAW()).toString('base64'));
        expect(() => assertApiSafe(wrap)).not.toThrow();
    });

    test('wrong PRF output, wrong owner or tampering fail with the uniform error', async () => {
        const wrap = await sealPasskeyWrap(RAW(), PARAMS, prf(7), { owner: 'alice', credentialId: 'cred-1' });
        await expect(openPasskeyWrap(prf(8), wrap, 'alice')).rejects.toThrow(VaultEnvelopeError);
        await expect(openPasskeyWrap(prf(7), wrap, 'bob')).rejects.toThrow(VaultEnvelopeError);
        await expect(openPasskeyWrap(prf(7), { ...wrap, credentialId: 'cred-2' }, 'alice')).rejects.toThrow(VaultEnvelopeError);
        await expect(openPasskeyWrap(prf(7), { ...wrap, salt: createPrfSalt() }, 'alice')).rejects.toThrow(VaultEnvelopeError);
        await expect(openPasskeyWrap(prf(7), { ...wrap, version: 9 }, 'alice')).rejects.toThrow(VaultEnvelopeError);
    });

    test('isPasskeyWrap rejects malformed shapes', () => {
        expect(isPasskeyWrap(null)).toBe(false);
        expect(isPasskeyWrap({ version: 1 })).toBe(false);
        expect(isPasskeyWrap({ version: 1, alg: PASSKEY_WRAP_ALG, credentialId: '', salt: 'x', nonce: 'x', ciphertext: 'x' })).toBe(false);
    });

    test('extractPrfOutput copies results.first and refuses missing PRF support', () => {
        const buffer = new Uint8Array(32).fill(3).buffer;
        const output = extractPrfOutput({ prf: { results: { first: buffer } } });
        expect(output).toEqual(new Uint8Array(32).fill(3));
        expect(() => extractPrfOutput({})).toThrow(/PRF/);
        expect(() => extractPrfOutput({ prf: { enabled: false } })).toThrow(/PRF/);
    });
});

describe('vault blob carries passkey wraps', () => {
    const envelope = { version: 1, alg: 'PBKDF2-SHA256/AES-256-GCM', params: PARAMS, nonce: 'n', ciphertext: 'c' };
    test('passkeys round-trip through the blob codec as an array (credential ids are never object keys)', async () => {
        const wrap = await sealPasskeyWrap(RAW(), PARAMS, prf(7), { owner: 'alice', credentialId: 'aPRFb' });
        const encoded = encodeVaultBlob({ owner: 'alice', verifier: envelope, records: {}, passkeys: [wrap] });
        const decoded = decodeVaultBlob(encoded);
        expect(decoded.passkeys).toEqual([wrap]);
    });

    test('a blob without passkeys decodes without them (blob unchanged); malformed passkeys are rejected', () => {
        const encoded = encodeVaultBlob({ verifier: envelope, records: {}, passkeys: [] });
        expect(JSON.parse(Buffer.from(encoded.ct, 'base64url').toString())).not.toHaveProperty('passkeys');
        expect(decodeVaultBlob(encoded).passkeys).toBeUndefined();
        const bad = { v: 1, ct: toBase64url(JSON.stringify({ version: 2, check: envelope, records: {}, passkeys: [{ version: 1 }] })) };
        expect(() => decodeVaultBlob(bad)).toThrow(VaultEnvelopeError);
        expect(() => encodeVaultBlob({ verifier: envelope, records: {}, passkeys: [{ nope: 1 }] })).toThrow(VaultEnvelopeError);
    });
});

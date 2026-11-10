// Passkey (WebAuthn PRF) vault unlock — pure crypto, no network (docs/passkey-ux-design.md).
//
// The PRF output never leaves this module except as a non-extractable AES-GCM key:
//   wrapKey = HKDF-SHA-256(ikm = PRF output, salt = wrap.salt, info = JSON["jisme/vault-passkey/v1", owner, credentialId])
// The wrap seals the same payload as the recovery envelope: JSON { key: base64(raw vault key), params }.
// wrap.salt is also the PRF eval input (public by design; it is stored in the vault blob).
import { VaultEnvelopeError, encodeKeyMaterial, decodeKeyMaterial } from './vaultKey';
import { toBase64url, fromBase64url } from './vaultBlob';

export const PASSKEY_WRAP_VERSION = 1;
export const PASSKEY_WRAP_ALG = 'HKDF-SHA256/AES-256-GCM';
export const PRF_SALT_BYTES = 32;
const NONCE_BYTES = 12;
const HKDF_INFO = 'jisme/vault-passkey/v1';
const AAD_DOMAIN = 'jisme/vault';
const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8', { fatal: true });
const subtle = () => globalThis.crypto.subtle;
const randomBytes = (length) => globalThis.crypto.getRandomValues(new Uint8Array(length));

export class PrfUnsupportedError extends Error {
    constructor () {
        super('This passkey or browser does not support the PRF extension needed to unlock the vault.');
        this.name = 'PrfUnsupportedError';
    }
}

export const createPrfSalt = () => toBase64url(randomBytes(PRF_SALT_BYTES));

const isText = (value) => typeof value === 'string' && value.length > 0;
const isB64url = (value) => isText(value) && /^[A-Za-z0-9_-]+$/.test(value);

export function isPasskeyWrap (wrap) {
    return !!wrap && typeof wrap === 'object' && !Array.isArray(wrap)
        && wrap.version === PASSKEY_WRAP_VERSION && wrap.alg === PASSKEY_WRAP_ALG
        && isText(wrap.credentialId) && isB64url(wrap.salt) && isB64url(wrap.nonce) && isB64url(wrap.ciphertext);
}

function checkSalt (salt) {
    const bytes = fromBase64url(salt); // VaultEnvelopeError on junk
    if (bytes.length !== PRF_SALT_BYTES) throw new VaultEnvelopeError();
    return bytes;
}

// Raw 32-byte HKDF output. Exported for known-answer tests; callers MUST zeroize it.
export async function derivePasskeyWrapBits (prfOutput, { salt, owner, credentialId }) {
    try {
        if (!(prfOutput instanceof Uint8Array) || prfOutput.length < 32) throw new VaultEnvelopeError();
        if (!isText(owner) || !isText(credentialId)) throw new VaultEnvelopeError();
        const ikm = await subtle().importKey('raw', prfOutput, 'HKDF', false, ['deriveBits']);
        const bits = await subtle().deriveBits({
            name: 'HKDF', hash: 'SHA-256', salt: checkSalt(salt),
            info: encoder.encode(JSON.stringify([HKDF_INFO, owner, credentialId])),
        }, ikm, 256);
        return new Uint8Array(bits);
    } catch (_) {
        throw new VaultEnvelopeError();
    }
}

// Non-extractable AES-256-GCM key wrapping the vault key for one passkey.
export async function derivePasskeyWrapKey (prfOutput, context) {
    const bits = await derivePasskeyWrapBits(prfOutput, context);
    try {
        return await subtle().importKey('raw', bits, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
    } catch (_) {
        throw new VaultEnvelopeError();
    } finally {
        bits.fill(0);
    }
}

// Every public field is authenticated (owner + credential + salt binding).
const additionalData = (owner, wrap) => encoder.encode(JSON.stringify([
    AAD_DOMAIN, 'passkey-wrap', wrap.version, wrap.alg, owner, wrap.credentialId, wrap.salt,
]));

export async function sealPasskeyWrap (rawKey, params, prfOutput, { owner, credentialId }) {
    const salt = createPrfSalt();
    const key = await derivePasskeyWrapKey(prfOutput, { salt, owner, credentialId });
    const header = { version: PASSKEY_WRAP_VERSION, alg: PASSKEY_WRAP_ALG, credentialId, salt };
    const nonce = randomBytes(NONCE_BYTES);
    const plaintext = encoder.encode(JSON.stringify({ key: encodeKeyMaterial(rawKey), params }));
    try {
        const ciphertext = await subtle().encrypt(
            { name: 'AES-GCM', iv: nonce, additionalData: additionalData(owner, header), tagLength: 128 },
            key, plaintext,
        );
        return { ...header, nonce: toBase64url(nonce), ciphertext: toBase64url(new Uint8Array(ciphertext)) };
    } finally {
        plaintext.fill(0);
    }
}

// Returns { raw (32 bytes — caller MUST zeroize), params }. Uniform VaultEnvelopeError on any failure.
export async function openPasskeyWrap (prfOutput, wrap, owner) {
    let plaintext = null;
    try {
        if (!isPasskeyWrap(wrap)) throw new VaultEnvelopeError();
        const key = await derivePasskeyWrapKey(prfOutput, { salt: wrap.salt, owner, credentialId: wrap.credentialId });
        const nonce = fromBase64url(wrap.nonce);
        if (nonce.length !== NONCE_BYTES) throw new VaultEnvelopeError();
        plaintext = new Uint8Array(await subtle().decrypt(
            { name: 'AES-GCM', iv: nonce, additionalData: additionalData(owner, wrap), tagLength: 128 },
            key, fromBase64url(wrap.ciphertext),
        ));
        const payload = JSON.parse(decoder.decode(plaintext));
        if (!payload || typeof payload !== 'object' || !payload.params) throw new VaultEnvelopeError();
        return { raw: decodeKeyMaterial(payload.key), params: payload.params };
    } catch (_) {
        throw new VaultEnvelopeError();
    } finally {
        if (plaintext) plaintext.fill(0);
    }
}

// PRF output (copied) from getClientExtensionResults(); throws PrfUnsupportedError when absent.
export function extractPrfOutput (clientExtensionResults) {
    const first = clientExtensionResults?.prf?.results?.first;
    if (first instanceof ArrayBuffer) return new Uint8Array(first.slice(0));
    if (ArrayBuffer.isView(first)) return new Uint8Array(first.buffer.slice(first.byteOffset, first.byteOffset + first.byteLength));
    throw new PrfUnsupportedError();
}

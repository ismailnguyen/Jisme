// Session keys have a dedicated HKDF domain and never unlock the vault.
import { toBase64url, fromBase64url } from './vaultBlob';
import { createPrfSalt } from './vaultPasskey';
export const SESSION_ENVELOPE_MAX_AGE_DAYS = 30;
const alg = 'HKDF-SHA256/AES-256-GCM';
const encoder = new TextEncoder();
export class SessionEnvelopeError extends Error {
    constructor () { super('Session could not be resumed.'); this.name = 'SessionEnvelopeError'; }
}
const bytes = (value, length) => {
    if (typeof value !== 'string' || !/^[A-Za-z0-9_-]+$/.test(value)) throw new SessionEnvelopeError();
    const result = fromBase64url(value);
    if (toBase64url(result) !== value || (length && result.length !== length)) throw new SessionEnvelopeError();
    return result;
};
export async function deriveSessionWrapBits (prfOutput, { salt, owner, credentialId }) {
    try {
        if (!(prfOutput instanceof Uint8Array) || prfOutput.length < 32 || typeof owner !== 'string' || !owner) throw new SessionEnvelopeError();
        bytes(credentialId);
        const material = await crypto.subtle.importKey('raw', prfOutput, 'HKDF', false, ['deriveBits']);
        return new Uint8Array(await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt: bytes(salt, 32), info: encoder.encode(JSON.stringify(['jisme/session-envelope/v1', owner, credentialId, 'session'])) }, material, 256));
    } catch (_) { throw new SessionEnvelopeError(); }
}
async function keyFor(prf, context) {
    const raw = await deriveSessionWrapBits(prf, context);
    try { return await crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']); }
    finally { raw.fill(0); }
}
const aad = (owner, e) => encoder.encode(JSON.stringify(['jisme/session', e.version, e.alg, owner, e.credentialId, e.salt, e.tokenExpiry]));
export async function sealSessionEnvelope (user, prfOutput, { owner, credentialId, salt = createPrfSalt() }) {
    let plaintext;
    try {
        const sealedAt = Date.now();
        const header = { version: 1, alg, credentialId, salt, sealedAt, tokenExpiry: user.tokenExpiry };
        const nonce = crypto.getRandomValues(new Uint8Array(12));
        const key = await keyFor(prfOutput, { owner, credentialId, salt });
        // sealedAt is also inside the authenticated ciphertext, preventing age reset.
        plaintext = encoder.encode(JSON.stringify({ user, sealedAt }));
        const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce, additionalData: aad(owner, header), tagLength: 128 }, key, plaintext);
        return { ...header, nonce: toBase64url(nonce), ciphertext: toBase64url(new Uint8Array(ciphertext)) };
    } catch (_) { throw new SessionEnvelopeError(); }
    finally { plaintext?.fill(0); }
}
export async function openSessionEnvelope (prfOutput, envelope, owner) {
    let plaintext;
    try {
        if (!envelope || envelope.version !== 1 || envelope.alg !== alg || !Number.isFinite(envelope.sealedAt)) throw new SessionEnvelopeError();
        const key = await keyFor(prfOutput, { ...envelope, owner });
        plaintext = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: bytes(envelope.nonce, 12), additionalData: aad(owner, envelope), tagLength: 128 }, key, bytes(envelope.ciphertext)));
        const payload = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(plaintext));
        if (payload.sealedAt !== envelope.sealedAt || !payload.user?.uuid || !payload.user.token || payload.user.tokenExpiry !== envelope.tokenExpiry) throw new SessionEnvelopeError();
        return payload.user;
    } catch (_) { throw new SessionEnvelopeError(); }
    finally { plaintext?.fill(0); }
}

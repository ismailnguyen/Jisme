// Server-side vault blob codec (docs/vault-ux-design.md, docs/vault-recovery-design.md).
// Pure: no network, no key material. API envelope: { v: 1, ct: base64url(JSON blob) } (unchanged);
// blob v2: { version: 2, check, recovery?, records } — recovery is optional (legacy vaults).
// v1 blobs ({ version: 1, check, records }) still decode; a v1 blob must not carry recovery.
import { assertApiSafe, VaultEnvelopeError } from './vaultKey';

export const VAULT_BLOB_VERSION = 2;
const API_ENVELOPE_VERSION = 1;
const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8', { fatal: true });

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)
    && [Object.prototype, null].includes(Object.getPrototypeOf(value));
const looksLikeEnvelope = (value) => isPlainObject(value) && value.version === 1 && isPlainObject(value.params);

export function toBase64url (input) {
    const bytes = typeof input === 'string' ? encoder.encode(input) : input;
    if (!(bytes instanceof Uint8Array)) throw new VaultEnvelopeError();
    let binary = '';
    for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function fromBase64url (value) {
    if (typeof value !== 'string' || !/^[A-Za-z0-9_-]*={0,2}$/.test(value)) throw new VaultEnvelopeError();
    const unpadded = value.replace(/=+$/, '');
    if (unpadded.length % 4 === 1) throw new VaultEnvelopeError();
    const standard = unpadded.replace(/-/g, '+').replace(/_/g, '/');
    let binary;
    try { binary = atob(standard + '='.repeat((4 - standard.length % 4) % 4)); } catch (_) { throw new VaultEnvelopeError(); }
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
}

// exported: exportVault() output { owner, verifier, recovery?, records }. Returns the API envelope.
export function encodeVaultBlob (exported) {
    if (!exported || !looksLikeEnvelope(exported.verifier)) throw new VaultEnvelopeError();
    const blob = { version: VAULT_BLOB_VERSION, check: exported.verifier, records: exported.records || {} };
    if (exported.recovery !== undefined && exported.recovery !== null) {
        if (!looksLikeEnvelope(exported.recovery)) throw new VaultEnvelopeError();
        blob.recovery = exported.recovery;
    }
    assertApiSafe(blob, 'vaultBlob');
    return { v: API_ENVELOPE_VERSION, ct: toBase64url(JSON.stringify(blob)) };
}

export function decodeVaultBlob (envelope) {
    if (!isPlainObject(envelope) || envelope.v !== API_ENVELOPE_VERSION || typeof envelope.ct !== 'string') {
        throw new VaultEnvelopeError();
    }
    let blob;
    try {
        blob = JSON.parse(decoder.decode(fromBase64url(envelope.ct)));
        assertApiSafe(blob, 'vaultBlob'); // never surface /prf/i fields or non-JSON values
    } catch {
        throw new VaultEnvelopeError();
    }
    if (!isPlainObject(blob) || ![1, 2].includes(blob.version)) throw new VaultEnvelopeError();
    if (blob.version === 1 && 'recovery' in blob) throw new VaultEnvelopeError();
    if (blob.recovery !== undefined && !looksLikeEnvelope(blob.recovery)) throw new VaultEnvelopeError();
    if (!looksLikeEnvelope(blob.check) || !isPlainObject(blob.records)) throw new VaultEnvelopeError();
    if (!Object.values(blob.records).every(looksLikeEnvelope)) throw new VaultEnvelopeError();
    // v1 (legacy) decodes with recovery undefined.
    return { check: blob.check, recovery: blob.recovery, records: blob.records };
}

// Key-order-independent comparison of two JSON envelopes (e.g. local verifier vs server check).
const canonical = (value) => Array.isArray(value) ? `[${ value.map(canonical).join(',') }]`
    : value && typeof value === 'object'
        ? `{${ Object.keys(value).sort().map(k => `${ JSON.stringify(k) }:${ canonical(value[k]) }`).join(',') }}`
        : JSON.stringify(value);
export const sameEnvelope = (a, b) => canonical(a) === canonical(b);

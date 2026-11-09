// Client-controlled vault unlock key (option A). See docs/vault-key-design.md.
// The phrase never leaves this module except as a non-extractable CryptoKey; only
// envelopes (public KDF params + nonce + ciphertext) are ever meant for the API.

export const VAULT_ENVELOPE_VERSION = 1;
export const VAULT_ALG = 'PBKDF2-SHA256/AES-256-GCM';
export const VAULT_KDF_LIMITS = Object.freeze({
    defaultIterations: 600_000,
    minIterations: 100_000,
    maxIterations: 2_000_000,
    saltBytes: 16,
    nonceBytes: 12,
    minPhraseLength: 12,
});

const KDF_DOMAIN = 'jisme/vault-key/v1';
const AAD_DOMAIN = 'jisme/vault';
const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8', { fatal: true });
const subtle = () => globalThis.crypto.subtle;

export class VaultEnvelopeError extends Error {
    constructor () {
        // One message for every failure: no oracle on which check rejected the input.
        super('Vault data could not be unlocked.');
        this.name = 'VaultEnvelopeError';
    }
}

export class VaultLockedError extends Error {
    constructor (message = 'The vault is locked. Unlock it with your vault phrase.') {
        super(message);
        this.name = 'VaultLockedError';
    }
}

export class VaultDisabledError extends Error {
    constructor () {
        super('Vault unlock key is not enabled.');
        this.name = 'VaultDisabledError';
    }
}

function toBase64 (bytes) {
    let binary = '';
    for (let i = 0; i < bytes.length; i += 0x8000) {
        binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    }
    return btoa(binary);
}

function fromBase64 (value) {
    if (typeof value !== 'string') throw new VaultEnvelopeError();
    const binary = atob(value);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
}

const randomBytes = (length) => globalThis.crypto.getRandomValues(new Uint8Array(length));

function checkIterations (iterations) {
    return Number.isSafeInteger(iterations)
        && iterations >= VAULT_KDF_LIMITS.minIterations
        && iterations <= VAULT_KDF_LIMITS.maxIterations;
}

// Returns the decoded salt; throws VaultEnvelopeError for anything outside the v1 bounds.
function checkParams (params) {
    if (!params || params.kdf !== 'PBKDF2' || params.hash !== 'SHA-256' || !checkIterations(params.iterations)) {
        throw new VaultEnvelopeError();
    }
    const salt = fromBase64(params.salt);
    if (salt.length !== VAULT_KDF_LIMITS.saltBytes) throw new VaultEnvelopeError();
    return salt;
}

export function createVaultParams ({ iterations = VAULT_KDF_LIMITS.defaultIterations } = {}) {
    if (!checkIterations(iterations)) {
        throw new RangeError(`Vault KDF iterations must be between ${ VAULT_KDF_LIMITS.minIterations } and ${ VAULT_KDF_LIMITS.maxIterations }.`);
    }
    return { kdf: 'PBKDF2', hash: 'SHA-256', iterations, salt: toBase64(randomBytes(VAULT_KDF_LIMITS.saltBytes)) };
}

const normalizePhrase = (phrase) => typeof phrase === 'string' ? phrase.normalize('NFKC') : '';

// Policy applied when a phrase is chosen (not on unlock, so a policy change never locks users out).
export function validatePhrase (phrase, { loginPassword } = {}) {
    const normalized = normalizePhrase(phrase);
    if ([...normalized].length < VAULT_KDF_LIMITS.minPhraseLength) {
        throw new Error(`Vault unlock phrase must be at least ${ VAULT_KDF_LIMITS.minPhraseLength } characters.`);
    }
    if (loginPassword && normalized === normalizePhrase(loginPassword)) {
        throw new Error('Vault unlock phrase must be different from your login password.');
    }
    return normalized;
}

export async function deriveVaultKey (phrase, params) {
    const salt = checkParams(params);
    const normalized = normalizePhrase(phrase);
    if (!normalized) throw new VaultEnvelopeError();

    const phraseBytes = encoder.encode(normalized);
    const domain = encoder.encode(KDF_DOMAIN);
    const saltBytes = new Uint8Array(domain.length + salt.length);
    saltBytes.set(domain); saltBytes.set(salt, domain.length);
    try {
        const material = await subtle().importKey('raw', phraseBytes, 'PBKDF2', false, ['deriveKey']);
        return await subtle().deriveKey(
            { name: 'PBKDF2', hash: 'SHA-256', salt: saltBytes, iterations: params.iterations },
            material,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt'],
        );
    } finally {
        phraseBytes.fill(0);
    }
}

// Usage binding / domain separation: the caller-supplied usage and every public
// envelope field are authenticated. JSON array encoding keeps fields unambiguous.
function additionalData (usage, params) {
    if (typeof usage !== 'string' || !usage) throw new VaultEnvelopeError();
    return encoder.encode(JSON.stringify([
        AAD_DOMAIN, VAULT_ENVELOPE_VERSION, VAULT_ALG, usage,
        params.kdf, params.hash, params.iterations, params.salt,
    ]));
}

export async function sealEnvelope (key, params, plaintext, usage) {
    checkParams(params);
    if (typeof plaintext !== 'string') throw new TypeError('Vault plaintext must be a string.');
    const nonce = randomBytes(VAULT_KDF_LIMITS.nonceBytes);
    const ciphertext = await subtle().encrypt(
        { name: 'AES-GCM', iv: nonce, additionalData: additionalData(usage, params), tagLength: 128 },
        key,
        encoder.encode(plaintext),
    );
    return {
        version: VAULT_ENVELOPE_VERSION,
        alg: VAULT_ALG,
        params: { kdf: params.kdf, hash: params.hash, iterations: params.iterations, salt: params.salt },
        nonce: toBase64(nonce),
        ciphertext: toBase64(new Uint8Array(ciphertext)),
    };
}

export async function openEnvelope (key, envelope, usage) {
    try {
        if (!envelope || envelope.version !== VAULT_ENVELOPE_VERSION || envelope.alg !== VAULT_ALG) {
            throw new VaultEnvelopeError();
        }
        checkParams(envelope.params);
        const nonce = fromBase64(envelope.nonce);
        if (nonce.length !== VAULT_KDF_LIMITS.nonceBytes) throw new VaultEnvelopeError();
        const plaintext = await subtle().decrypt(
            { name: 'AES-GCM', iv: nonce, additionalData: additionalData(usage, envelope.params), tagLength: 128 },
            key,
            fromBase64(envelope.ciphertext),
        );
        return decoder.decode(plaintext);
    } catch (_) {
        throw new VaultEnvelopeError();
    }
}

// Guard for anything headed to the API: plain JSON only, and never PRF material
// (the API rejects it; WebAuthn PRF outputs must stay client-side).
export function assertApiSafe (payload, path = 'payload') {
    if (payload === null || typeof payload === 'string' || typeof payload === 'boolean') return payload;
    if (typeof payload === 'number') {
        if (!Number.isFinite(payload)) throw new TypeError(`Non-JSON number at ${ path }.`);
        return payload;
    }
    if (Array.isArray(payload)) {
        payload.forEach((item, index) => assertApiSafe(item, `${ path }[${ index }]`));
        return payload;
    }
    const proto = typeof payload === 'object' ? Object.getPrototypeOf(payload) : undefined;
    if (proto !== Object.prototype && proto !== null) {
        throw new TypeError(`Non-JSON value at ${ path }; key material must never be sent.`);
    }
    for (const [name, value] of Object.entries(payload)) {
        if (/prf/i.test(name)) throw new TypeError(`PRF material must never be sent to the API (${ path }.${ name }).`);
        assertApiSafe(value, `${ path }.${ name }`);
    }
    return payload;
}

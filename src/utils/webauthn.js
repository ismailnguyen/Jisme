// Thin wrapper over @simplewebauthn/browser (docs/passkey-ux-design.md). The only module that
// touches navigator.credentials; stores receive JSON-safe ceremony outputs (tests mock this module).
import {
    startRegistration, startAuthentication, browserSupportsWebAuthn,
    base64URLStringToBuffer,
} from '@simplewebauthn/browser';
import { extractPrfOutput } from './vaultPasskey';

export const isWebAuthnSupported = () => {
    try { return browserSupportsWebAuthn(); } catch (_) { return false; }
};

// Registration: server options as-is, plus a PRF probe so the credential can later unlock the vault.
export async function registerPasskey (optionsJSON) {
    const extensions = { ...(optionsJSON.extensions || {}), prf: optionsJSON.extensions?.prf || {} };
    const response = await startRegistration({ optionsJSON: { ...optionsJSON, extensions } });
    // PRF results (some authenticators return them at create) must never reach the API.
    // eslint-disable-next-line no-unused-vars
    const { prf, ...clientExtensionResults } = response.clientExtensionResults || {};
    return { ...response, clientExtensionResults };
}

// Transports hint so platforms keep the ceremony on-device (no hybrid/QR sheet on iOS).
// Server-declared transports are preserved; caller-built entries default to ['internal'].
export const internalOnly = (entry) => ({ ...entry, transports: entry.transports ?? ['internal'] });

const withInternalTransports = (optionsJSON) => (optionsJSON.allowCredentials
    ? { ...optionsJSON, allowCredentials: optionsJSON.allowCredentials.map(internalOnly) }
    : optionsJSON);

export async function authenticatePasskey (optionsJSON) {
    const response = await startAuthentication({ optionsJSON: withInternalTransports(optionsJSON) });
    return { ...response, clientExtensionResults: {} };
}

const toBytes = (value) => new Uint8Array(base64URLStringToBuffer(value));

// Authentication WITH the PRF extension. Either { salt } (one eval for whichever passkey the
// user picks: enabling unlock) or { wraps } (evalByCredential, restricted to wrapped credentials).
// Returns the assertion WITHOUT extension results (they hold the PRF output, which must never be
// sent) and the PRF output as a separate Uint8Array the caller zeroizes.
export async function authenticateWithPrf (optionsJSON, { salt, wraps } = {}) {
    const prf = wraps
        ? { evalByCredential: Object.fromEntries(wraps.map(w => [w.credentialId, { first: toBytes(w.salt) }])) }
        : { eval: { first: toBytes(salt) } };
    const request = {
        ...optionsJSON,
        ...(wraps && { allowCredentials: wraps.map(w => ({ id: w.credentialId, type: 'public-key' })) }),
        extensions: { ...(optionsJSON.extensions || {}), prf },
    };
    const response = await startAuthentication({ optionsJSON: withInternalTransports(request) });
    const prfOutput = extractPrfOutput(response.clientExtensionResults);
    return {
        assertion: { ...response, clientExtensionResults: {} },
        credentialId: response.id,
        prfOutput,
    };
}

// Probe platform UV availability; the activation ceremony verifies actual PRF support.
export async function isSessionPrfSupported () {
    try {
        return isWebAuthnSupported() && !!await globalThis.PublicKeyCredential?.isUserVerifyingPlatformAuthenticatorAvailable?.();
    } catch (_) { return false; }
}

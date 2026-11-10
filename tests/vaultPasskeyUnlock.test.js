// Vault store: passkey (PRF) unlock with the feature flag forced ON (docs/passkey-ux-design.md).
// WebCrypto stays real; fetch and the WebAuthn wrapper are mocked. The PRF output must never leave the client.
import { beforeEach, describe, test, expect, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useUserStore } from '../src/store';
import useVaultStore from '../src/store/vault';
import { VAULT_KDF_LIMITS, VaultEnvelopeError, VaultLockedError } from '../src/utils/vaultKey';
import { encodeVaultBlob, toBase64url } from '../src/utils/vaultBlob';
import { ApiError } from '../src/utils/apiError';
import * as webauthn from '../src/utils/webauthn';
vi.mock('../src/utils/secrets', async (original) => ({ ...await original(), VAULT_UNLOCK_KEY_ENABLED: true }));
vi.mock('../src/utils/webauthn', () => ({
    isWebAuthnSupported: vi.fn(() => true),
    registerPasskey: vi.fn(),
    authenticatePasskey: vi.fn(),
    authenticateWithPrf: vi.fn(),
}));

const PHRASE = 'correct horse battery staple';
const SECRET = 'synthetic secret value';
const fast = { iterations: VAULT_KDF_LIMITS.minIterations, loginPassword: 'synthetic login password' };
const alice = () => ({ uuid: 'alice', token: 'session-token', passkeys: [{ id: 'cred-1', name: 'Laptop', verified: true }] });
const json = (status, body) => new Response(body === undefined ? '' : JSON.stringify(body), {
    status, headers: { 'Content-Type': 'application/json' },
});
const keysOf = (value) => value && typeof value === 'object'
    ? Object.entries(value).flatMap(([k, v]) => [k, ...keysOf(v)]) : [];
const PRF_BYTES = () => new Uint8Array(32).fill(7);
const prfLeaks = (text) => [toBase64url(PRF_BYTES()), Buffer.from(PRF_BYTES()).toString('base64'), PHRASE]
    .some(secret => text.includes(secret));

let requests;
function api (handler) {
    requests = [];
    vi.stubGlobal('fetch', vi.fn(async (url, options = {}) => {
        const text = options.body ? String(options.body) : '';
        expect(prfLeaks(text)).toBe(false);
        const body = text ? JSON.parse(text) : undefined;
        if (body) expect(keysOf(body).filter(k => /prf/i.test(k))).toEqual([]);
        const request = { method: options.method || 'GET', url: String(url), body, auth: new Headers(options.headers).get('Authorization') };
        requests.push(request);
        return handler(request, requests.length);
    }));
}

// The ceremony mock hands back a fresh PRF buffer each time so zeroization can be observed.
let lastPrf;
function ceremony ({ credentialId = 'cred-1', bytes = PRF_BYTES } = {}) {
    webauthn.authenticateWithPrf.mockImplementation(async () => {
        lastPrf = bytes();
        return { assertion: { id: credentialId, response: { signature: 'sig' }, clientExtensionResults: {} }, credentialId, prfOutput: lastPrf };
    });
}

let users, vault;
beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());
    users = useUserStore(); users.user = alice(); users.isLoggedIn = true;
    vault = useVaultStore();
});

async function vaultWithPasskey () {
    await vault.setup(PHRASE, fast);
    await vault.put('one', { password: SECRET });
    ceremony();
    await vault.enablePasskeyUnlock(PHRASE);
    vault.lock();
}

describe('enable passkey unlock', () => {
    test('wraps the vault key under the PRF-derived key locally, with no network call', async () => {
        await vault.setup(PHRASE, fast);
        ceremony();
        api(() => { throw new Error('no request expected'); });
        expect(vault.hasPasskeyUnlock).toBe(false);
        await vault.enablePasskeyUnlock(PHRASE);
        expect(vault.hasPasskeyUnlock).toBe(true);
        expect(requests).toHaveLength(0);
        const [options, prfInput] = webauthn.authenticateWithPrf.mock.calls[0];
        expect(options.allowCredentials).toEqual([{ id: 'cred-1', type: 'public-key' }]);
        expect(options.userVerification).toBe('required');
        expect(typeof prfInput.salt).toBe('string');
        const exported = vault.exportVault();
        expect(exported.passkeys).toHaveLength(1);
        expect(exported.passkeys[0].credentialId).toBe('cred-1');
        expect(prfLeaks(JSON.stringify(exported))).toBe(false);
        expect(lastPrf.every(b => b === 0)).toBe(true); // PRF output zeroized after use
    });

    test('a wrong phrase is rejected before any ceremony', async () => {
        await vault.setup(PHRASE, fast);
        ceremony();
        await expect(vault.enablePasskeyUnlock('definitely the wrong phrase')).rejects.toThrow(VaultEnvelopeError);
        expect(webauthn.authenticateWithPrf).not.toHaveBeenCalled();
        expect(vault.hasPasskeyUnlock).toBe(false);
    });

    test('re-enabling the same credential replaces its wrap instead of duplicating it', async () => {
        await vault.setup(PHRASE, fast);
        ceremony();
        await vault.enablePasskeyUnlock(PHRASE);
        await vault.enablePasskeyUnlock(PHRASE);
        expect(vault.exportVault().passkeys).toHaveLength(1);
    });

    test('disablePasskeyUnlock removes the wrap', async () => {
        await vault.setup(PHRASE, fast);
        ceremony();
        await vault.enablePasskeyUnlock(PHRASE);
        vault.disablePasskeyUnlock('cred-1');
        expect(vault.hasPasskeyUnlock).toBe(false);
    });
});

describe('unlock with passkey', () => {
    test('options -> PRF ceremony -> local unwrap -> server vault token; only the assertion is sent', async () => {
        await vaultWithPasskey();
        api(({ url }) => url.endsWith('vaults/unlock/passkey/options')
            ? json(200, { challenge: 'c2VydmVy', allowCredentials: [] })
            : url.endsWith('vaults/unlock/passkey')
                ? json(200, { token: 'vault-token', expiresIn: 300 })
                : json(404, {}));
        await vault.unlockWithPasskey();
        expect(vault.isUnlocked).toBe(true);
        expect(await vault.get('one')).toEqual({ password: SECRET });
        const [options, prfInput] = webauthn.authenticateWithPrf.mock.calls.at(-1);
        expect(options.challenge).toBe('c2VydmVy');
        expect(prfInput.wraps.map(w => w.credentialId)).toEqual(['cred-1']);
        const unlockCall = requests.find(r => r.url.endsWith('vaults/unlock/passkey'));
        expect(unlockCall.body).toEqual({ assertion: { id: 'cred-1', response: { signature: 'sig' }, clientExtensionResults: {} } });
        expect(lastPrf.every(b => b === 0)).toBe(true);
        // Existing vault calls now use the short-TTL vault token.
        await vault.loadFromServer();
        expect(requests.at(-1)).toMatchObject({ method: 'GET', auth: 'Bearer vault-token' });
    });

    test('the vault token is dropped on lock and once expired', async () => {
        await vaultWithPasskey();
        api(({ url }) => url.endsWith('options') ? json(200, { challenge: 'Yw' })
            : url.endsWith('unlock/passkey') ? json(200, { token: 'vault-token', expiresIn: 300 }) : json(404, {}));
        await vault.unlockWithPasskey();
        vault.lock();
        await vault.loadFromServer();
        expect(requests.at(-1).auth).toBe('Bearer session-token');
        await vault.unlockWithPasskey();
        const now = Date.now();
        vi.spyOn(Date, 'now').mockReturnValue(now + 301_000);
        await vault.loadFromServer();
        expect(requests.at(-1).auth).toBe('Bearer session-token');
        vi.restoreAllMocks();
    });

    test('a wrong PRF output fails locally: stays locked and no assertion is sent', async () => {
        await vaultWithPasskey();
        ceremony({ bytes: () => new Uint8Array(32).fill(8) });
        api(() => json(200, { challenge: 'Yw' }));
        await expect(vault.unlockWithPasskey()).rejects.toThrow(VaultEnvelopeError);
        expect(vault.isUnlocked).toBe(false);
        expect(requests.filter(r => r.url.endsWith('vaults/unlock/passkey'))).toHaveLength(0);
    });

    test('an assertion from a credential without a wrap is refused', async () => {
        await vaultWithPasskey();
        ceremony({ credentialId: 'other' });
        api(() => json(200, { challenge: 'Yw' }));
        await expect(vault.unlockWithPasskey()).rejects.toThrow(VaultEnvelopeError);
        expect(vault.isUnlocked).toBe(false);
    });

    test('a server refusal surfaces the reason and keeps the vault locked', async () => {
        await vaultWithPasskey();
        ceremony();
        api(({ url }) => url.endsWith('options') ? json(200, { challenge: 'Yw' })
            : json(403, { error: { message: 'Forbidden', reason: 'Passkey re-enrollment required' } }));
        const error = await vault.unlockWithPasskey().catch(e => e);
        expect(error).toBeInstanceOf(ApiError);
        expect(error.reason).toBe('Passkey re-enrollment required');
        expect(vault.isUnlocked).toBe(false);
    });

    test('without a wrap there is no passkey unlock path', async () => {
        await vault.setup(PHRASE, fast);
        vault.lock();
        await expect(vault.unlockWithPasskey()).rejects.toThrow(VaultLockedError);
    });

    test('passkey wraps survive the server round trip and unlock a freshly loaded vault', async () => {
        await vault.setup(PHRASE, fast);
        await vault.put('one', { password: SECRET });
        ceremony();
        await vault.enablePasskeyUnlock(PHRASE);
        const envelope = encodeVaultBlob(vault.exportVault());
        setActivePinia(createPinia());
        users = useUserStore(); users.user = alice(); users.isLoggedIn = true;
        vault = useVaultStore();
        api(({ url }) => url.endsWith('vaults/primary') ? json(200, { revision: 2, envelope })
            : url.endsWith('options') ? json(200, { challenge: 'Yw' }) : json(200, { token: 'vt', expiresIn: 60 }));
        await vault.loadFromServer();
        expect(vault.hasPasskeyUnlock).toBe(true);
        await vault.unlockWithPasskey();
        expect(await vault.get('one')).toEqual({ password: SECRET });
    });

    test('a phrase reset drops passkey wraps (they sealed the previous key)', async () => {
        await vaultWithPasskey();
        await vault.unlock(PHRASE);
        await vault.resetPhrase('a brand new vault phrase', fast);
        expect(vault.hasPasskeyUnlock).toBe(false);
    });
});

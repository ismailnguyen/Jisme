// Thin WebAuthn wrapper: PRF inputs are converted to bytes, PRF outputs never ride in the API payload.
import { beforeEach, test, expect, vi } from 'vitest';
import * as browser from '@simplewebauthn/browser';
import { registerPasskey, authenticateWithPrf, authenticatePasskey } from '../src/utils/webauthn';
import { PrfUnsupportedError } from '../src/utils/vaultPasskey';
import { toBase64url } from '../src/utils/vaultBlob';
import { assertApiSafe } from '../src/utils/vaultKey';

vi.mock('@simplewebauthn/browser', async (original) => ({
    ...await original(),
    startRegistration: vi.fn(),
    startAuthentication: vi.fn(),
    browserSupportsWebAuthn: vi.fn(() => true),
}));

const SALT = toBase64url(new Uint8Array(32).fill(4));
beforeEach(() => vi.clearAllMocks());

test('registerPasskey asks for PRF and strips PRF results from the response sent to the API', async () => {
    browser.startRegistration.mockResolvedValue({
        id: 'c1', response: {}, clientExtensionResults: { credProps: { rk: true }, prf: { enabled: true, results: { first: new ArrayBuffer(32) } } },
    });
    const response = await registerPasskey({ challenge: 'Yw', extensions: { credProps: true } });
    expect(browser.startRegistration.mock.calls[0][0].optionsJSON.extensions).toEqual({ credProps: true, prf: {} });
    expect(response.clientExtensionResults).toEqual({ credProps: { rk: true } });
    expect(() => assertApiSafe(response)).not.toThrow();
});

test('authenticateWithPrf({ salt }) evaluates one salt as bytes and returns the PRF output separately', async () => {
    browser.startAuthentication.mockResolvedValue({
        id: 'c1', response: { signature: 's' }, clientExtensionResults: { prf: { results: { first: new Uint8Array(32).fill(9).buffer } } },
    });
    const result = await authenticateWithPrf({ challenge: 'Yw', allowCredentials: [] }, { salt: SALT });
    const sent = browser.startAuthentication.mock.calls[0][0].optionsJSON;
    expect(sent.extensions.prf.eval.first).toEqual(new Uint8Array(32).fill(4));
    expect(result.credentialId).toBe('c1');
    expect(result.prfOutput).toEqual(new Uint8Array(32).fill(9));
    expect(result.assertion.clientExtensionResults).toEqual({});
    expect(() => assertApiSafe(result.assertion)).not.toThrow();
});

test('authenticateWithPrf({ wraps }) restricts to wrapped credentials with evalByCredential', async () => {
    browser.startAuthentication.mockResolvedValue({
        id: 'c2', response: {}, clientExtensionResults: { prf: { results: { first: new Uint8Array(32).buffer } } },
    });
    await authenticateWithPrf({ challenge: 'Yw' }, { wraps: [{ credentialId: 'c1', salt: SALT }, { credentialId: 'c2', salt: SALT }] });
    const sent = browser.startAuthentication.mock.calls[0][0].optionsJSON;
    expect(sent.allowCredentials).toEqual([{ id: 'c1', type: 'public-key' }, { id: 'c2', type: 'public-key' }]);
    expect(Object.keys(sent.extensions.prf.evalByCredential)).toEqual(['c1', 'c2']);
});

test('no PRF result (unsupported authenticator) throws PrfUnsupportedError', async () => {
    browser.startAuthentication.mockResolvedValue({ id: 'c1', response: {}, clientExtensionResults: {} });
    await expect(authenticateWithPrf({ challenge: 'Yw' }, { salt: SALT })).rejects.toThrow(PrfUnsupportedError);
});

test('authenticatePasskey (login) never forwards extension results', async () => {
    browser.startAuthentication.mockResolvedValue({ id: 'c1', response: {}, clientExtensionResults: { prf: { enabled: true } } });
    expect((await authenticatePasskey({ challenge: 'Yw' })).clientExtensionResults).toEqual({});
});

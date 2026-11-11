import { beforeEach, test, expect, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import localforage from 'localforage';
import { useUserStore, useVaultStore, useAlertStore } from '../src/store';
import UserService from '../src/services/UserService';
import { sealSessionEnvelope } from '../src/utils/sessionEnvelope';
import { authenticateWithPrf, isSessionPrfSupported } from '../src/utils/webauthn';
vi.mock('../src/utils/webauthn', () => ({ authenticatePasskey: vi.fn(), registerPasskey: vi.fn(), authenticateWithPrf: vi.fn(), isWebAuthnSupported: () => true, isSessionPrfSupported: vi.fn(async () => true) }));
let data, users;
const owner = 'alice@example.invalid';
const fixture = () => ({ uuid: 'alice', email: owner, token: 'secret', tokenExpiry: new Date(Date.now() + 86400000).toISOString(), passkeys: [{ id: 'Y3JlZA', verified: true }] });
beforeEach(() => {
    vi.clearAllMocks(); isSessionPrfSupported.mockResolvedValue(true); setActivePinia(createPinia()); users = useUserStore(); data = new Map();
    localforage.getItem.mockImplementation(async k => data.get(k));
    localforage.setItem.mockImplementation(async (k,v) => { data.set(k,v); });
    localforage.removeItem.mockImplementation(async k => { data.delete(k); });
    vi.stubGlobal('fetch', vi.fn(() => { throw new Error('unexpected network'); }));
    authenticateWithPrf.mockImplementation(async () => ({ credentialId: 'Y3JlZA', prfOutput: new Uint8Array(32).fill(7) }));
});
async function prepare(user = fixture()) {
    const service = new UserService();
    await service.setAutoLogin(true); await service.setLastRememberedUsername(owner);
    const envelope = await sealSessionEnvelope(user, new Uint8Array(32).fill(7), { owner, credentialId: 'Y3JlZA' });
    await service.saveSessionEnvelope(envelope); return { service, envelope };
}
test('restores locally once, authenticated with vault locked', async () => {
    await prepare(); await users.init();
    expect(users.isLoggedIn).toBe(true); expect(users.user.token).toBe('secret');
    expect(useVaultStore().isUnlocked).toBe(false); expect(fetch).not.toHaveBeenCalled();
    expect(authenticateWithPrf).toHaveBeenCalledTimes(1);
    expect(authenticateWithPrf.mock.calls[0][0]).toMatchObject({ userVerification: 'required', allowCredentials: [{ id: 'Y3JlZA', type: 'public-key' }] });
});
test.each(['expired', 'old', 'crypto', 'missing'])('%s fails closed and clears envelope', async mode => {
    const { service, envelope } = await prepare();
    if (mode === 'expired') envelope.tokenExpiry = '2000-01-01';
    if (mode === 'old') envelope.sealedAt = Date.now() - 31 * 86400000;
    if (mode === 'crypto') envelope.ciphertext = 'AAAA';
    if (mode === 'missing') authenticateWithPrf.mockRejectedValue(Object.assign(new Error(), { name: 'NotFoundError' }));
    await service.saveSessionEnvelope(envelope); await users.init();
    expect(users.isLoggedIn).toBe(false); expect(await service.getSessionEnvelope()).toBeFalsy(); expect(fetch).not.toHaveBeenCalled();
});
test('cancel offers manual retry without looping', async () => {
    await prepare(); authenticateWithPrf.mockRejectedValue(Object.assign(new Error(), { name: 'NotAllowedError' }));
    await users.init(); expect(users.canResumeSession).toBe(true); expect(authenticateWithPrf).toHaveBeenCalledTimes(1); expect(users.isLoggedIn).toBe(false);
});
test('signout clears envelope and legacy cache never restores it', async () => {
    const { service } = await prepare(); expect(await service.getCachedUser()).toBeNull();
    await users.signOut(); expect(await service.getSessionEnvelope()).toBeFalsy();
});
test('activation verifies PRF, persists encrypted user, and zeroizes output', async () => {
    const output = new Uint8Array(32).fill(7);
    authenticateWithPrf.mockResolvedValue({ credentialId: 'Y3JlZA', prfOutput: output });
    users.user = fixture(); users.isLoggedIn = true;
    await users.setAutoLogin(true);
    const service = new UserService();
    const envelope = await service.getSessionEnvelope();
    expect(envelope.credentialId).toBe('Y3JlZA');
    expect(JSON.stringify(envelope)).not.toContain('secret');
    expect(output.every(b => b === 0)).toBe(true);
    expect(await service.getCachedUser()).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
});
test('credential invalidation and disabling auto-login erase persistence', async () => {
    const { service } = await prepare();
    await users.clearSessionEnvelope('another'); expect(await service.getSessionEnvelope()).toBeTruthy();
    await users.clearSessionEnvelope('Y3JlZA'); expect(await service.getSessionEnvelope()).toBeFalsy();
    await prepare(); await users.setAutoLogin(false); expect(await service.getSessionEnvelope()).toBeFalsy();
});

test('resume failures display the server reason with an explicit wait message', async () => {
    await prepare();
    authenticateWithPrf.mockRejectedValue(Object.assign(new Error('Not authorized!'), {
        status: 401, reason: 'TOO MANY login attempt. Please retry later.',
    }));
    await users.restoreSession();
    const { useAlertStore } = await import('../src/store');
    expect(useAlertStore().currentAlert.message).toContain('Please wait a few minutes');
});

test('refresh 401 preserves the server reason after ending the session', async () => {
    await prepare({ ...fixture(), tokenExpiry: new Date(Date.now() + 60000).toISOString() });
    const activity = vi.spyOn(UserService.prototype, 'setLastActivity').mockResolvedValue();
    fetch.mockResolvedValue(new Response(JSON.stringify({ error: {
        message: 'Not authorized!', reason: 'Too many login attempt. Please retry later.',
    } }), { status: 401 }));
    try { await users.restoreSession(); } finally { activity.mockRestore(); }
    const { useAlertStore } = await import('../src/store');
    expect(users.isLoggedIn).toBe(false);
    expect(useAlertStore().currentAlert.message).toContain('Please wait a few minutes');
});

test.each(['PrfUnsupportedError', 'capability'])('unsupported persistence (%s) warns once and leaves sign-in intact', async mode => {
    const alert = vi.spyOn(useAlertStore(), 'openAlert');
    if (mode === 'capability') isSessionPrfSupported.mockResolvedValue(false);
    else authenticateWithPrf.mockRejectedValue(Object.assign(new Error(), { name: mode }));
    users.user = fixture(); users.isLoggedIn = true;
    await users.setAutoLogin(true);
    await users.setAutoLogin(true);
    expect(alert).toHaveBeenCalledTimes(1);
    expect(alert).toHaveBeenCalledWith('Passive sign-in unavailable', "Your passkeys don't support keeping this device signed in silently (missing PRF support). Sign-in still works normally. To stay signed in across reloads, enroll a passkey stored in your device keychain (iCloud Keychain, Windows Hello).", 'warning');
    expect(await new UserService().getSessionEnvelope()).toBeFalsy();
    expect(users.isLoggedIn).toBe(true);
    expect(users.user.token).toBe('secret');
    const verify = vi.spyOn(UserService.prototype, 'verifyPassword').mockResolvedValue(fixture());
    try { await expect(users.verifyPassword({ password: 'password' })).resolves.toBeUndefined(); }
    finally { verify.mockRestore(); }
    expect(users.isLoggedIn).toBe(true);
    expect(alert).toHaveBeenCalledTimes(1);
    expect(await new UserService().getSessionEnvelope()).toBeFalsy();
});

test('cancelling persistence stays silent and leaves sign-in intact', async () => {
    const alert = vi.spyOn(useAlertStore(), 'openAlert');
    authenticateWithPrf.mockRejectedValue(Object.assign(new Error(), { name: 'NotAllowedError' }));
    users.user = fixture(); users.isLoggedIn = true;
    await users.setAutoLogin(true);
    expect(alert).not.toHaveBeenCalled();
    expect(await new UserService().getSessionEnvelope()).toBeFalsy();
    expect(users.isLoggedIn).toBe(true);
});

// --- Login UX: "Remember me" alone keeps the device signed in (no hidden second toggle). ---
const preAuth = () => ({ email: owner, token: 'pre-auth', next: { step: 'verify_password' } });
async function loginWithPassword (remember, signedIn = fixture()) {
    vi.spyOn(UserService.prototype, 'requestLogin').mockResolvedValue(preAuth());
    vi.spyOn(UserService.prototype, 'verifyPassword').mockResolvedValue(signedIn);
    await users.requestLogin({ username: owner, extendSession: remember });
    await users.verifyPassword({ password: 'password' });
}
const flows = {
    password: () => loginWithPassword(true),
    otp: async () => {
        vi.spyOn(UserService.prototype, 'requestLogin').mockResolvedValue(preAuth());
        vi.spyOn(UserService.prototype, 'verifyMFA').mockResolvedValue(fixture());
        await users.requestLogin({ username: owner, extendSession: true });
        await users.verifyMFA({ totpToken: '123456' });
    },
    passkey: async () => {
        vi.spyOn(UserService.prototype, 'requestLogin').mockResolvedValue({ ...preAuth(), next: { step: 'verify_passkey', passkeyOptions: { challenge: 'Y2g' } } });
        vi.spyOn(UserService.prototype, 'verifyPasskey').mockResolvedValue(fixture());
        await users.requestLogin({ username: owner, extendSession: true });
        await users.verifyPasskey();
    },
};
test.each(Object.keys(flows))('Remember me on %s login enables auto-login without touching Settings', async flow => {
    try {
        expect(await new UserService().isAutoLoginEnabled()).toBeFalsy();
        await flows[flow]();
        expect(users.isLoggedIn).toBe(true);
        expect(await users.isAutoLoginEnabled).toBe(true);
        // ...and the envelope is sealed right away with the verified passkey.
        expect((await new UserService().getSessionEnvelope())?.credentialId).toBe('Y3JlZA');
    } finally { vi.restoreAllMocks(); }
});

test('without Remember me, auto-login is left untouched and nothing is sealed', async () => {
    try {
        await loginWithPassword(false);
        expect(users.isLoggedIn).toBe(true);
        expect(await new UserService().isAutoLoginEnabled()).toBeFalsy();
        expect(await new UserService().getSessionEnvelope()).toBeFalsy();
    } finally { vi.restoreAllMocks(); }
});

test('Remember me without a verified passkey: explanatory notice, then signed out after reload', async () => {
    const alert = vi.spyOn(useAlertStore(), 'openAlert');
    try {
        await loginWithPassword(true, { ...fixture(), passkeys: [{ deviceName: 'Old phone', passkey: { id: 'legacy' } }] });
        expect(users.isLoggedIn).toBe(true);
        expect(await new UserService().getSessionEnvelope()).toBeFalsy();
        expect(authenticateWithPrf).not.toHaveBeenCalled();
        expect(alert).toHaveBeenCalledTimes(1);
        expect(alert.mock.calls[0][0]).toBe('Passive sign-in unavailable');
        expect(alert.mock.calls[0][1]).toMatch(/verified passkey/i);
        expect(alert.mock.calls[0][1]).toMatch(/Settings → Security/);
    } finally { vi.restoreAllMocks(); }
    // Reload: fresh stores, same device storage.
    setActivePinia(createPinia()); users = useUserStore();
    await users.init();
    expect(users.isLoggedIn).toBe(false);
});

test('enrolling a passkey in an extended session seals the envelope without a new login', async () => {
    const { registerPasskey } = await import('../src/utils/webauthn');
    try {
        await loginWithPassword(true, { ...fixture(), passkeys: [] });
        expect(await new UserService().getSessionEnvelope()).toBeFalsy();
        fetch.mockImplementation(async url => String(url).endsWith('options')
            ? new Response(JSON.stringify({ challenge: 'cmVn' }), { status: 200 })
            : new Response(JSON.stringify({ credential: { id: 'Y3JlZA', name: 'Phone', verified: true } }), { status: 201 }));
        registerPasskey.mockResolvedValue({ id: 'Y3JlZA', response: {} });
        const { default: usePasskeysStore } = await import('../src/store/passkeys');
        const added = await usePasskeysStore().enroll('Phone');
        expect(added.id).toBe('Y3JlZA');
        expect(usePasskeysStore().enrollStatus).toBe('success');
        const envelope = await new UserService().getSessionEnvelope();
        expect(envelope?.credentialId).toBe('Y3JlZA');
        expect(users.isLoggedIn).toBe(true);
    } finally { vi.restoreAllMocks(); }
});

test('enrolling outside an extended session does not prompt for PRF nor seal anything', async () => {
    const { registerPasskey } = await import('../src/utils/webauthn');
    try {
        await loginWithPassword(false, { ...fixture(), passkeys: [] });
        fetch.mockImplementation(async url => String(url).endsWith('options')
            ? new Response(JSON.stringify({ challenge: 'cmVn' }), { status: 200 })
            : new Response(JSON.stringify({ credential: { id: 'Y3JlZA', verified: true } }), { status: 201 }));
        registerPasskey.mockResolvedValue({ id: 'Y3JlZA', response: {} });
        const { default: usePasskeysStore } = await import('../src/store/passkeys');
        await usePasskeysStore().enroll('Phone');
        expect(usePasskeysStore().enrollStatus).toBe('success');
        expect(authenticateWithPrf).not.toHaveBeenCalled();
        expect(await new UserService().getSessionEnvelope()).toBeFalsy();
    } finally { vi.restoreAllMocks(); }
});

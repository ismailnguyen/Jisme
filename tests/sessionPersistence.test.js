import { beforeEach, test, expect, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import localforage from 'localforage';
import { useUserStore, useVaultStore } from '../src/store';
import UserService from '../src/services/UserService';
import { sealSessionEnvelope } from '../src/utils/sessionEnvelope';
import { authenticateWithPrf } from '../src/utils/webauthn';
vi.mock('../src/utils/webauthn', () => ({ authenticatePasskey: vi.fn(), authenticateWithPrf: vi.fn(), isWebAuthnSupported: () => true, isSessionPrfSupported: async () => true }));
let data, users;
const owner = 'alice@example.invalid';
const fixture = () => ({ uuid: 'alice', email: owner, token: 'secret', tokenExpiry: new Date(Date.now() + 86400000).toISOString(), passkeys: [{ id: 'Y3JlZA', verified: true }] });
beforeEach(() => {
    vi.clearAllMocks(); setActivePinia(createPinia()); users = useUserStore(); data = new Map();
    localforage.getItem.mockImplementation(async k => data.get(k));
    localforage.setItem.mockImplementation(async (k,v) => { data.set(k,v); });
    localforage.removeItem.mockImplementation(async k => { data.delete(k); });
    vi.stubGlobal('fetch', vi.fn(() => { throw new Error('unexpected network'); }));
    authenticateWithPrf.mockImplementation(async () => ({ credentialId: 'Y3JlZA', prfOutput: new Uint8Array(32).fill(7) }));
});
async function prepare() {
    const service = new UserService();
    await service.setAutoLogin(true); await service.setLastRememberedUsername(owner);
    const envelope = await sealSessionEnvelope(fixture(), new Uint8Array(32).fill(7), { owner, credentialId: 'Y3JlZA' });
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

// UI states for passkey management, recovery code, passkey login fallback and passkey vault unlock (SSR render).
import { beforeEach, describe, test, expect, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { createSSRApp } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { useAlertStore, useUserStore } from '../src/store';
import usePasskeysStore from '../src/store/passkeys';
import useVaultStore from '../src/store/vault';
import * as webauthn from '../src/utils/webauthn';
import { VAULT_KDF_LIMITS } from '../src/utils/vaultKey';
vi.mock('../src/utils/secrets', async (original) => ({ ...await original(), VAULT_UNLOCK_KEY_ENABLED: true }));
vi.mock('../src/utils/webauthn', () => ({
    isWebAuthnSupported: vi.fn(() => true),
    isSessionPrfSupported: vi.fn(async () => true),
    registerPasskey: vi.fn(),
    authenticatePasskey: vi.fn(),
    authenticateWithPrf: vi.fn(),
}));

let pinia, users, passkeys;
beforeEach(() => {
    vi.clearAllMocks();
    webauthn.isWebAuthnSupported.mockReturnValue(true);
    pinia = createPinia(); setActivePinia(pinia);
    users = useUserStore();
    users.user = { uuid: 'alice', email: 'alice@example.test', token: 'tok', passkeys: [
        { id: 'c1', name: 'Work laptop', createdAt: '2026-11-01T10:00:00Z', verified: true },
        { deviceName: 'Old phone', passkey: { id: 'legacy' } },
    ] };
    users.isLoggedIn = true;
    passkeys = usePasskeysStore();
});

async function render (path, props = {}) {
    const component = (await import(`../src/${path}`)).default;
    const app = createSSRApp(component, props); app.use(pinia);
    return renderToString(app);
}

describe('Settings > Security: passkeys', () => {
    test('mounting after login loads and renders the server list once per session', async () => {
        users.user.passkeys = [];
        fetch.mockResolvedValue(new Response(JSON.stringify({ passkeys: [
            { id: 'server-key', name: 'Server laptop', verified: true },
        ] }), { status: 200 }));
        const component = (await import('../src/components/PasskeyManager.vue')).default;
        component.mounted.call({ passkeysStore: passkeys });
        await passkeys.fetchPasskeys();
        component.mounted.call({ passkeysStore: passkeys });
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch.mock.calls[0][0]).toContain('users/passkeys');
        expect(fetch.mock.calls[0][1].method).toBe('GET');
        expect(await render('components/PasskeyManager.vue')).toContain('Server laptop');
    });

    test('lists passkeys with name and created date; legacy ones are flagged for re-enrollment', async () => {
        const html = await render('components/PasskeyManager.vue');
        expect(html).toContain('Work laptop');
        expect(html).toContain('datetime="2026-11-01T10:00:00Z"');
        expect(html).toContain('Old phone');
        expect(html).toMatch(/re-enrol/i);
        expect(html).toMatch(/Add passkey/);
    });

    test('loading state while the WebAuthn ceremony runs', async () => {
        passkeys.enrollStatus = 'loading';
        const html = await render('components/PasskeyManager.vue');
        expect(html).toMatch(/Waiting for your passkey/i);
        expect(html).toMatch(/<button[^>]*disabled[^>]*>[^<]*(<[^>]*>[^<]*)*Add passkey/);
    });

    test('success state', async () => {
        passkeys.enrollStatus = 'success';
        expect(await render('components/PasskeyManager.vue')).toMatch(/Passkey added/i);
    });

    test('error state shows the server reason, never a generic "Not authorized!"', async () => {
        passkeys.enrollStatus = 'error';
        passkeys.enrollError = 'Registration challenge expired';
        const html = await render('components/PasskeyManager.vue');
        expect(html).toMatch(/role="alert"[^>]*>[^<]*Registration challenge expired/);
        expect(html).not.toContain('Not authorized!');
    });

    test('delete asks for the current password', async () => {
        passkeys.requestDelete('c1');
        passkeys.deleteError = 'Incorrect password';
        const html = await render('components/PasskeyManager.vue');
        expect(html).toMatch(/type="password"/);
        expect(html).toMatch(/autocomplete="current-password"/);
        expect(html).toContain('Incorrect password');
        expect(html).toMatch(/Delete passkey/);
    });

    test('unsupported browsers see an explanation instead of the button', async () => {
        webauthn.isWebAuthnSupported.mockReturnValue(false);
        const html = await render('components/PasskeyManager.vue');
        expect(html).toMatch(/not supported/i);
        expect(html).not.toMatch(/Add passkey<\/button>/);
    });

    test('the security panel hosts passkeys and the recovery code', async () => {
        const html = await render('components/menu/SettingsSecurityMenuPanel.vue');
        expect(html).toContain('Work laptop');
        expect(html).toMatch(/Generate recovery code/);
    });
});

describe('Settings > Security: recovery code', () => {
    test('idle: a generate action and an explanation', async () => {
        const html = await render('components/RecoveryCodeSettings.vue');
        expect(html).toMatch(/Generate recovery code/);
    });

    test('the one-time code is shown with copy, warning and a confirm-copy checkbox gating Done', async () => {
        passkeys.recoveryCode = 'ABCD-EFGH-IJKL';
        passkeys.recoveryStatus = 'success';
        const html = await render('components/RecoveryCodeSettings.vue');
        expect(html).toContain('ABCD-EFGH-IJKL');
        expect(html).toMatch(/>Copy</);
        expect(html).toMatch(/only once/i);
        expect(html).toMatch(/type="checkbox"/);
        expect(html).toMatch(/<button[^>]*disabled[^>]*>Done</);
    });

    test('errors show the server reason', async () => {
        passkeys.recoveryStatus = 'error';
        passkeys.recoveryError = 'Recovery code was regenerated less than 1 hour ago';
        expect(await render('components/RecoveryCodeSettings.vue')).toContain('Recovery code was regenerated less than 1 hour ago');
    });
});

describe('Login screen', () => {
    beforeEach(() => {
        users.user = { email: 'alice@example.test', token: 'pre-auth', next: { step: 'verify_password', passkey: true } };
        users.isLoggedIn = false;
    });

    test.each([
        ['RequestLogin', 'onRequestLogin'],
        ['VerifyPassword', 'onVerifyPassword'],
        ['VerifyOTP', 'onVerifyOtp'],
        ['VerifyPasskey', 'onVerifyPasskey'],
    ])('%s renders a wait message for a rate-limit 401', async (screen, action) => {
        vi.useFakeTimers();
        try {
            fetch.mockResolvedValue(new Response(JSON.stringify({ error: {
                message: 'Too many login attempt. Please retry later.',
                reason: 'Too many login attempt. Please retry later.',
            } }), { status: 401 }));
            const component = (await import(`../src/views/login/${screen}.vue`)).default;
            // Exercise the screen handler with its real store action, then SSR-render its alert.
            const context = {
                username: 'alice@example.test', password: 'test', totpToken: '123456',
                requestLogin: users.requestLogin, verifyPassword: users.verifyPassword,
                verifyMFA: users.verifyMFA, verifyPasskey: users.verifyPasskey,
                openAlert: useAlertStore().openAlert, focusOtpInput: vi.fn(),
                $router: { replace: vi.fn() },
            };
            await component.methods[action].call(context);
            const html = await render('components/AlertBox.vue');
            expect(html).toContain('Please wait a few minutes before retrying.');
            expect(html).not.toContain('Not authorized!');
            expect(context.$router.replace).not.toHaveBeenCalled();
        } finally { vi.useRealTimers(); }
    });

    test('accounts with a verified passkey are offered "Sign in with passkey"', async () => {
        const html = await render('views/login/VerifyPassword.vue');
        expect(html).toMatch(/Sign in with passkey/);
        expect(html).toMatch(/id="inputPassword"/);
    });

    test('after a 403 re-enrollment refusal: password form + explanatory notice, no passkey button', async () => {
        users.loginNotice = 'Passkey re-enrollment required: this passkey was registered before verified enrollment.';
        const html = await render('views/login/VerifyPassword.vue');
        expect(html).toMatch(/role="status"[^>]*>[\s\S]*Passkey re-enrollment required/);
        expect(html).toMatch(/sign in with your password/i);
        expect(html).toMatch(/id="inputPassword"/);
        expect(html).not.toMatch(/Sign in with passkey/);
    });
});

describe('Vault unlock panel', () => {
    test('a vault with a passkey wrap offers "Unlock with passkey" and keeps the phrase fallback', async () => {
        const vault = useVaultStore();
        await vault.setup('correct horse battery staple', { iterations: VAULT_KDF_LIMITS.minIterations, loginPassword: 'synthetic login password' });
        webauthn.authenticateWithPrf.mockResolvedValue({ assertion: { id: 'c1' }, credentialId: 'c1', prfOutput: new Uint8Array(32).fill(5) });
        await vault.enablePasskeyUnlock('correct horse battery staple');
        vault.lock();
        const html = await render('components/VaultUnlockPanel.vue');
        expect(html).toMatch(/Unlock with passkey/);
        expect(html).toMatch(/id="vault-unlock-phrase"/);
    });

    test('without a wrap, only the phrase form is offered', async () => {
        const vault = useVaultStore();
        await vault.setup('correct horse battery staple', { iterations: VAULT_KDF_LIMITS.minIterations, loginPassword: 'synthetic login password' });
        vault.lock();
        const html = await render('components/VaultUnlockPanel.vue');
        expect(html).not.toMatch(/Unlock with passkey/);
        expect(html).toMatch(/id="vault-unlock-phrase"/);
    });
});


test.each(['PrfUnsupportedError', 'NotAllowedError', 'supported', 'capability'])('enrollment PRF probe: %s', async mode => {
    const component = (await import('../src/components/PasskeyManager.vue')).default;
    const output = new Uint8Array(32).fill(7);
    webauthn.isSessionPrfSupported.mockResolvedValue(mode !== 'capability');
    if (mode === 'supported') webauthn.authenticateWithPrf.mockResolvedValue({ credentialId: 'new-id', prfOutput: output });
    else webauthn.authenticateWithPrf.mockRejectedValue(Object.assign(new Error(), { name: mode }));
    const context = {
        ...component.data(), newName: 'Phone',
        passkeysStore: { enrollStatus: 'success', enroll: vi.fn(async () => ({ id: 'new-id' })) },
    };
    await component.methods.onEnroll.call(context);
    expect(context.enrolledWithoutPrf).toBe(['PrfUnsupportedError', 'capability'].includes(mode));
    expect(context.newName).toBe('');
    expect(context.passkeysStore.enrollStatus).toBe('success');
    if (mode !== 'capability') expect(webauthn.authenticateWithPrf.mock.calls.at(-1)[0].allowCredentials).toEqual([{ id: 'new-id', type: 'public-key' }]);
    if (mode === 'supported') expect(output.every(b => b === 0)).toBe(true);
    const app = createSSRApp({ ...component, data: () => ({ ...component.data(), enrolledWithoutPrf: context.enrolledWithoutPrf }) });
    passkeys.enrollStatus = 'success'; app.use(pinia);
    const html = await renderToString(app);
    expect(html.includes("This passkey can sign you in, but")).toBe(context.enrolledWithoutPrf);
});

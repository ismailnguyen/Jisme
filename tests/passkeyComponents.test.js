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

    test('lists passkeys with name and created date; legacy ones are listed without a scary label', async () => {
        const html = await render('components/PasskeyManager.vue');
        expect(html).toContain('Work laptop');
        expect(html).toContain('datetime="2026-11-01T10:00:00Z"');
        expect(html).toContain('Old phone');
        expect(html).toMatch(/Added with a previous version/);
        expect(html).not.toMatch(/re-enrol/i);
        expect(html).toMatch(/Allow a new device to connect/);
    });

    test('loading state while the WebAuthn ceremony runs', async () => {
        passkeys.enrollStatus = 'loading';
        const html = await render('components/PasskeyManager.vue');
        expect(html).toMatch(/Waiting for your passkey/i);
        expect(html).toMatch(/<button[^>]*disabled[^>]*>[^<]*(<[^>]*>[^<]*)*Allow a new device to connect/);
    });

    test('adding a passkey asks for a device name with prompt(), then runs one ceremony only', async () => {
        const component = (await import('../src/components/PasskeyManager.vue')).default;
        const store = { enroll: vi.fn(async () => ({ id: 'new-id' })), list: [] };
        window.prompt = vi.fn(() => 'Phone');
        await component.methods.onEnroll.call({ passkeysStore: store });
        expect(store.enroll).toHaveBeenCalledWith('Phone');
        expect(webauthn.authenticateWithPrf).not.toHaveBeenCalled();
        window.prompt = vi.fn(() => null);
        await component.methods.onEnroll.call({ passkeysStore: store });
        expect(store.enroll).toHaveBeenCalledTimes(1);
    });

    test('deleting a passkey asks for confirmation before the password step', async () => {
        const component = (await import('../src/components/PasskeyManager.vue')).default;
        const store = { requestDelete: vi.fn(), list: [{ id: 'c1', name: 'Work laptop' }] };
        window.confirm = vi.fn(() => false);
        component.methods.onRequestDelete.call({ passkeysStore: store, deletePassword: 'x' }, 'c1');
        expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining('Work laptop'));
        expect(store.requestDelete).not.toHaveBeenCalled();
        window.confirm = vi.fn(() => true);
        component.methods.onRequestDelete.call({ passkeysStore: store, deletePassword: 'x' }, 'c1');
        expect(store.requestDelete).toHaveBeenCalledWith('c1');
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
        expect(html).not.toMatch(/Allow a new device to connect/);
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

    test('the passkey button is full width under Unlock, never on the same line', async () => {
        const html = await render('views/login/VerifyPassword.vue');
        const passkeyButton = html.match(/<button[^>]*class="([^"]*)"[^>]*>(?:(?!<\/button>)[\s\S])*Sign in with passkey/);
        expect(passkeyButton).not.toBeNull();
        expect(passkeyButton[1].split(/\s+/)).toEqual(expect.arrayContaining(['w-100', 'mt-2']));
        expect(passkeyButton[1]).not.toMatch(/\bms-\d/);
        expect(html.indexOf('Unlock')).toBeLessThan(html.indexOf('Sign in with passkey'));
    });

    test('the 403 notice links to Settings → Security', async () => {
        users.loginNotice = 'Passkey re-enrollment required.';
        const { createRouter, createMemoryHistory } = await import('vue-router');
        const router = createRouter({ history: createMemoryHistory('/'), routes: [
            { path: '/', component: { render: () => null } },
            { name: 'SettingsSecurity', path: '/settings/security', component: { render: () => null } },
        ] });
        const component = (await import('../src/views/login/VerifyPassword.vue')).default;
        const app = createSSRApp(component); app.use(pinia); app.use(router);
        await router.push('/'); await router.isReady();
        const html = await renderToString(app);
        expect(html).toMatch(/role="status"[^>]*>[\s\S]*<a[^>]*href="\/settings\/security"[^>]*>[\s\S]*Settings → Security[\s\S]*<\/a>/);
        expect(html).toMatch(/sign in with your password/i);
    });

    describe('VerifyPassword never starts the passkey ceremony on its own', () => {
        async function mountVerifyPassword (overrides = {}) {
            const component = (await import('../src/views/login/VerifyPassword.vue')).default;
            const context = {
                ...component.data(),
                user: users.user, canUsePasskeyLogin: users.canUsePasskeyLogin, loginNotice: users.loginNotice,
                verifyPasskey: vi.fn(async () => {}), openAlert: vi.fn(),
                $refs: { inputPassword: { focus: vi.fn() } }, $router: { push: vi.fn(), replace: vi.fn() },
                ...overrides,
            };
            for (const [name, method] of Object.entries(component.methods)) {
                if (!(name in context)) context[name] = method.bind(context);
            }
            component.mounted.call(context);
            await new Promise(resolve => setTimeout(resolve));
            return context;
        }

        test('verified passkey and no notice: mounting only focuses the password field', async () => {
            const context = await mountVerifyPassword();
            expect(context.canUsePasskeyLogin).toBe(true);
            expect(context.verifyPasskey).not.toHaveBeenCalled();
            expect(context.$router.replace).not.toHaveBeenCalled();
            expect(context.$refs.inputPassword.focus).toHaveBeenCalled();
        });

        test('the "Sign in with passkey" button runs the ceremony, then Home', async () => {
            const context = await mountVerifyPassword();
            await context.onUsePasskey();
            expect(context.verifyPasskey).toHaveBeenCalledTimes(1);
            expect(context.$router.replace).toHaveBeenCalledWith({ name: 'Home' });
        });

        test('cancelling (NotAllowedError) stays silently on the password form', async () => {
            const context = await mountVerifyPassword({
                verifyPasskey: vi.fn(async () => { throw Object.assign(new Error('cancelled'), { name: 'NotAllowedError' }); }),
            });
            await context.onUsePasskey();
            expect(context.verifyPasskey).toHaveBeenCalledTimes(1);
            expect(context.$router.replace).not.toHaveBeenCalled();
            expect(context.$router.push).not.toHaveBeenCalled();
            expect(context.openAlert).not.toHaveBeenCalled();
            expect(context.isLoading).toBe(false);
        });

        test('a 403 re-enrollment refusal stays on the form with the store notice, no error alert', async () => {
            fetch.mockImplementation(async url => String(url).endsWith('options')
                ? new Response(JSON.stringify({ challenge: 'c2VydmVy' }), { status: 200 })
                : new Response(JSON.stringify({ error: { message: 'Forbidden', reason: 'Passkey re-enrollment required' } }), { status: 403 }));
            webauthn.authenticatePasskey.mockResolvedValue({ id: 'legacy', response: {} });
            const context = await mountVerifyPassword({ verifyPasskey: users.verifyPasskey });
            await context.onUsePasskey();
            expect(users.loginNotice).toMatch(/re-enrollment required/i);
            expect(context.$router.replace).not.toHaveBeenCalled();
            expect(context.openAlert).not.toHaveBeenCalled();
        });

        test('other passkey failures show the server reason and keep the form', async () => {
            const context = await mountVerifyPassword({
                verifyPasskey: vi.fn(async () => { throw Object.assign(new Error('Not authorized!'), { status: 401, reason: 'Passkey verification failed.' }); }),
            });
            await context.onUsePasskey();
            expect(context.openAlert).toHaveBeenCalledWith("Couldn't sign in with passkey", expect.stringContaining('Passkey verification failed.'), 'danger');
            expect(context.$router.replace).not.toHaveBeenCalled();
        });

        test('password sign-in after a 403 refusal lands on Home like any sign-in', async () => {
            users.loginNotice = 'Passkey re-enrollment required.';
            const context = await mountVerifyPassword({ password: 'pw', verifyPassword: vi.fn(async () => undefined) });
            await context.onVerifyPassword();
            expect(context.$router.replace).toHaveBeenCalledWith({ name: 'Home' });
        });
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


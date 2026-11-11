import { authenticatePasskey } from '../utils/webauthn'
import { isPasskeyReenrollmentRequired, errorText } from '../utils/apiError'

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useAlertStore, useVaultStore } from '@/store';
import { APP_USER_STORE } from '../utils/store'
import UserService from '../services/UserService'
import DemoUserService from '../services/demo/DemoUserService'
import demoVault from '../services/demo/demoVault'
import { isDemoRequested, setDemoSession } from '../utils/demo'
import { SessionExpiredException } from '../utils/errors'

const SESSION_REFRESH_BUFFER_MS = 15 * 60 * 1000; // Refresh when less than 15 minutes remain
const MIN_REFRESH_INTERVAL_MS = 5 * 60 * 1000; // Avoid refreshing more than once within 5 minutes

const useUserStore = defineStore(APP_USER_STORE, () => {
    const user = ref({});
    const isLoggedIn = ref(false);
    const isDemo = ref(false);
    const realUserService = new UserService();
    let userService = realUserService;
    const isExtendedSession = ref(false);
    // Explanatory notice for the password form after a passkey sign-in was refused
    // (403 "Passkey re-enrollment required"). Cleared on the next login attempt.
    const loginNotice = ref('');

    // Offer "Sign in with passkey" when the server says the account has a usable passkey,
    // unless the server just refused it for re-enrollment.
    const canUsePasskeyLogin = computed(() => {
        if (loginNotice.value) return false;
        const u = user.value;
        if (!u) return false;
        if (u.next && (u.next.step === 'verify_passkey' || u.next.passkey === true)) return true;
        return Array.isArray(u.passkeys) && u.passkeys.some(p => p && p.verified === true);
    });
    const alertStore = useAlertStore();

    const lastRememberedUsername = computed(async () => {
        return await userService.lastRememberedUsername();
    })

    async function setLastRememberedUsername (username) {
        await userService.setLastRememberedUsername(username);
    }

    const isAutoLoginEnabled = computed(async () => {
        return await userService.isAutoLoginEnabled();
    })

    async function setAutoLogin (enabled) {
        await userService.setAutoLogin(enabled);
    }

    const hasAccounts = computed(() => {
        return user && user.value && user.value.hasAccounts;
    })

    async function requestLogin({ username, extendSession }) {
        const session = user.value;
        const result = await userService.requestLogin({ username });
        if (user.value !== session) return;
        user.value = result;
        loginNotice.value = '';

        // Temporarily store this value to reuse it once user logged in,
        // And store it in browser storage for next logins
        isExtendedSession.value = extendSession;

        return {
            next: user.value.next
        }
    }

    async function verifyPassword({ password }) {
        const session = user.value;
        const result = await userService.verifyPassword({
            accessToken: user.value.token,
            password: password
        });
        if (user.value !== session) return;
        user.value = result;

        // If there is an extra step for login, return the next step
        if (user.value && user.value.next) {
            return {
                next: user.value.next
            }
        }

        // Otherwise login the user
        isLoggedIn.value = user.value && user.value.uuid ? true : false;

        await createSession(user);
    }

    async function verifyMFA({ totpToken }) {
        const session = user.value;
        const result = await userService.verifyMFA({
            accessToken: user.value.token,
            totpToken: totpToken
        });
        if (user.value !== session) return;
        user.value = result;

        isLoggedIn.value = user.value && user.value.uuid ? true : false;

        await createSession(user);
    }

    // Passkey sign-in against a server-issued challenge (requestLogin's next.passkeyOptions,
    // else POST users/login/passkey/options). A 403 re-enrollment refusal keeps the pre-auth
    // session so the password form can take over, and sets loginNotice with the server reason.
    async function verifyPasskey() {
        const session = user.value;
        const options = session?.next?.passkeyOptions
            || await userService.passkeyLoginOptions(session.token);
        if (user.value !== session) return;

        const assertion = await authenticatePasskey(options);
        if (user.value !== session) return;

        let result;
        try {
            // The API verifies the assertion against the challenge it issued in the options.
            result = await userService.verifyPasskey({
                accessToken: session.token,
                challenge: options.challenge,
                response: assertion,
            });
        } catch (error) {
            if (user.value === session && isPasskeyReenrollmentRequired(error)) {
                loginNotice.value = errorText(error, 'Passkey re-enrollment required.');
            }
            throw error;
        }
        if (user.value !== session) return;
        user.value = result;
        loginNotice.value = '';

        isLoggedIn.value = user.value && user.value.uuid ? true : false;

        await createSession(user);
    }

    async function getLastUpdatedTime() {
        const session = user.value;
        try {
            return await userService.getAccountInformation(user.value.token);
        }
        catch(error) {
            if (user.value !== session) return;
            if (error instanceof SessionExpiredException) {
                await signOut(true); // preserve local cache on session expiry
            }

            throw error;
        }
    }

    async function getAccountInformation() {
        const session = user.value;
        try {
            const result = await userService.getAccountInformation(session.token);
            if (user.value !== session) return;
            user.value = result;
            await userService.setLastActivity();
        }
        catch(error) {
            if (user.value !== session) return;
            if (error instanceof SessionExpiredException) {
                await signOut(true); // preserve local cache on session expiry
            }

            throw error;
        }
    }

    async function update() {
        const session = user.value;
        const result = await userService.update(session);
        if (user.value !== session) return;
        user.value = result;

        await createSession(user);
    }

    const init = async () => {
        if (isDemoRequested()) {
            await startDemo();
            return;
        }

        user.value = await userService.getCachedUser();
        // User's uuid is only filled when logged in successfully
        isLoggedIn.value = user.value && user.value.uuid ? true : false;

        if (isLoggedIn.value) {
            await maybeRefreshSession();
        } else {
            await userService.clearLastActivity();
        }
    }

    async function createSession({ value: user }) {
        if (!user) {
            return;
        }

        await userService.updateCachedUser(user);
        await userService.setLastActivity();

        if (isExtendedSession.value) {
            await setLastRememberedUsername(user.email);
        }
    }

    function isPasskeyLoginSupported (callback, failure) {
        // Availability of `window.PublicKeyCredential` means WebAuthn is usable.
        if (window.PublicKeyCredential &&
            PublicKeyCredential.isConditionalMediationAvailable) {
            // Check if conditional mediation is available.
            PublicKeyCredential.isConditionalMediationAvailable().then(isCMA => {
                if (isCMA) {
                    callback();
                } else {
                    failure();
                }
            }).catch(() => {
                failure();
            });
        } else {
            failure();
        }
    }

    function isPasskeyCreationSupported (callback, failure) {
        // Availability of `window.PublicKeyCredential` means WebAuthn is usable.
        // `isUserVerifyingPlatformAuthenticatorAvailable` means the feature detection is usable.
        // `​​isConditionalMediationAvailable` means the feature detection is usable.
        if (window.PublicKeyCredential &&
            PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable &&
            PublicKeyCredential.isConditionalMediationAvailable) {
            // Check if user verifying platform authenticator is available.
            Promise.all([
                PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable(),
                PublicKeyCredential.isConditionalMediationAvailable(),
            ]).then(results => {
                if (results.every(r => r === true)) {
                    callback();
                } else {
                    failure();
                }
            }).catch(() => {
                failure();
            });
        } else {
            failure();
        }
    }

    // Demo: sign in to an in-memory vault. Any real vault cached on this device is left untouched
    async function startDemo() {
        demoVault.reset();
        setDemoSession(true);

        userService = new DemoUserService();
        isDemo.value = true;

        user.value = await userService.getCachedUser();
        isLoggedIn.value = true;
    }

    async function endDemo() {
        await userService.signOut();
        setDemoSession(false);

        userService = realUserService;
        isDemo.value = false;
    }

    async function signOut(preserveCache = false, { title = 'Signed out', message = 'Your vault is locked on this device.' } = {}) {
        const wasDemo = isDemo.value;
        // Vault unlock key: lock keeps ciphertext for phrase unlock; full sign-out forgets it.
        if (preserveCache) useVaultStore().lock(); else useVaultStore().forget();
        if (user.value) {
            user.value.public_encryption_key = null;
            user.value.token = null;
        }
        isLoggedIn.value = false;
        user.value = null;

        try {
            if (wasDemo) {
                await endDemo();
                title = 'Demo ended';
                message = 'Your demo changes were discarded.';
            } else {
                await userService.signOut(preserveCache);
            }
        } catch (error) {
            console.error('Failed to clear the local session', error);
        }

        alertStore.openAlert(title, message, 'info');
        return true;
    }

    // Lock the vault without wiping the offline cache: the user signs back in to decrypt
    async function lock(reason = 'Locked after a period of inactivity.') {
        if (!isLoggedIn.value) {
            return;
        }

        return await signOut(true, { title: 'Vault locked', message: reason });
    }

    async function maybeRefreshSession() {
        const cachedUser = user.value;

        if (!cachedUser || !cachedUser.token || !cachedUser.tokenExpiry) {
            await userService.setLastActivity();
            return;
        }

        const expiryTime = new Date(cachedUser.tokenExpiry).getTime();

        if (Number.isNaN(expiryTime)) {
            await userService.setLastActivity();
            return;
        }

        const now = Date.now();
        const lastActivity = await userService.getLastActivity();
        const lastActivityTime = typeof lastActivity === 'number'
            ? lastActivity
            : new Date(lastActivity || 0).getTime();

        let sessionEnded = false;

        if (expiryTime <= now) {
            await signOut(true);
            sessionEnded = true;
        } else {
            const timeUntilExpiry = expiryTime - now;
            const hasSatisfiedCooldown = !lastActivityTime || (now - lastActivityTime) >= MIN_REFRESH_INTERVAL_MS;
            const shouldRefresh = hasSatisfiedCooldown && timeUntilExpiry <= SESSION_REFRESH_BUFFER_MS;

            if (shouldRefresh) {
                try {
                    const refreshedUser = await userService.getAccountInformation(cachedUser.token);
                    user.value = refreshedUser;
                    isLoggedIn.value = refreshedUser && refreshedUser.uuid ? true : false;
                    await userService.updateCachedUser(refreshedUser);
                } catch (error) {
                    if (error instanceof SessionExpiredException) {
                        await signOut(true);
                        sessionEnded = true;
                        alertStore.openAlert('Session ended', errorText(error, 'Please sign in again.'), 'danger');
                    } else {
                        console.error('Failed to refresh session', error);
                    }
                }
            }
        }

        if (!sessionEnded) {
            await userService.setLastActivity(now);
        }
    }

    return {
        user,

        isLoggedIn,
        isDemo,
        loginNotice,
        canUsePasskeyLogin,
        lastRememberedUsername,

        isAutoLoginEnabled,
        setAutoLogin,

        hasAccounts,

        init,
        isExtendedSession,
        requestLogin,
        verifyPassword,
        verifyMFA,
        verifyPasskey,

        isPasskeyLoginSupported,
        isPasskeyCreationSupported,

        getAccountInformation,
        getLastUpdatedTime,
        update,
        signOut,
        lock,
        startDemo,
        setLastRememberedUsername
    }
})

export default useUserStore;

import { 
    PASSKEY_RP_NAME,
    PASSKEY_CHALLENGE
} from '../utils/auth'
import {
    create as createWebAuthn,
    get as getWebAuthn,
    parseCreationOptionsFromJSON,
    parseRequestOptionsFromJSON
  } from '@github/webauthn-json/browser-ponyfill';

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useAlertStore, useAccountsStore } from '@/store';
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
        if (!isDemo.value && useAccountsStore().outbox.length && !await signOut(true)) {
            throw new Error('Account switch cancelled; pending edits are still in memory.');
        }
        const session = user.value;
        const result = await userService.requestLogin({ username });
        if (user.value !== session) return;
        user.value = result;

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

    async function verifyPasskey() {
        const session = user.value;
        var options = parseRequestOptionsFromJSON({
            publicKey: { 
                challenge: btoa(user.value.token),
                allowCredentials: [],
                userVerification: 'preferred'
            }
        });

        const passkey = await getWebAuthn(options);
        if (user.value !== session) return;

        const result = await userService.verifyPasskey({
            accessToken: user.value.token,
            passkey: passkey,
        });
        if (user.value !== session) return;
        user.value = result;

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
                await signOut(true, { force: true }); // preserve local cache on session expiry
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
                await signOut(true, { force: true }); // preserve local cache on session expiry
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

    async function generatePasskey(deviceName) {
        const options = parseCreationOptionsFromJSON({
            publicKey: {
                challenge: PASSKEY_CHALLENGE, // No need challenge for registration
                rp: {  
                    name: PASSKEY_RP_NAME
                },
                user: {  
                    id: user.value.uuid,
                    name: user.value.email,
                    displayName: user.value.email
                }, 
                pubKeyCredParams: [{
                    type: 'public-key',
                    alg: -7, // ES256
                },
                {
                    type: 'public-key',
                    alg: -256, // RS256
                },
                {
                    type: 'public-key',
                    alg: -37, // PS256
                }],
                excludeCredentials: [],
                authenticatorSelection: {
                    userVerification: 'preferred', // Do you want to use biometrics or a pin?
                    residentKey: 'required' // Create a resident key e.g. passkey
                },
                attestation: 'indirect',
                extensions: {
                    credProps: true
                }
            }
        });

        const passkey = await createWebAuthn(options);
        
        user.value.passkeys = user.value.passkeys || [];
        user.value.passkeys.push({
            deviceName: deviceName,
            passkey: passkey
        });
    }

    function removePasskey (passkeyToDelete) {
        user.value.passkeys = user.value.passkeys.filter(passkey => passkey.passkey.id !== passkeyToDelete.passkey.id);
    }

    // Demo: sign in to an in-memory vault. Any real vault cached on this device is left untouched
    async function startDemo() {
        if (isLoggedIn.value && !isDemo.value && !await signOut(true)) {
            throw new Error('Demo switch cancelled; pending edits are still in memory.');
        }
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

    async function signOut(preserveCache = false, { title = 'Signed out', message = 'Your vault is locked on this device.', force = false } = {}) {
        const pending = !isDemo.value && useAccountsStore().outbox.length > 0;
        if (pending) {
            const warning = 'Unsaved edits exist in memory only. Locking or signing out will discard them. Cancel to retry saving online first.';
            if (!force && !window.confirm(warning)) return false;
            // Forced expiry/auto-lock must still revoke keys; show the loss explicitly.
            // Persistent notice already warned that automatic lock discards drafts.
            // Do not block key revocation behind a native modal.
            message += ' Unsaved memory-only edits were discarded; they were not synced.';
        }
        // Revoke application capabilities before any storage/network await.
        const wasDemo = isDemo.value;
        if (user.value) {
            user.value.public_encryption_key = null;
            user.value.token = null;
        }
        isLoggedIn.value = false;
        user.value = null;
        if (pending && force) window.alert('Unsaved memory-only edits were discarded by automatic lock or session expiry. They were not synced.');
        try {
            if (wasDemo) {
                await endDemo();
                title = 'Demo ended';
                message = 'Your demo changes were discarded.';
            } else {
                await userService.signOut(preserveCache);
            }
        } catch (_) {
            message += ' Device storage cleanup failed. Close other Jisme tabs and clear the old session when storage is available; keep legacy pending data for recovery.';
        }
        alertStore.openAlert(title, message, 'info');
        return true;
    }

    // Lock the vault without wiping the offline cache: the user signs back in to decrypt
    async function lock(reason = 'Locked after a period of inactivity.', { force = false } = {}) {
        if (!isLoggedIn.value) {
            return;
        }

        return await signOut(true, { title: 'Vault locked', message: reason, force });
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
            await signOut(true, { force: true });
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
                        await signOut(true, { force: true });
                        sessionEnded = true;
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
        lastRememberedUsername,

        isAutoLoginEnabled,
        setAutoLogin,

        hasAccounts,

        init,
        requestLogin,
        verifyPassword,
        verifyMFA,
        verifyPasskey,

        isPasskeyLoginSupported,
        isPasskeyCreationSupported,

        getAccountInformation,
        getLastUpdatedTime,
        update,
        generatePasskey,
        removePasskey,
        signOut,
        lock,
        startDemo,
        setLastRememberedUsername
    }
})

export default useUserStore;

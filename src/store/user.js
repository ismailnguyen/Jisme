import { sealSessionEnvelope, openSessionEnvelope, SessionEnvelopeError, SESSION_ENVELOPE_MAX_AGE_DAYS } from '../utils/sessionEnvelope'
import { createPrfSalt } from '../utils/vaultPasskey'
import { toBase64url } from '../utils/vaultBlob'
import { authenticateWithPrf, isSessionPrfSupported, authenticatePasskey } from '../utils/webauthn'
import { isPasskeyReenrollmentRequired, errorText } from '../utils/apiError'

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useAlertStore, useAccountsStore, useVaultStore } from '@/store';
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
    const canResumeSession = ref(false);
    let sessionEpoch = 0;
    let restoring = false;
    const isDemo = ref(false);
    const realUserService = new UserService();
    let userService = realUserService;
    const isExtendedSession = ref(false);
    // Explanatory notice for the password form after a passkey sign-in was refused
    // (403 "Passkey re-enrollment required"). Cleared on the next login attempt.
    const loginNotice = ref('');

    // Offer "Sign in with passkey" when the server says the account has a verified passkey,
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
        if (!enabled) await clearSessionEnvelope();
        else if (isLoggedIn.value) { isExtendedSession.value = true; await persistSession(); }
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

        const passkey = await authenticatePasskey(options);
        if (user.value !== session) return;

        let result;
        try {
            result = await userService.verifyPasskey({
                accessToken: session.token,
                passkey: passkey,
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

        await userService.getCachedUser();
        await restoreSession();
        if (!isLoggedIn.value) await userService.clearLastActivity();
    }

    async function clearSessionEnvelope (credentialId) {
        const envelope = await realUserService.getSessionEnvelope();
        if (!credentialId || envelope?.credentialId === credentialId) {
            sessionEpoch++;
            canResumeSession.value = false;
            await realUserService.clearSessionEnvelope();
        }
    }

    const localOptions = ids => ({
        challenge: toBase64url(globalThis.crypto.getRandomValues(new Uint8Array(32))),
        allowCredentials: ids.map(id => ({ id, type: 'public-key' })),
        userVerification: 'required', timeout: 60000,
    });

    async function persistSession () {
        if (isDemo.value || !isExtendedSession.value || !await realUserService.isAutoLoginEnabled()) return;
        const session = user.value;
        const started = sessionEpoch;
        await realUserService.clearSessionEnvelope();
        const ids = (session?.passkeys || []).filter(p => p?.verified === true).map(p => p.id || p.credentialId).filter(Boolean);
        if (!ids.length || !session?.email || !session.token || !await isSessionPrfSupported()) return;
        let prfOutput;
        try {
            const salt = createPrfSalt();
            const result = await authenticateWithPrf(localOptions(ids), { salt });
            prfOutput = result.prfOutput;
            if (!ids.includes(result.credentialId)) throw new SessionEnvelopeError();
            const envelope = await sealSessionEnvelope(session, prfOutput, { owner: session.email, credentialId: result.credentialId, salt });
            if (started !== sessionEpoch || user.value !== session || !isLoggedIn.value) return;
            await realUserService.setLastRememberedUsername(session.email);
            await realUserService.saveSessionEnvelope(envelope);
            if (started !== sessionEpoch) await realUserService.clearSessionEnvelope();
        } catch (_) { /* Persistence is optional; unsupported PRF never prevents login. */ }
        finally { prfOutput?.fill(0); }
    }

    async function restoreSession () {
        if (restoring || isLoggedIn.value) return false;
        restoring = true;
        const started = sessionEpoch;
        let prfOutput;
        try {
            if (!await realUserService.isAutoLoginEnabled()) return false;
            const envelope = await realUserService.getSessionEnvelope();
            if (!envelope) return false;
            const now = Date.now();
            if (!(new Date(envelope.tokenExpiry).getTime() > now) || !Number.isFinite(envelope.sealedAt)
                || envelope.sealedAt > now || now - envelope.sealedAt > SESSION_ENVELOPE_MAX_AGE_DAYS * 86400000) {
                await clearSessionEnvelope(); return false;
            }
            canResumeSession.value = true;
            const owner = await realUserService.lastRememberedUsername();
            const result = await authenticateWithPrf(localOptions([envelope.credentialId]), { salt: envelope.salt });
            prfOutput = result.prfOutput;
            if (result.credentialId !== envelope.credentialId) throw new SessionEnvelopeError();
            const restored = await openSessionEnvelope(prfOutput, envelope, owner);
            if (!restored.passkeys?.some(p => p.verified === true && (p.id || p.credentialId) === envelope.credentialId)
                || !(new Date(restored.tokenExpiry).getTime() > Date.now())) throw new SessionEnvelopeError();
            if (started !== sessionEpoch) return false;
            useVaultStore().lock();
            user.value = restored;
            isLoggedIn.value = true;
            canResumeSession.value = false;
            await realUserService.setLastActivity();
            await maybeRefreshSession();
            return isLoggedIn.value;
        } catch (error) {
            if (!['NotAllowedError', 'AbortError', 'PrfUnsupportedError'].includes(error?.name)) await clearSessionEnvelope();
            return false;
        } finally { prfOutput?.fill(0); restoring = false; }
    }

    async function createSession({ value: user }) {
        if (!user) {
            return;
        }

        await userService.updateCachedUser(user);
        if (!isDemo.value) await realUserService.clearSessionEnvelope();
        await persistSession();
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
        sessionEpoch++;
        canResumeSession.value = false;
        // Revoke application capabilities before any storage/network await.
        const wasDemo = isDemo.value;
        // Vault unlock key: lock keeps ciphertext for phrase unlock; full sign-out forgets it.
        if (preserveCache) useVaultStore().lock(); else useVaultStore().forget();
        if (user.value) {
            user.value.public_encryption_key = null;
            user.value.token = null;
        }
        isLoggedIn.value = false;
        user.value = null;
        if (pending && force) window.alert('Unsaved memory-only edits were discarded by automatic lock or session expiry. They were not synced.');
        try {
            await realUserService.clearSessionEnvelope();
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
        loginNotice,
        canUsePasskeyLogin,
        lastRememberedUsername,

        isAutoLoginEnabled,
        setAutoLogin,

        hasAccounts,

        init,
        restoreSession,
        canResumeSession,
        clearSessionEnvelope,
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

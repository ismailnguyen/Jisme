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
import { useAlertStore } from '@/store';
import { APP_USER_STORE } from '../utils/store'
import UserService from '../services/UserService'
import { SessionExpiredException } from '../utils/errors'

const useUserStore = defineStore(APP_USER_STORE, () => {
    const user = ref({});
    const isLoggedIn = ref(false);
    const userService = new UserService();
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
        user.value = await userService.requestLogin({ username });

        // Temporarily store this value to reuse it once user logged in,
        // And store it in browser storage for next logins
        isExtendedSession.value = extendSession;

        return {
            next: user.value.next
        }
    }

    async function verifyPassword({ password }) {
        user.value = await userService.verifyPassword({ 
            accessToken: user.value.token,
            password: password
        });

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
        user.value = await userService.verifyMFA({
            accessToken: user.value.token,
            totpToken: totpToken
        });

        isLoggedIn.value = user.value && user.value.uuid ? true : false;

        await createSession(user);
    }

    async function verifyPasskey() {
        var options = parseRequestOptionsFromJSON({
            publicKey: { 
                challenge: btoa(user.value.token),
                allowCredentials: [],
                userVerification: 'preferred'
            }
        });

        const passkey = await getWebAuthn(options);

        user.value = await userService.verifyPasskey({
            accessToken: user.value.token,
            passkey: passkey,
        });

        isLoggedIn.value = user.value && user.value.uuid ? true : false;

        await createSession(user);
    }

    async function getLastUpdatedTime() { 
        try {
            return await userService.getAccountInformation(user.value.token);
        }
        catch(error) {
            if (error instanceof SessionExpiredException) {
                await signOut();
            }

            throw error;
        }
    }

    async function getAccountInformation() { 
        try {
            user.value = await userService.getAccountInformation(user.value.token);
        }
        catch(error) {
            if (error instanceof SessionExpiredException) {
                await signOut();
            }

            throw error;
        }
    }

    async function update() {
        user.value = await userService.update(user.value);

        await createSession(user);
    }

    const init = async () => {
        user.value = await userService.getCachedUser();
        // User's uuid is only filled when logged in successfully
        isLoggedIn.value = user.value && user.value.uuid ? true : false;
    }

    async function createSession({ value: user }) {
        if (!user) {
            return;
        }

        await userService.updateCachedUser(user);

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

    async function signOut() {
        await userService.signOut();

        alertStore.openAlert('Logged out', 'You have been successfully logged out.', 'info');

        isLoggedIn.value = false;
        user.value = null;

        //location.reload();
    }
    
    return {
        user,

        isLoggedIn,
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
        setLastRememberedUsername
    }
})

export default useUserStore;

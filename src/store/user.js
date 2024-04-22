import { 
    LOCAL_STORAGE_DB_NAME,
    LOCAL_STORAGE_USER_KEY,
    LOCAL_STORAGE_LAST_REMEMBERED_USERNAME_KEY,
 } from '../utils/storage'
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
import localforage from 'localforage'

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { APP_USER_STORE } from '../utils/store'
import UserService from '../services/UserService'

localforage.config({
    name: LOCAL_STORAGE_DB_NAME
});

const useUserStore = defineStore(APP_USER_STORE, () => {
    const user = ref({})
    const isLoggedIn = ref(false)
    const userService = new UserService()
    const passkeyOptions = ref(null)

    const lastRememberedUsername = computed(async () => {
        return await localforage.getItem(LOCAL_STORAGE_LAST_REMEMBERED_USERNAME_KEY)
    })

    async function requestLogin({ username }) {
        user.value = await userService.requestLogin({ username });

        return {
            next: user.value.next
        }
    }

    async function verifyPassword({ password }) {
        user.value = await userService.verifyPassword({ 
            accessToken: user.value.token,
            password: password
        });

        return {
            next: user.value.next
        }
    }

    async function verifyMFA({ totpToken, extendedSession }) {
        user.value = await userService.verifyMFA({
            accessToken: user.value.token,
            totpToken: totpToken,
            extendedSession: extendedSession
        });

        isLoggedIn.value = user.value && user.value.uuid ? true : false;

        if (isLoggedIn.value && extendedSession) {
            setLastRememberedUsername(user.value.email);
        }

        createSession(user);
    }

    async function getAccountInformation() { 
        user.value = await userService.getAccountInformation(user.value.token);
    }

    async function update() {
        user.value = await userService.update(user.value);

        createSession(user);
    }

    const init = async () => {
        user.value = await localforage.getItem(LOCAL_STORAGE_USER_KEY);
        // User's uuid is only filled when logged in successfully
        isLoggedIn.value = user.value && user.value.uuid ? true : false;
    }

    async function createSession({ value: user }) {
        if (!user) {
            return;
        }

        localforage.setItem(LOCAL_STORAGE_USER_KEY, {
            uuid: user.uuid,
            avatarUrl: user.avatarUrl,
            email: user.email,
            token: user.token,
            public_encryption_key: user.public_encryption_key
        });
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

        createSession(user);
    }

    async function signOut() {
        isLoggedIn.value = false;
        user.value = null;

        localforage.removeItem(LOCAL_STORAGE_USER_KEY);
        localforage.clear();
    }

    async function setLastRememberedUsername (username) {
        localforage.setItem(LOCAL_STORAGE_LAST_REMEMBERED_USERNAME_KEY, username);
    }
    
    return {
        user,

        isLoggedIn,
        lastRememberedUsername,

        init,
        requestLogin,
        verifyPassword,
        verifyMFA,

        verifyPasskey,
        getAccountInformation,
        update,
        createSession,
        generatePasskey,
        removePasskey,
        signOut,
        setLastRememberedUsername
    }
})

export default useUserStore;

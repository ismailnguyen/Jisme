import { 
    LOCAL_STORAGE_DB_NAME,
    LOCAL_STORAGE_USER_KEY,
    LOCAL_STORAGE_LAST_REMEMBERED_USERNAME_KEY,
 } from '../utils/storage'
import { 
    PASSKEY_RP_NAME,
    PASSKEY_CHALLENGE
} from '../utils/auth'
import localforage from 'localforage'

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { APP_USER_STORE } from '../utils/store'
import UserService from '../services/UserService'

localforage.config({
    name: LOCAL_STORAGE_DB_NAME
});

const useUserStore = defineStore(APP_USER_STORE, () => {
    const user = ref(null)
    const isLoggedIn = ref(false)
    const userService = new UserService()

    const lastRememberedUsername = computed(async () => {
        return await localforage.getItem(LOCAL_STORAGE_LAST_REMEMBERED_USERNAME_KEY)
    })

    async function login({ username, password }) {
        user.value = await userService.login({ username, password });

        return {
            token: user.value.token,
            isMFARequired: user.value.isMFARequired
        }
    }

    async function loginPasswordless() { 
        const options = {
            publicKey: {
                challenge: PASSKEY_CHALLENGE,
                allowCredentials: [],
                userVerification: "preferred",
            }
        };

        const passkey = await navigator.credentials.get(options);

        user.value = await userService.loginPasswordless(passkey);

        createSession(user);
    }

    async function verifyMFA({ accessToken, totpToken, extendedSession }) {
        user.value = await userService.verifyMFA({ accessToken, totpToken, extendedSession });
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

    async function createSession({ value }) {
        if (!value) {
            return;
        }

        localforage.setItem(LOCAL_STORAGE_USER_KEY, {
            uuid: value.uuid,
            avatarUrl: value.avatarUrl,
            email: value.email,
            token: value.token,
            public_encryption_key: value.public_encryption_key
        });
    }

    async function generatePasskey(deviceName) {
        const options = parseCreationOptionsFromJSON({
            publicKey: {
                challenge: user.uuid,
                rp: {  
                    name: PASSKEY_RP_NAME
                },  
                user: {  
                    id: user.uuid,
                    name: user.email,  
                    displayName: user.email,  
                }, 
                pubKeyCredParams: [],
                excludeCredentials: [],
                authenticatorSelection: {
                    userVerification: "preferred",
                },
                extensions: {
                    credProps: true,
                }
            }
        });

        const passkey = await navigator.credentials.create(options);
        
        user.passkeys = user.passkeys || [];
        user.passkeys.push({
            deviceName: deviceName,
            passkey: passkey
        });
    }

    function removePasskey (passkeyToDelete) {
        user.passkeys = user.passkeys.filter(passkey => passkey.passkey.id !== passkeyToDelete.passkey.id);
    }

    async function signOut() {
        isLoggedIn.value = false;

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
        login,
        loginPasswordless,
        getAccountInformation,
        verifyMFA,
        update,
        createSession,
        generatePasskey,
        removePasskey,
        signOut,
        setLastRememberedUsername
    }
})

export default useUserStore;

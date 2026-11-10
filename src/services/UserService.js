import { 
    LOCAL_STORAGE_SESSION_ENVELOPE_KEY,
    LOCAL_STORAGE_DB_NAME,
    LOCAL_STORAGE_USER_KEY,
    LOCAL_STORAGE_LAST_REMEMBERED_USERNAME_KEY,
    LOCAL_STORAGE_IS_AUTO_LOGIN_ENABLED_KEY,
    LOCAL_STORAGE_ACCOUNTS_KEY,
    LOCAL_STORAGE_RECENT_ACCOUNTS_KEY,
    LOCAL_STORAGE_LAST_ACTIVITY_KEY
 } from '../utils/storage'
import localforage from 'localforage'

import { BASE_API_URL } from '../utils/api'
import { getHeaders, getHeadersWithAuth } from '../utils/requestHeader'
import { Exception, LoginException, SessionExpiredException } from '../utils/errors'
import { PasskeyService } from './PasskeyService'

localforage.config({
    name: LOCAL_STORAGE_DB_NAME
});

const USERS_API_URL = `${ BASE_API_URL }users`;
const passkeyService = new PasskeyService();

class UserService {
    constructor() {}

    async saveSessionEnvelope (envelope) { await localforage.setItem(LOCAL_STORAGE_SESSION_ENVELOPE_KEY, envelope); }
    async getSessionEnvelope () { return await localforage.getItem(LOCAL_STORAGE_SESSION_ENVELOPE_KEY); }
    async clearSessionEnvelope () { await localforage.removeItem(LOCAL_STORAGE_SESSION_ENVELOPE_KEY); }

    async getCachedUser () {
        // Legacy sessions included a raw data key. Never restore that capability.
        // Account caches and the unowned legacy outbox remain untouched for recovery.
        await localforage.removeItem(LOCAL_STORAGE_USER_KEY);
        return null;
    }

    async updateCachedUser () {
        // Until wrapped local vault unlock exists, sessions/keys are memory-only.
        await localforage.removeItem(LOCAL_STORAGE_USER_KEY);
    }

    async getLastActivity () {
        return await localforage.getItem(LOCAL_STORAGE_LAST_ACTIVITY_KEY);
    }

    async setLastActivity (timestamp = Date.now()) {
        await localforage.setItem(LOCAL_STORAGE_LAST_ACTIVITY_KEY, timestamp);
    }

    async clearLastActivity () {
        await localforage.removeItem(LOCAL_STORAGE_LAST_ACTIVITY_KEY);
    }

    async lastRememberedUsername () {
        return await localforage.getItem(LOCAL_STORAGE_LAST_REMEMBERED_USERNAME_KEY);
    }

    async setLastRememberedUsername (username) {
        await localforage.setItem(LOCAL_STORAGE_LAST_REMEMBERED_USERNAME_KEY, username);
    }

    async isAutoLoginEnabled () {
        return await localforage.getItem(LOCAL_STORAGE_IS_AUTO_LOGIN_ENABLED_KEY);
    }

    async setAutoLogin (enabled) {
        await localforage.setItem(LOCAL_STORAGE_IS_AUTO_LOGIN_ENABLED_KEY, enabled);
    }

    async getAccountInformation (accessToken) {
        try {
            const response = await fetch(USERS_API_URL, {
                method: 'GET',
                headers: getHeadersWithAuth(accessToken)
            });

            if (response.ok) {
                return await response.json();
            }

            const { error } = await response.json();

            error.code = error.code || response.status;
            this.throwError(error);
        }
        catch (error) {
            this.throwError(error);
        }
    }

    async update (user) {
        try {
            const response = await fetch(USERS_API_URL, {
                method: 'PUT',
                headers: getHeadersWithAuth(user.token),
                body: JSON.stringify(user)
            });

            if (response.ok) {
                return await response.json();
            }

            const { error } = await response.json();

            error.code = error.code || response.status;
            this.throwError(error);
        }
        catch (error) {
            this.throwError(error);
        }
    }

    async signOut (preserveCache = false) {
        await this.clearSessionEnvelope();
        // Always remove user session/token info
        await localforage.removeItem(LOCAL_STORAGE_USER_KEY);
        await this.clearLastActivity();

        // Legacy caches can include unsynced local changes. They are quarantined,
        // not read by this client, and must not be silently deleted on logout.
    }

    async requestLogin ({ username }) {
        let credentials = {
            email: username
        };

        try {
            const response = await fetch(`${USERS_API_URL}/login`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(credentials)
            });

            const body = await response.json();

            if (!response.ok) {
                if (response.status === 400) {
                    throw new LoginException('Username is mandatory!');
                }

                if (response.status === 401) {
                    throw new LoginException('Not authorized!', 'Pease try later.');
                }

                if (response.status === 404) {
                    throw new LoginException('Incorrect username or password.');
                }

                throw new LoginException(body.message);
            }

            return body;
        } catch (error) {
            if (error instanceof LoginException) {
                throw error;
            }

            this.throwError(error);
        }
    }

    async verifyPassword ({ accessToken, password }) {
        let credentials = {
            password: password
        };

        try {
            const response = await fetch(`${USERS_API_URL}/login/password`, {
                method: 'POST',
                headers: getHeadersWithAuth(accessToken),
                body: JSON.stringify(credentials)
            });

            const body = await response.json();

            if (!response.ok) {
                if (response.status === 400) {
                    throw new LoginException('Password is mandatory!');
                }

                if (response.status === 401) {
                    throw new LoginException('Not authorized!', 'Pease try later.');
                }

                if (response.status === 404) {
                    throw new LoginException('Incorrect username or password.');
                }

                throw new LoginException(body.message);
            }

            return body;
        } catch (error) {
            if (error instanceof LoginException) {
                throw error;
            }

            this.throwError(error);
        }
    }

    // Server-issued challenge for passkey sign-in (docs/passkey-ux-design.md).
    async passkeyLoginOptions (accessToken) {
        return await passkeyService.loginOptions(accessToken);
    }

    // Passkey sign-in. Errors keep the server reason (ApiError): a 403 "Passkey re-enrollment
    // required" must reach the login screen intact so it can fall back to the password form.
    async verifyPasskey ({ accessToken, passkey }) {
        return await passkeyService.login(accessToken, passkey);
    }

    async verifyMFA ({ accessToken, totpToken }) {
        let mfa = {
            totpToken: totpToken
        };

        try {
            const response = await fetch(`${USERS_API_URL}/login/otp`, {
                method: 'POST',
                headers: getHeadersWithAuth(accessToken),
                body: JSON.stringify(mfa)
            });

            const body = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    throw new LoginException('Invalid TOTP code!');
                }

                throw new LoginException(body.message);
            }

            return body;
        }
        catch (error) {
            if (error instanceof LoginException) {
                throw error;
            }

            this.throwError(error);
        }
    }

    throwError(error) {
        if (error.code > 400 && error.code < 500) {
            throw new SessionExpiredException()
        }

        throw new Exception(
            error.reason || 'Error',
            error.message || 'Please retry',
            error.code || 500
        )
    }
}

export default UserService;

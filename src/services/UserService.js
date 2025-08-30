import { 
    LOCAL_STORAGE_DB_NAME,
    LOCAL_STORAGE_USER_KEY,
    LOCAL_STORAGE_LAST_REMEMBERED_USERNAME_KEY,
    LOCAL_STORAGE_IS_AUTO_LOGIN_ENABLED_KEY,
    LOCAL_STORAGE_ACCOUNTS_KEY,
    LOCAL_STORAGE_RECENT_ACCOUNTS_KEY
 } from '../utils/storage'
import localforage from 'localforage'

import { BASE_API_URL } from '../utils/api'
import { getHeaders, getHeadersWithAuth } from '../utils/requestHeader'
import { Exception, LoginException, SessionExpiredException } from '../utils/errors'

localforage.config({
    name: LOCAL_STORAGE_DB_NAME
});

const USERS_API_URL = `${ BASE_API_URL }users`;

class UserService {
    constructor() {}

    async getCachedUser () {
        return await localforage.getItem(LOCAL_STORAGE_USER_KEY);
    }

    async updateCachedUser (user) {
        await localforage.setItem(LOCAL_STORAGE_USER_KEY, {
            uuid: user.uuid,
            avatarUrl: user.avatarUrl,
            email: user.email,
            token: user.token,
            public_encryption_key: user.public_encryption_key,
            hasAccounts: user.hasAccounts
        });
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
        // Always remove user session/token info
        await localforage.removeItem(LOCAL_STORAGE_USER_KEY);

        // Optionally preserve cached accounts for faster re-login (e.g., session expired)
        if (!preserveCache) {
            await localforage.removeItem(LOCAL_STORAGE_RECENT_ACCOUNTS_KEY);
            await localforage.removeItem(LOCAL_STORAGE_ACCOUNTS_KEY);
        }
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

    async verifyPasskey ({ accessToken, passkey }) {
        try {
            const response = await fetch(`${USERS_API_URL}/login/passkey`, {
                method: 'POST',
                headers: getHeadersWithAuth(accessToken),
                body: JSON.stringify({
                    passkey: passkey
                })
            });

            const body = await response.json();

            if (!response.ok) {
                const { error} = body;

                if (response.status === 400) {
                    throw new LoginException('A valid passkey is mandatory!', error.reason || error.message);
                }

                if (response.status === 401) {
                    throw new LoginException('Not authorized!', error.reason || error.message || 'Pease try later.');
                }

                if (response.status === 404) {
                    throw new LoginException(error.message || 'Invalid passkey !', error.reason || error.message);
                }

                throw new LoginException(error.reason || error.message || body.message);
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

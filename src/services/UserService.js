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
import { LoginException } from '../utils/errors'

localforage.config({
    name: LOCAL_STORAGE_DB_NAME
});

class UserService {
    constructor() {
        const USERS_API_URL = BASE_API_URL + 'users';

        this.getCachedUser = async function () {
            return await localforage.getItem(LOCAL_STORAGE_USER_KEY);
        }

        this.updateCachedUser = async function (user) {
            await localforage.setItem(LOCAL_STORAGE_USER_KEY, {
                uuid: user.uuid,
                avatarUrl: user.avatarUrl,
                email: user.email,
                token: user.token,
                public_encryption_key: user.public_encryption_key
            });
        }

        this.lastRememberedUsername = async function () {
            return await localforage.getItem(LOCAL_STORAGE_LAST_REMEMBERED_USERNAME_KEY);
        }

        this.setLastRememberedUsername = async function (username) {
            await localforage.setItem(LOCAL_STORAGE_LAST_REMEMBERED_USERNAME_KEY, username);
        }

        this.isAutoLoginEnabled = async function () {
            return await localforage.getItem(LOCAL_STORAGE_IS_AUTO_LOGIN_ENABLED_KEY);
        }

        this.setAutoLogin = async function (enabled) {
            await localforage.setItem(LOCAL_STORAGE_IS_AUTO_LOGIN_ENABLED_KEY, enabled);
        }

        this.getAccountInformation = async function (accessToken) {
            try {
                const response = await fetch(USERS_API_URL, {
                    method: 'GET',
                    headers: getHeadersWithAuth(accessToken)
                });

                return await response.json();
            }
            catch (error) {
                throw new Error('Server unavailable!');
            }
        };

        this.update = async function (user) {
            try {
                const response = await fetch(USERS_API_URL, {
                    method: 'PUT',
                    headers: getHeadersWithAuth(user.token),
                    body: JSON.stringify(user)
                });

                return await response.json();
            }
            catch (error) {
                throw new Error('Server unavailable!');
            }
        };

        this.signOut = async function () {
            // Remove all user related data from local storage
            await localforage.removeItem(LOCAL_STORAGE_USER_KEY);

            // Remove all user's accounts from local storage
            await localforage.removeItem(LOCAL_STORAGE_RECENT_ACCOUNTS_KEY);
            await localforage.removeItem(LOCAL_STORAGE_ACCOUNTS_KEY);
        }

        this.requestLogin = async function ({ username }) {
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
                        throw new LoginException('Invalid username/password !');
                    }

                    throw new LoginException(body.message);
                }

                return body;
            } catch (error) {
                if (error instanceof LoginException) {
                    throw error;
                }

                throw new Error('Server unavailable!');
            }
        };

        this.verifyPassword = async function ({ accessToken, password }) {
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
                        throw new LoginException('Invalid username/password !');
                    }

                    throw new LoginException(body.message);
                }

                return body;
            } catch (error) {
                if (error instanceof LoginException) {
                    throw error;
                }

                throw new Error('Server unavailable!');
            }
        };

        this.verifyPasskey = async function ({ accessToken, passkey }) {
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

                throw new Error('Server unavailable!');
            }
        };

        this.verifyMFA = async function ({ accessToken, totpToken }) {
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

                throw new Error('Server unavailable!');
            }
        };
    }
}

export default UserService;

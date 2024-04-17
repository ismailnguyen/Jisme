import { BASE_API_URL } from '../utils/api'
import { getHeaders, getHeadersWithAuth } from '../utils/requestHeader'
import { LoginException } from '../utils/errors'

class UserService {
    constructor() {
        const USERS_API_URL = BASE_API_URL + 'users';

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

        this.login = async function ({ username, password }) {
            let credentials = {
                email: username,
                password: password
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
                        throw new LoginException('Username and password are mandatory!');
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

        this.requestPasswordlessLogin = async function () {
            try {
                const response = await fetch(`${USERS_API_URL}/login-passkey`, {
                    method: 'GET',
                    headers: getHeaders()
                });

                return await response.json();
            }
            catch (error) {
                throw new Error('Server unavailable!');
            }
        };

        this.loginPasswordless = async function (passkey, challenge) {
            try {
                const response = await fetch(`${USERS_API_URL}/login-passkey`, {
                    method: 'POST',
                    headers: getHeaders(),
                    body: JSON.stringify({
                        passkey: passkey,
                        challenge: challenge
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
                        throw new LoginException('Invalid passkey !', error.reason || error.message);
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

        this.verifyMFA = async function ({ accessToken, totpToken, extendSession }) {
            let mfa = {
                totpToken: totpToken,
                extendSession: extendSession
            };

            try {
                const response = await fetch(`${USERS_API_URL}/verify-mfa`, {
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

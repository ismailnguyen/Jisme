import { BASE_API_URL } from '../utils/api'
import { getHeaders, getHeadersWithAuth } from '../utils/requestHeader'

class UserService {
    constructor() {
        const USERS_API_URL = BASE_API_URL + 'users/';

        this.getAccountInformation = async function (accessToken) {
            try {
                const response = await fetch(USERS_API_URL,
                    {
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
                const response = await fetch(USERS_API_URL,
                    {
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
                const response = await fetch(`${USERS_API_URL}/login/`,
                    {
                        method: 'POST',
                        headers: getHeaders(),
                        body: JSON.stringify(credentials)
                    });

                const body = await response.json();

                if (!response.ok) {
                    if (response.status === 400) {
                        throw new Error('Username and password are mandatory!');
                    }

                    if (response.status === 404) {
                        throw new Error('Invalid username/password !');
                    }

                    throw new Error(body.message);
                }

                return body;
            } catch (error) {
                throw new Error('Server unavailable!');
            }
        };

        this.loginPasswordless = async function (passkey) {
            try {
                const response = await fetch(`${USERS_API_URL}/login-passkey/`,
                    {
                        method: 'POST',
                        headers: getHeaders(),
                        body: JSON.stringify(passkey)
                    });

                return await response.json();
            }
            catch (error) {
                throw new Error('Server unavailable!');
            }
        };

        this.verifyMFA = async function ({ accessToken, totpToken, extendSession }) {
            let mfa = {
                totpToken: totpToken,
                extendSession: extendSession
            };

            try {
                const response = await fetch(`${USERS_API_URL}/verify-mfa/`,
                    {
                        method: 'POST',
                        headers: getHeadersWithAuth(accessToken),
                        body: JSON.stringify(mfa)
                    });

                const body = await response.json();

                if (!response.ok) {
                    if (response.status === 401) {
                        throw new Error('Invalid TOTP code!');
                    }

                    throw new Error(body.message);
                }

                return body;
            }
            catch (error) {
                throw new Error('Server unavailable!');
            }
        };
    }
}

export default UserService;

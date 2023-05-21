import {
    setLastRememberedUsername,
    createSession,
    destroySession } from '../utils/auth'
import { BASE_API_URL } from '../utils/api'
import { getHeaders, getHeadersWithAuth } from '../utils/requestHeader'

function UserService()
{
    const USERS_API_URL = BASE_API_URL + 'users/';

    this.update = function (user)
    {
        return fetch(USERS_API_URL,
        {
            method: 'PUT',
            headers: getHeadersWithAuth(user.token),
            body: JSON.stringify(user)
        })
        .then(response => response.clone().json())
        .then(updatedUser => {
            console.log(updatedUser)
            createSession(updatedUser)
        });
    }

    this.login = function ({ email, password, remember }, callback)
    {
        let credentials =
        {
            email: email,
            password: password,
            extendSession: remember
        };

        return fetch(USERS_API_URL + 'login',
        {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(credentials)
        })
        .then(handleLoginErrors)
        .then(response => response.clone().json())
        .then(user => 
        {
            createSession(user);
            
            if (remember) {
                setLastRememberedUsername(user.email);
            }

            callback(user.isMFARequired);
        });
    }

    this.loginPasswordless = function (passkey) {
        return fetch(USERS_API_URL + 'login-passkey',
        {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(passkey)
        })
        .then(handleLoginErrors)
        .then(response => response.clone().json())
        .then(user => 
        {
            createSession(user);
        });
    }

    this.verifyMFA = function ({ accessToken, totpToken }, callback)
    {
        let mfa =
        {
            totpToken: totpToken
        };

        return fetch(USERS_API_URL + 'verify-mfa',
        {
            method: 'POST',
            headers: getHeadersWithAuth(accessToken),
            body: JSON.stringify(mfa)
        })
        .then(handleLoginErrors)
        .then(response => response.clone().json())
        .then(user => 
        {
            createSession(user);

            callback();
        });
    }

    this.logout = function (callback)
    {
        destroySession();

        callback();
    }

    function handleLoginErrors (response)
    {
        let clonedResponse = response.clone();
        if (!clonedResponse.ok)
        {
            if (clonedResponse.status === 404)
            {
                throw Error('Invalid username/password !');
            }

            if (clonedResponse.status === 401)
            {
                throw Error('Invalid or expired !');
            }
            
            throw Error(clonedResponse.statusText);
        }

        return clonedResponse;
    }
};

export default UserService;

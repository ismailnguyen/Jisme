import { getUser, createSession, destroySession } from '../utils/auth'

function UserService()
{
    const USERS_API_URL = '/api/users/';

    this.login = function (email, password)
    {
        let credentials =
        {
            email: email,
            password: password
        };

        return fetch(USERS_API_URL + 'login/', 
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        })
        .then(handleLoginErrors)
        .then(response => response.json())
        .then(user => createSession(user));
    }

    this.logout = function ()
    {
        destroySession();
    }

    function handleLoginErrors (response)
    {
        if (!response.ok)
        {
            if (response.status === 404)
            {
                throw Error('Invalid username/password !');
            }
            
            throw Error(response.statusText);
        }

        return response;
    }
};

export default UserService;
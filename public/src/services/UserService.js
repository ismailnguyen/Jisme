import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter);

var router = new VueRouter({
    mode: 'history'
});

import { getUser, createSession, destroySession } from '../utils/auth'
import { BASE_API_URL } from '../utils/api'
import { getHeaders, getHeadersWithAuth } from '../utils/requestHeader'

function UserService()
{
    const USERS_API_URL = BASE_API_URL + 'users/';

    this.update = function (user)
    {
        user.last_update_date = new Date();

        return fetch(USERS_API_URL + user._id,
        {
            method: 'PUT',
            headers: getHeadersWithAuth(user.email, user.token),
            body: JSON.stringify(user)
        })
        .then(response => createSession(user));
    }

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
            headers: getHeaders(),
            body: JSON.stringify(credentials)
        })
        .then(handleLoginErrors)
        .then(response => response.json())
        .then(user => 
        {
            createSession(user);

            router.push('/');
            location.reload();
        });
    }

    this.logout = function ()
    {
        destroySession();

        router.go('/');
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
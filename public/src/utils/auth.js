import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter);

var router = new VueRouter({
    mode: 'history'
});

import UserService from '../services/UserService'

export function isLoggedIn()
{
    if (localStorage.getItem('user') === null)
    {
        return false;
    }

    return true;
}

export function logout()
{
    localStorage.removeItem('user');

    router.go('/');
}

export function requireAuth(to, from, next)
{
    if (!isLoggedIn())
    {
        next({
            path: '/login',
            //query: { redirect: to.fullPath }
        });
    }
    else
    {
        next();
    }
}

export function getUser()
{
    return JSON.parse(localStorage.getItem('user'));
}

export function login(email, password)
{
    let userService = new UserService();
    userService.login(email, password)
    .then(user =>
    {
        if (user === null)
        {
            return;
        }

        localStorage.setItem('user', JSON.stringify(user));

        router.push('/')
        location.reload();
    });
}
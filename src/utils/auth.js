import localforage from 'localforage'

export function requireAuth (to, from, next)
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

export function isLoggedIn ()
{
    return localStorage.getItem('user') !== null;
}

export function getUser ()
{
    return JSON.parse(localStorage.getItem('user'));
}

export function createSession (user)
{
    if (user === null)
    {
        return;
    }

    localStorage.setItem('user', JSON.stringify(user));
}

export function getLastRememberedUsername ()
{
    return localStorage.getItem('last_remembered_username');
}

export function setLastRememberedUsername (username)
{
    localStorage.setItem('last_remembered_username', username);
}

export function destroySession ()
{
    localStorage.removeItem('user');
    localforage.clear();
}
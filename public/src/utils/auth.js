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
    if (localStorage.getItem('user') === null)
    {
        return false;
    }

    return true;
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

export function destroySession ()
{
    localStorage.removeItem('user');
    localforage.clear();
}
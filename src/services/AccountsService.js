import { 
    LOCAL_STORAGE_DB_NAME,
    LOCAL_STORAGE_ACCOUNTS_KEY,
    LOCAL_STORAGE_RECENT_ACCOUNTS_KEY
 } from '../utils/storage'
import localforage from 'localforage'
import {
    getEncryptedAccount,
    getDecryptedAccount,
    parseAccount
} from '../utils/account'
import { BASE_API_URL } from '../utils/api'
import { getHeadersWithAuth } from '../utils/requestHeader'
import { Exception, SessionExpiredException } from '../utils/errors'

localforage.config({
    name: LOCAL_STORAGE_DB_NAME
});

function AccountsService (user)
{
    this.user = user;
    this.headers = getHeadersWithAuth(user.token);

    const ACCOUNTS_API_URL = BASE_API_URL + 'accounts/';

    this.get = async function(account)
    {
        try {
            const response = await fetch(`${ACCOUNTS_API_URL}${account._id}`,
            {
                method: 'GET',
                headers: this.headers
            })

            if (response.ok) {
                const data = await response.json();

                return parseAccount(getDecryptedAccount(data, this.user.uuid))
            }

            const { error } = await response.json();

            error.code = error.code || response.status;
            throwError (error);
        }
        catch(error) {
            throwError (error);
        }
    }

    this.getRecentsCached = async function() {
        const cachedAccounts = await localforage.getItem(LOCAL_STORAGE_RECENT_ACCOUNTS_KEY);

        if (cachedAccounts) {
            return cachedAccounts.map(account => parseAccount(getDecryptedAccount(account, this.user.uuid)));
        }

        return [];
    }

    this.getRecents = async function () {
        try {
            const response = await fetch(`${ACCOUNTS_API_URL}recents/`,
            {
                method: 'GET',
                headers: this.headers
            })

            if (response.ok) {
                const accounts = await response.json();

                if (accounts) {
                    return accounts.map(account => parseAccount(getDecryptedAccount(account, this.user.uuid)));
                }

                return [];
            }

            const { error } = await response.json();

            error.code = error.code || response.status;
            throwError (error);
        }
        catch(error) {
            throwError (error);
        }
    },

    this.getAllCached = async function() {
        const cachedAccounts = await localforage.getItem(LOCAL_STORAGE_ACCOUNTS_KEY);

        if (cachedAccounts) {
            return cachedAccounts.map(account => parseAccount(getDecryptedAccount(account, this.user.uuid)));
        }

        return [];
    }

    this.getAll = async function(fetchCallback, endCallback, page = 0, limit = 300) {
        try {
            const response = await fetch(`${ACCOUNTS_API_URL}?page=${page}&limit=${limit}`,
            {
                method: 'GET',
                headers: this.headers
            });

            if (response.ok) {
                // Destructure data here because in this payload accounts are
                // store inside the 'data' key unlike other endpoints, because of pagination
                const { data, totalAccounts, next } = await response.json();

                // Each time we get a page, we add the accounts to the list
                fetchCallback(
                    data.map(account => parseAccount(getDecryptedAccount(account, this.user.uuid)))
                );

                if (next && next.pageNumber && next.limit) {
                    this.getAll(
                        fetchCallback,
                        endCallback,
                        next.pageNumber,
                        next.limit
                    );

                    return;
                }

                endCallback(totalAccounts)
    
                return;
            }

            const { error } = await response.json();

            error.code = error.code || response.status;
            throwError (error);
        }
        catch(error) {
            throwError (error);
        }
    }

    this.add = async function(accountToAdd)
    {
        let encryptedAccount = getEncryptedAccount(accountToAdd, this.user.uuid);

        try {
            const response = await fetch(ACCOUNTS_API_URL,
            {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(encryptedAccount)
            })

            if (response.ok) {
                const data = await response.json();

                return parseAccount(getDecryptedAccount(data, this.user.uuid));
            }

            const { error } = await response.json();

            error.code = error.code || response.status;
            throwError (error);
        }
        catch(error) {
            throwError (error);
        }
    }

    this.save = async function(accountToSave)
    {
        let encryptedAccount = getEncryptedAccount(accountToSave, this.user.uuid);

        try {
            const response = await fetch(`${ACCOUNTS_API_URL}${accountToSave._id}`,
            {
                method: 'PUT',
                headers: this.headers,
                body: JSON.stringify(encryptedAccount)
            })

            if (response.ok) {
                const data = await response.json();

                return parseAccount(getDecryptedAccount(data, this.user.uuid));
            }

            const { error } = await response.json();

            error.code = error.code || response.status;
            throwError (error);
        }
        catch(error) {
            throwError (error);
        }
    }

    this.remove = async function(accountToRemove)
    {
        try {
            const response = await fetch(`${ACCOUNTS_API_URL}${accountToRemove._id}`,
            {
                method: 'DELETE',
                headers: this.headers
            })

            if (response.ok) {
                return accountToRemove;
            }

            const { error } = await response.json();

            error.code = error.code || response.status;
            throwError (error);
        }
        catch(error) {
            throwError (error);
        }
    }
    
    this.updateLocalRecentAccounts = async function(accounts) {
        await localforage.setItem(LOCAL_STORAGE_RECENT_ACCOUNTS_KEY,
            accounts.map(account => parseAccount(getEncryptedAccount(account, this.user.uuid)))
        );
    }

    this.updateLocalAccounts = async function(accounts) {
        await localforage.setItem(LOCAL_STORAGE_ACCOUNTS_KEY,
            accounts.map(account => parseAccount(getEncryptedAccount(account, this.user.uuid)))
        );
    }

    function throwError (error) {
        if (error.code === 401) {
            throw new SessionExpiredException();
        }
        
        throw new Exception(
            error.reason || 'Error',
            error.message || 'Please retry',
            error.code || 500
        );
    }
};

export default AccountsService;

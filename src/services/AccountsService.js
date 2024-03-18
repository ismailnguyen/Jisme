import { 
    LOCAL_STORAGE_DB_NAME,
    LOCAL_STORAGE_ACCOUNTS_KEY,
    LOCAL_STORAGE_RECENT_ACCOUNTS_KEY
 } from '../utils/storage'
import localforage from 'localforage'
import {
    getEncryptedAccount,
    getDecryptedAccount,
    parseAccount,
    getEncryptionKey
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

            const encryptedAccount = await response.json();

            return parseAccount(getDecryptedAccount(encryptedAccount, getEncryptionKey(this.user)))
        }
        catch(error) {
            throwError (error);
        }
    }

    this.getRecentsCached = async function() {
        const cachedAccounts = await localforage.getItem(LOCAL_STORAGE_RECENT_ACCOUNTS_KEY);

        if (cachedAccounts) {
            return cachedAccounts.map(account => parseAccount(getDecryptedAccount(account, getEncryptionKey(this.user))));
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

            const recentEncryptedAccounts = await response.json();
            return recentEncryptedAccounts.map(account => parseAccount(getDecryptedAccount(account, getEncryptionKey(this.user))))
        }
        catch(error) {
            throwError (error);
        }
    },

    this.getAllCached = async function() {
        const cachedAccounts = await localforage.getItem(LOCAL_STORAGE_ACCOUNTS_KEY);

        if (cachedAccounts) {
            return cachedAccounts.map(account => parseAccount(getDecryptedAccount(account, getEncryptionKey(this.user))));
        }

        return [];
    }

    this.getAll = async function(successCallback, page = 0, limit = 100, accounts = [])
    {
        try {
            const response = await fetch(`${ACCOUNTS_API_URL}?page=${page}&limit=${limit}`,
            {
                method: 'GET',
                headers: this.headers
            })

            const { data, next } = await response.json();

            // Each time we get a page, we add the accounts to the list
            accounts = [...accounts, ...data];
            
            if (next && next.pageNumber && next.limit) {
                this.getAll(successCallback, next.pageNumber, next.limit, accounts);
            }

            // Only at the end of the pagination, call the successCallback with the full list of accounts
            if (!next) {
                successCallback(accounts.map(account => parseAccount(getDecryptedAccount(account, getEncryptionKey(this.user)))));
            }
        }
        catch(error) {
            throwError (error);
        }
    }

    this.add = async function(accountToAdd)
    {
        let encryptedAccount = getEncryptedAccount(accountToAdd, getEncryptionKey(this.user));

        try {
            const response = await fetch(ACCOUNTS_API_URL,
            {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify(encryptedAccount)
            })

            const addedAccount = await response.json();

            return parseAccount(getDecryptedAccount(addedAccount, getEncryptionKey(this.user)))
        }
        catch(error) {
            throwError (error);
        }
    }

    this.save = async function(accountToSave)
    {
        let encryptedAccount = getEncryptedAccount(accountToSave, getEncryptionKey(this.user));

        try {
            const response = await fetch(`${ACCOUNTS_API_URL}${accountToSave._id}`,
            {
                method: 'PUT',
                headers: this.headers,
                body: JSON.stringify(encryptedAccount)
            })

            const savedAccount = await response.json();

            return parseAccount(getDecryptedAccount(savedAccount, getEncryptionKey(this.user)))
        }
        catch(error) {
            throwError (error);
        }
    }

    this.remove = async function(accountToRemove)
    {
        try {
            await fetch(`${ACCOUNTS_API_URL}${accountToRemove._id}`,
            {
                method: 'DELETE',
                headers: this.headers
            })

            return accountToRemove
        }
        catch(error) {
            throwError (error);
        }
    }
    
    this.updateLocalRecentAccounts = async function(accounts) {
        await localforage.setItem(LOCAL_STORAGE_RECENT_ACCOUNTS_KEY,
            accounts.map(account => parseAccount(getEncryptedAccount(account, getEncryptionKey(this.user))))
        );
    }

    this.updateLocalAccounts = async function(accounts) {
        await localforage.setItem(LOCAL_STORAGE_ACCOUNTS_KEY,
            accounts.map(account => parseAccount(getEncryptedAccount(account, getEncryptionKey(this.user))))
        );
    }

    function throwError (error) {
        if (error.status === 401) {
            throw new SessionExpiredException();
        }

        throw new Exception('Error', 'Please retry', error.status);
    }
};

export default AccountsService;

import { 
    LOCAL_STORAGE_DB_NAME,
    LOCAL_STORAGE_ACCOUNTS_KEY,
    LOCAL_STORAGE_RECENT_ACCOUNTS_KEY
 } from '../utils/storage'
import localforage from 'localforage'
import {
    parseAccount,
    getEncryptedAccount,
    getDecryptedAccount
} from '../utils/account'
import { BASE_API_URL } from '../utils/api'
import { getHeadersWithAuth } from '../utils/requestHeader'
import { Exception, SessionExpiredException } from '../utils/errors'

localforage.config({
    name: LOCAL_STORAGE_DB_NAME
});

const ACCOUNTS_API_URL = `${ BASE_API_URL }accounts`;

class AccountsService {
    constructor(user) {
        this.user = user;
        this.headers = getHeadersWithAuth(user.token);
    }

    async get(account) {
        try {
            const response = await fetch(`${ ACCOUNTS_API_URL }/${account._id}`,
                {
                    method: 'GET',
                    headers: this.headers
                })

            if (response.ok) {
                const data = await response.json()

                return parseAccount(getDecryptedAccount(data, this.user.public_encryption_key))
            }

            const { error } = await response.json()

            error.code = error.code || response.status
            this.throwError(error)
        }
        catch (error) {
            this.throwError(error)
        }
    }

    async getRecentsCached () {
        const cachedAccounts = await localforage.getItem(LOCAL_STORAGE_RECENT_ACCOUNTS_KEY)

        if (cachedAccounts) {
            return cachedAccounts.map(account => parseAccount(getDecryptedAccount(account, this.user.public_encryption_key)))
        }

        return []
    }

    async getRecents () {
        try {
            const response = await fetch(`${ ACCOUNTS_API_URL }/recents/`,
                {
                    method: 'GET',
                    headers: this.headers
                })

            if (response.ok) {
                const accounts = await response.json()

                if (accounts) {
                    return accounts.map(account => parseAccount(getDecryptedAccount(account, this.user.public_encryption_key)))
                }

                return []
            }

            const { error } = await response.json()

            error.code = error.code || response.status
            this.throwError(error)
        }
        catch (error) {
            this.throwError(error)
        }
    }

    async getAllCached () {
        const cachedAccounts = await localforage.getItem(LOCAL_STORAGE_ACCOUNTS_KEY)

        if (cachedAccounts) {
            return cachedAccounts.map(account => parseAccount(getDecryptedAccount(account, this.user.public_encryption_key)))
        }

        return []
    }

    async getAll (fetchCallback, endCallback, page = 0, limit = 300) {
        try {
            const response = await fetch(`${ ACCOUNTS_API_URL }/?page=${page}&limit=${limit}`,
                {
                    method: 'GET',
                    headers: this.headers
                }
            );

            if (response.ok) {
                // Destructure data here because in this payload accounts are
                // store inside the 'data' key unlike other endpoints, because of pagination
                const { data, totalAccounts, next } = await response.json();

                // Each time we get a page, we add the accounts to the list
                fetchCallback(
                    data.map(account => parseAccount(getDecryptedAccount(account, this.user.public_encryption_key))),
                    totalAccounts
                );

                if (next && next.pageNumber && next.limit) {
                    this.getAll(
                        fetchCallback,
                        endCallback,
                        next.pageNumber,
                        next.limit
                    )

                    return;
                }

                endCallback();

                return;
            }

            const { error } = await response.json()

            error.code = error.code || response.status
            this.throwError(error)
        }
        catch (error) {
            this.throwError(error)
        }
    }

    async add (accountToAdd) {
        let encryptedAccount = getEncryptedAccount(accountToAdd, this.user.public_encryption_key)

        try {
            const response = await fetch(ACCOUNTS_API_URL,
                {
                    method: 'POST',
                    headers: this.headers,
                    body: JSON.stringify(encryptedAccount)
                })

            if (response.ok) {
                const account = await response.json()

                return parseAccount(getDecryptedAccount(account, this.user.public_encryption_key))
            }

            const { error } = await response.json()

            error.code = error.code || response.status
            this.throwError(error)
        }
        catch (error) {
            this.throwError(error)
        }
    }

    async save (accountToSave) {
        let encryptedAccount = getEncryptedAccount(accountToSave, this.user.public_encryption_key)

        try {
            const response = await fetch(`${ ACCOUNTS_API_URL }/${ accountToSave._id }`, {
                    method: 'PUT',
                    headers: this.headers,
                    body: JSON.stringify(encryptedAccount)
                }
            );

            if (response.ok) {
                const account = await response.json()

                return parseAccount(getDecryptedAccount(account, this.user.public_encryption_key))
            }

            const { error } = await response.json()

            error.code = error.code || response.status
            this.throwError(error)
        }
        catch (error) {
            this.throwError(error)
        }
    }

    async remove (accountToRemove) {
        try {
            const response = await fetch(`${ ACCOUNTS_API_URL }/${ accountToRemove._id }`,
                {
                    method: 'DELETE',
                    headers: this.headers
                })

            if (response.ok) {
                return accountToRemove;
            }

            const { error } = await response.json()

            error.code = error.code || response.status
            this.throwError(error)
        }
        catch (error) {
            this.throwError(error)
        }
    }

    async enableServerEncryption (accounts) {
        // We need to send the accounts in chunks of 100 otherwise payload would be too large
        const chunkSize = 10;
        for (let i = 0; i < accounts.length; i += chunkSize) {
            const chunk = accounts.slice(i, i + chunkSize);
            
            console.log('Sending accounts', chunk);

            try {
                const response = await fetch(`${ ACCOUNTS_API_URL }/encryption/enable/`, {
                        method: 'POST',
                        headers: this.headers,
                        body: JSON.stringify({
                            accounts: chunk.map(account => parseAccount(getEncryptedAccount(account, this.user.public_encryption_key)))
                        })
                    }
                );

                if (response.ok) {
                    console.log('Successfully sent', response)

                    continue;
                }

                const { error } = await response.json();

                error.code = error.code || response.status;
                this.throwError(error);
            }
            catch (error) {
                this.throwError(error);
            }
        }

        console.log('All accounts sent');
    }

    async updateLocalRecentAccounts (accounts) {
        await localforage.setItem(LOCAL_STORAGE_RECENT_ACCOUNTS_KEY,
            accounts.map(account => parseAccount(getEncryptedAccount(account, this.user.public_encryption_key)))
        )
    }

    async updateLocalAccounts (accounts) {
        await localforage.setItem(LOCAL_STORAGE_ACCOUNTS_KEY,
            accounts.map(account => parseAccount(getEncryptedAccount(account, this.user.public_encryption_key)))
        );
    }

    throwError(error) {
        if (error.code === 401) {
            throw new SessionExpiredException()
        }

        throw new Exception(
            error.reason || 'Error',
            error.message || 'Please retry',
            error.code || 500
        )
    }
};

export default AccountsService;

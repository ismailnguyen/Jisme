import { getEncryptedAccount, getDecryptedAccount, parseAccount } from '../utils/account'
import { BASE_API_URL } from '../utils/api'
import { getHeadersWithAuth } from '../utils/requestHeader'

function AccountsService (user, store)
{
    this.user = user;
    this.store = store;
    this.headers = getHeadersWithAuth(user.email, user.token);

    const ACCOUNTS_API_URL = BASE_API_URL + 'accounts/';

    this.get = function()
    {
        return fetch(ACCOUNTS_API_URL.clone(),
        {
            method: 'GET',
            headers: this.headers
        })
        .then(handleErrors)
        .then(response => response.json())
        .then(accounts => {
            let encryptedAccounts = [];

            accounts.forEach(account =>
            {
                encryptedAccounts.push(
                    parseAccount(
                        getDecryptedAccount(account, this.user.token)
                    )
                );
            });

            return encryptedAccounts;
        })
        .then(accounts => 
        {
            this.store.commit('updateAccounts', accounts);
            
            return accounts;
        });
    }

    this.add = function(accountToAdd)
    {
        let encryptedAccount = getEncryptedAccount(accountToAdd, this.user.token);

        return fetch(ACCOUNTS_API_URL.clone(),
        {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(encryptedAccount)
        })
        .then(handleErrors)
        .then(response => response.json())
        .then(addedAccount => parseAccount(getDecryptedAccount(addedAccount, this.user.token)))
        .then(addedAccount => this.store.commit('addAccount', addedAccount))
    }

    this.save = function(accountToSave)
    {
        let encryptedAccount = getEncryptedAccount(accountToSave, this.user.token);

        return fetch((ACCOUNTS_API_URL + accountToSave._id).clone(),
        {
            method: 'PUT',
            headers: this.headers,
            body: JSON.stringify(encryptedAccount)
        })
        .then(handleErrors)
        .then(response => this.store.commit('updateAccount', accountToSave));
    }

    this.remove = function(accountToRemove)
    {
        return fetch((ACCOUNTS_API_URL + accountToRemove._id).clone(),
        {
            method: 'DELETE',
            headers: this.headers
        })
        .then(handleErrors)
        .then(response => this.store.commit('removeAccount', accountToRemove));
    }

    function handleErrors (response)
    {
        if (!response.ok)
        {
            throw Error(response.statusText);
        }

        return response;
    }
};

export default AccountsService;

import { getEncryptedAccount, getDecryptedAccount, parseAccount } from '../utils/account'
import { BASE_API_URL } from '../utils/api'
import { getHeadersWithAuth } from '../utils/requestHeader'

function AccountsService (user, store)
{
    this.user = user;
    this.store = store;
    this.headers = getHeadersWithAuth(user.token);

    const ACCOUNTS_API_URL = BASE_API_URL + 'accounts/';

    this.get = function(account)
    {
        return fetch(ACCOUNTS_API_URL + account._id,
        {
            method: 'GET',
            headers: this.headers
        })
        .then(handleErrors)
        .then(response => response.clone().json())
        .then(encryptedAccount => parseAccount(getDecryptedAccount(encryptedAccount, this.user.uuid)))
        .then(account => 
        {	
            console.log(account)
        });
    }

    this.getAll = function()
    {
        return fetch(ACCOUNTS_API_URL,
        {
            method: 'GET',
            headers: this.headers
        })
        .then(handleErrors)
        .then(response => response.clone().json())
        .then(accounts => accounts.map(account => parseAccount(getDecryptedAccount(account, this.user.uuid))))
        .then(accounts => 
        {	
            this.store.commit('updateAccounts', accounts);

            return accounts;
        });
    }

    this.add = function(accountToAdd)
    {
        let encryptedAccount = getEncryptedAccount(accountToAdd, this.user.uuid);

        return fetch(ACCOUNTS_API_URL,
        {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(encryptedAccount)
        })
        .then(handleErrors)
        .then(response => response.clone().json())
        .then(addedAccount => parseAccount(getDecryptedAccount(addedAccount, this.user.uuid)))
        .then(addedAccount => this.store.commit('addAccount', addedAccount))
    }

    this.save = function(accountToSave)
    {
        let encryptedAccount = getEncryptedAccount(accountToSave, this.user.uuid);
        return fetch(ACCOUNTS_API_URL + accountToSave._id,
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
        return fetch(ACCOUNTS_API_URL + accountToRemove._id,
        {
            method: 'DELETE',
            headers: this.headers
        })
        .then(handleErrors)
        .then(response => this.store.commit('removeAccount', accountToRemove));
    }

    function handleErrors (response)
    {
        let clonedResponse = response.clone();
        if (!clonedResponse.ok)
        {
            throw Error(clonedResponse.statusText);
        }

        return clonedResponse;
    }
};

export default AccountsService;

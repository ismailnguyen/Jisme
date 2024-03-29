import { getEncryptedAccount, getDecryptedAccount, parseAccount } from '../utils/account'
import { BASE_API_URL } from '../utils/api'
import { getHeadersWithAuth } from '../utils/requestHeader'
import { Exception, SessionExpiredException } from '../utils/errors'

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
        .then(encryptedAccount => parseAccount(getDecryptedAccount(encryptedAccount, this.user.uuid)))
        .then(account => 
        {	
            console.log(account)
        })
        .catch(throwError);
    }

    this.getRecents = function () {
        return fetch(ACCOUNTS_API_URL + 'recents/',
        {
            method: 'GET',
            headers: this.headers
        })
        .then(handleErrors)
        .then(accounts => accounts.map(account => parseAccount(getDecryptedAccount(account, this.user.uuid))))
        .then(accounts => 
        {	
            this.store.commit('updateAccounts', accounts);

            return accounts;
        })
        .catch(throwError);
    },

    this.getAll = function()
    {
        return fetch(ACCOUNTS_API_URL,
        {
            method: 'GET',
            headers: this.headers
        })
        .then(handleErrors)
        .then(accounts => accounts.map(account => parseAccount(getDecryptedAccount(account, this.user.uuid))))
        .then(accounts => 
        {	
            this.store.commit('updateAccounts', accounts);

            return accounts;
        })
        .catch(throwError);
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
        //.then(response => response.clone().json())
        .then(addedAccount => parseAccount(getDecryptedAccount(addedAccount, this.user.uuid)))
        .then(addedAccount => this.store.commit('addAccount', addedAccount))
        .catch(throwError);
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
        .then(response => this.store.commit('updateAccount', accountToSave))
        .catch(throwError);
    }

    this.remove = function(accountToRemove)
    {
        return fetch(ACCOUNTS_API_URL + accountToRemove._id,
        {
            method: 'DELETE',
            headers: this.headers
        })
        .then(handleErrors)
        .then(response => this.store.commit('removeAccount', accountToRemove))
        .catch(throwError);
    }

    function handleErrors (response)
    {
        if (!response.ok)
        {
            throw response;
        }

        return response.json();
    }

    function throwError (response) {
        if (response.status === 401) {
            throw new SessionExpiredException();
        }

        response.text().then(console.log);
        throw new Exception('Error', 'Please retry', response.status);
    }
};

export default AccountsService;

import { getEncryptedAccount, getDecryptedAccount } from '../utils/account'
import { getHeaders } from '../utils/requestHeader'

function AccountsService (user, state)
{
    this.user = user;
    this.state = state;
    this.headers = getHeaders(user.email, user.token);

    const ACCOUNTS_API_URL = '/api/accounts/';

    this.get = function()
    {
        return fetch(ACCOUNTS_API_URL,
        {
            method: 'GET',
            headers: this.headers
        })
        .then(response => response.json())
        .then(accounts => {
            let encryptedAccounts = [];

            accounts.forEach(account =>
            {
                encryptedAccounts.push(getDecryptedAccount(account, this.user.token));
            });

            return encryptedAccounts;
        })
        .then(accounts => this.state.accounts = accounts);
    }

    this.add = function(accountToAdd)
    {
        let encryptedAccount = getEncryptedAccount(accountToAdd, this.user.token);

        return fetch(ACCOUNTS_API_URL,
        {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(encryptedAccount)
        })
        .then(response => response.json())
        .then(addedAccount => getDecryptedAccount(addedAccount, this.user.token))
        .then(addedAccount => this.state.accounts.push(addedAccount));
    }

    this.save = function(accountToSave)
    {
        let encryptedAccount = getEncryptedAccount(accountToSave, this.user.token);

        return fetch(ACCOUNTS_API_URL + accountToSave._id,
        {
            method: 'PUT',
            headers: this.headers,
            body: JSON.stringify(encryptedAccount)
        })
        .then(response =>
        {
            let index = this.state.accounts.indexOf(accountToSave);

            this.state.accounts[index] = accountToSave;
        });
    }

    this.remove = function(accountToRemove)
    {
        return fetch(ACCOUNTS_API_URL + accountToRemove._id,
        {
            method: 'DELETE',
            headers: this.headers
        })
        .then(response =>
        {
            let index = this.state.accounts.indexOf(accountToRemove);

            this.state.accounts.splice(index, 1);
        });
    }
};

export default AccountsService;
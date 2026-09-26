import { parseAccount } from '../../utils/account'
import { Exception } from '../../utils/errors'
import demoVault, { clone } from './demoVault'

const RECENT_ACCOUNTS_LIMIT = 10;

// Same interface as AccountsService, backed by the in-memory demo vault
class DemoAccountsService {
    constructor(user) {
        this.user = user;
    }

    toAccount (stored) {
        return parseAccount(clone(stored));
    }

    findIndex (accountId) {
        return demoVault.accounts.findIndex(a => a._id === accountId);
    }

    async get (account) {
        const index = this.findIndex(account._id);

        if (index === -1) {
            throw new Exception('Not found', 'This item is not in the demo vault.', 404);
        }

        return this.toAccount(demoVault.accounts[index]);
    }

    // No device cache in demo mode: the vault always comes from memory
    async getRecentsCached () {
        return [];
    }

    async getAllCached () {
        return [];
    }

    async getRecents () {
        return [...demoVault.accounts]
            .sort((a, b) => new Date(b.last_opened_date) - new Date(a.last_opened_date))
            .slice(0, RECENT_ACCOUNTS_LIMIT)
            .map(account => this.toAccount(account));
    }

    async getAll (fetchCallback, endCallback) {
        const accounts = demoVault.accounts.map(account => this.toAccount(account));

        fetchCallback(accounts, accounts.length);
        endCallback();
    }

    async add (accountToAdd) {
        const now = new Date();
        const stored = clone({
            ...accountToAdd,
            _id: `demo_${ now.getTime() }_${ Math.random().toString(36).slice(2, 8) }`,
            created_date: now,
            last_modified_date: now,
            last_opened_date: now
        });

        demoVault.accounts.push(stored);

        return this.toAccount(stored);
    }

    async save (accountToSave) {
        const index = this.findIndex(accountToSave._id);

        if (index === -1) {
            throw new Exception('Not found', 'This item is not in the demo vault.', 404);
        }

        demoVault.accounts[index] = clone(accountToSave);

        return this.toAccount(demoVault.accounts[index]);
    }

    async remove (accountToRemove) {
        const index = this.findIndex(accountToRemove._id);

        if (index !== -1) {
            demoVault.accounts.splice(index, 1);
        }

        return accountToRemove;
    }

    async enableServerEncryption () {}

    async updateLocalRecentAccounts () {}

    async updateLocalAccounts () {}
}

export default DemoAccountsService;

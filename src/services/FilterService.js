import { sortByInt, sortByString, sortByDate } from '../utils/sort'

function FilterService (accounts)
{
    this.accounts = accounts;

    this.getAccounts = function () {
        return this.accounts;
    }

    this.getTags = function () {
        return this.accounts.map(account => account.tags).reduce((acc, curr) => acc.concat(curr), []).filter((value, index, self) => self.indexOf(value) === index);
    }

    this.filterByTags = function (tags) {
        if (!tags)
            return;

        tags = tags.split(',').map(tag => tag.trim());

        let filteredAccounts = [];
        this.accounts.forEach(account => {
            // Don't push duplicates
            if (filteredAccounts.indexOf(account) === -1) {
                // Check if all tags in the query are present in the account
                if (account.tags && tags.every(tag => account.tags.includes(tag))) {
                    filteredAccounts.push(account);
                }
            }
        });

        this.accounts = filteredAccounts;
    }

    this.filterByQuery = function (query) {
        this.accounts = this.accounts.filter(account => this.containsQuery(account, query));
    }

    this.sortByName = function ()
    {
        this.accounts = this.accounts.sort((account1, account2) => sortByString(account1.displayPlatform, account2.displayPlatform));
    }

    this.sortByLastOpened = function ()
    {
        this.accounts = this.accounts.sort((account1, account2) => sortByDate(account2.last_opened_date, account1.last_opened_date));
    }

    this.sortByOpenedCount = function ()
    {
        this.accounts = this.accounts.sort((account1, account2) => sortByInt(account2.opened_count, account1.opened_count));
    }

    this.containsTag = function (account, tag)
    {
        return !tag
            || tag === 'All'
            || account.tags.includes(tag);
    }

    this.containsQuery = function (account, query)
    {
        if (!query)
            return true;

        try {
            query = query.trim().toLowerCase();

            let platform = account.platform.toLowerCase();
            let displayPlatform = account.displayPlatform.toLowerCase();
            let login = account.login.toLowerCase();
            let password = account.password.toLowerCase();
            let tags = account.tags.toLowerCase();

            if (platform.includes(query))
            {
                return true;
            }

            if (displayPlatform.includes(query))
            {
                return true;
            }

            if (login.includes(query))
            {
                return true;
            }

            if (password.includes(query))
            {
                return true;
            }

            if (tags.includes(query))
            {
                return true;
            }

            return false;
        }
        catch(error) {
            console.error(account);
            console.error(error);

            this.$emit('showAlert', new Alert('System Error', 'Error while parsing account n°' + account._id, 'danger'));

            return false;
        }
    }
};

export default FilterService;
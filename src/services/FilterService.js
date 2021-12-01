import { sortBy } from '../utils/sort'

function FilterService (accounts)
{
    this.accounts = accounts;

    this.getAccounts = function ()
    {
        return this.accounts;
    }

    this.filterByTag = function (tags)
    {
        this.accounts = this.accounts.filter(account => this.containsTag(account, tags));
    }

    this.filterByUsername = function (username)
    {
        this.accounts = this.accounts.filter(account => account.login.toLowerCase().includes(username.toLowerCase())
                                                        || username.toLowerCase().includes(account.login.toLowerCase()));
    }

    this.filterByPassword = function (password)
    {
        this.accounts = this.accounts.filter(account => account.password.toLowerCase().includes(password.toLowerCase())
                                                        || password.toLowerCase().includes(account.password.toLowerCase()));
    }

    this.filterByQuery = function (query)
    {
        this.accounts = this.accounts.filter(account => this.containsQuery(account, query));
    }

    this.sortByName = function ()
    {
        this.accounts = this.accounts.sort((account1, account2) => sortBy(account1.displayPlatform, account2.displayPlatform));
    }

    this.containsTag = function (account, tags)
    {
        if (!tags || tags === 'All')
        {
            return true;
        }

        if (account.tags.toLowerCase().includes(tags.toLowerCase()))
        {
            return true;
        }

        // If tag search query contains comma, we need to check each tag separately
        if (tags.indexOf(',') > -1) {
            for (let tag of tags.split(',')) {
                if (account.tags.toLowerCase().includes(tag.toLowerCase())) {
                    return true;
                }
            }
        }

        return false;
    }

    this.containsQuery = function (account, query)
    {
        if (!query) {
            return true;
        }

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
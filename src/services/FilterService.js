import {
    sortByInt,
    sortByString,
    sortByDate
} from '../utils/sort'

class FilterService {
    constructor() {
        this.filterByTags = function (accounts, tags) {
            if (!tags.length) {
                return;
            }

            let _filteredAccounts = [];

            accounts.forEach(account => {
                // Don't push duplicates
                if (_filteredAccounts.indexOf(account) === -1) {
                    // Check if all tags in the query are present in the account
                    if (account.tags && tags.every(tag => account.tags.includes(tag))) {
                        _filteredAccounts.push(account);
                    }
                }
            });

            return _filteredAccounts;
        };

        this.filterByQuery = function (accounts, query) {
            if (!query) {
                return;
            }

            const cleanQuery = query ? query.trim().toLowerCase() : '';

            return accounts.filter(account => 
                account.contains(cleanQuery)
                || (account.tags.includes('hidden') && cleanQuery.includes('hidden'))
            );
        };

        this.sortByName = function (accounts) {
            return accounts.sort((account1, account2) => sortByString(account1.displayPlatform, account2.displayPlatform));
        };

        this.sortByLastOpened = function (accounts) {
            return accounts.sort((account1, account2) => sortByDate(account2.last_opened_date, account1.last_opened_date));
        };

        this.sortByOpenedCount = function (accounts) {
            return accounts.sort((account1, account2) => sortByInt(account2.opened_count, account1.opened_count));
        };
    }
};

export default FilterService;
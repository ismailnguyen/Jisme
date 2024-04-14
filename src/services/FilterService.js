import {
    sortByInt,
    sortByString,
    sortByDate
} from '../utils/sort'

class FilterService {
    constructor(accounts) {
        this.filteredAccounts = accounts || [];

        this.getAccounts = function () {
            return this.filteredAccounts;
        };

        this.getTags = function () {
            return this.filteredAccounts.map(account => account.tags).reduce((acc, curr) => acc.concat(curr), []).filter((value, index, self) => self.indexOf(value) === index);
        };

        this.filterByTags = function (tags) {
            if (!tags) {
                return;
            }

            tags = tags.split(',').map(tag => tag.trim());

            this.accounts.forEach(account => {
                // Don't push duplicates
                if (filteredAccounts.indexOf(account) === -1) {
                    // Check if all tags in the query are present in the account
                    if (account.tags && tags.every(tag => account.tags.includes(tag))) {
                        this.filteredAccounts.push(account);
                    }
                }
            });
        };

        this.filterByQuery = function (query) {
            if (!query) {
                return;
            }

            this.filteredAccounts = this.filteredAccounts.filter(account => this.containsQuery(account, query));
        };

        this.sortByName = function () {
            this.filteredAccounts = this.filteredAccounts.sort((account1, account2) => sortByString(account1.displayPlatform, account2.displayPlatform));
        };

        this.sortByLastOpened = function () {
            this.filteredAccounts = this.filteredAccounts.sort((account1, account2) => sortByDate(account2.last_opened_date, account1.last_opened_date));
        };

        this.sortByOpenedCount = function () {
            this.filteredAccounts = this.filteredAccounts.sort((account1, account2) => sortByInt(account2.opened_count, account1.opened_count));
        };

        this.containsQuery = function (account, query) {
            if (!query) {
                return true;
            }

            try {
                query = query.trim().toLowerCase();

                let platform = account.platform.toLowerCase();
                let displayPlatform = account.displayPlatform.toLowerCase();
                let login = account.login.toLowerCase();
                let password = account.password.toLowerCase();
                let passwordClue = account.password_clue.toLowerCase();
                let tags = account.tags.toLowerCase();

                if (tags.includes('hidden')) {
                    return query.includes('hidden');
                }

                if (platform.includes(query)) {
                    return true;
                }

                if (displayPlatform.includes(query)) {
                    return true;
                }

                if (login.includes(query)) {
                    return true;
                }

                if (password.includes(query)) {
                    return true;
                }

                if (passwordClue.includes(query)) {
                    return true;
                }

                if (tags.includes(query)) {
                    return true;
                }

                return false;
            }
            catch (error) {
                console.error(account);
                console.error(error);

                return false;
            }
        };
    }
};

export default FilterService;
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
        
            let _filteredAccounts = [];

            this.filteredAccounts.forEach(account => {
                // Don't push duplicates
                if (_filteredAccounts.indexOf(account) === -1) {
                    // Check if all tags in the query are present in the account
                    if (account.tags && tags.every(tag => account.tags.includes(tag))) {
                        _filteredAccounts.push(account);
                    }
                }
            });

            this.filteredAccounts = _filteredAccounts;
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

                const platform = account.platform.toLowerCase();
                const displayPlatform = account.displayPlatform.toLowerCase();
                const login = account.login && account.login.toLowerCase();
                const social_login = account.social_login && account.social_login.toLowerCase();
                const password = account.password && account.password.toLowerCase();
                const password_clue = account.password_clue && account.password_clue.toLowerCase();
                const tags = account.tags.toLowerCase();
                const icon = account.icon && account.icon.toLowerCase();
                const card_number = account.card_number && account.card_number.toLowerCase();
                const card_expiracy = account.card_expiracy && account.card_expiracy.toLowerCase();
                const card_pin = account.card_pin && account.card_pin.toLowerCase();
                const card_cryptogram = account.card_cryptogram && account.card_cryptogram.toLowerCase();
                const card_name = account.card_name && account.card_name.toLowerCase();
                const description = account.description && account.description.toLowerCase();
                const notes = account.notes && account.notes.toLowerCase();

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

                if (social_login.includes(query)) {
                    return true;
                }

                if (password.includes(query)) {
                    return true;
                }

                if (password_clue.includes(query)) {
                    return true;
                }

                if (tags.includes(query)) {
                    return true;
                }

                if (icon.includes(query)) {
                    return true;
                }

                if (card_number.includes(query)) {
                    return true;
                }

                if (card_expiracy.includes(query)) {
                    return true;
                }

                if (card_pin.includes(query)) {
                    return true;
                }

                if (card_cryptogram.includes(query)) {
                    return true;
                }

                if (card_name.includes(query)) {
                    return true;
                }

                if (description.includes(query)) {
                    return true;
                }

                if (notes.includes(query)) {
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
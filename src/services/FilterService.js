import {
    sortByInt,
    sortByString,
    sortByDate
} from '../utils/sort';

const filterActions = {
    includes: 'includes',
    equals: 'equals',
    exluces: 'excludes'
};

/*
    * FilterService
    * This service is responsible for filtering the accounts based on the user's query and filters.
    * It also provides the user with the list of tags that are currently in use.
    * The service is initialized with a list of accounts.
    *  - getAccounts: returns the list of filtered accounts
    * - getTags: returns the list of tags that are currently in use
    * - filterByTypes: filters the accounts by the account type
    * - applyFilters: filters the accounts by the user's query and filters
    * - filterByTags: filters the accounts by the tags
    * - filterByQuery: filters the accounts by the user's query
    * - sortByName: sorts the accounts by the account name
    * - sortByLastOpened: sorts the accounts by the last opened date
    * - sortByOpenedCount: sorts the accounts by the opened count
    * 
*/
class FilterService {
    constructor(accounts) {
        this.filteredAccounts = accounts || [];

        this.getAccounts = function () {
            return this.filteredAccounts;
        };

        this.getTags = function () {
            return this.filteredAccounts.map(account => account.tags).reduce((acc, curr) => acc.concat(curr), []).filter((value, index, self) => self.indexOf(value) === index);
        };

        this.filterByTypes = function (types) {
            if (!types || types.length === 0) {
                return;
            }

            this.filteredAccounts = this.filteredAccounts.filter(account => types.includes(account.type));
        }

        this.applyFilters = function (filters) {
            let _filteredAccounts = [];

            this.filteredAccounts.forEach(account => {
                let nbAppliedFilters = 0;
                filters.forEach(filter => {
                    if (account[filter.field]
                            && ((filterActions[filter.comparison] === 'includes' && account[filter.field].toString().toLowerCase().includes(filter.value.toLowerCase()))
                                || (filterActions[filter.comparison] === 'equals' && account[filter.field].toString().toLowerCase() === filter.value.toLowerCase())
                                || (filterActions[filter.comparison] === 'excludes' && !account[filter.field].toString().toLowerCase().includes(filter.value.toLowerCase())))
                    ) {
                        nbAppliedFilters++;
                    }

                    // Add the account only if all filters conditions are met
                    if (nbAppliedFilters === filters.length) {
                        _filteredAccounts.push(account);
                    }
                });
            });

            this.filteredAccounts = _filteredAccounts;
        }

        this.filterByTags = function (tags) {
            if (!tags || tags.length === 0) {
                return;
            }

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

            const cleanQuery = query ? query.trim().toLowerCase() : '';

            this.filteredAccounts = this.filteredAccounts.filter(account => 
                account.contains(cleanQuery)
                || (account.tags.includes('hidden') && cleanQuery.includes('hidden'))
            );
        };

        this.sortByName = function () {
            this.filteredAccounts = this.filteredAccounts.sort((account1, account2) => sortByString(account1.label, account2.label));
        };

        this.sortByLastOpened = function () {
            this.filteredAccounts = this.filteredAccounts.sort((account1, account2) => sortByDate(account2.last_opened_date, account1.last_opened_date));
        };

        this.sortByOpenedCount = function () {
            this.filteredAccounts = this.filteredAccounts.sort((account1, account2) => sortByInt(account2.opened_count, account1.opened_count));
        };
    }
};

export default FilterService;
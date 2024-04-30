import { ref, computed, toRaw } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import { useUserStore } from '@/store';
import { APP_ACCOUNTS_STORE } from '../utils/store';
import { SessionExpiredException } from '../utils/errors'

import AccountsService from '../services/AccountsService';
import FilterService from '../services/FilterService';

const store = defineStore(APP_ACCOUNTS_STORE, () => {
    const userStore = useUserStore();
    const { user } = storeToRefs(userStore);

    const recentAccounts = ref([]);
    const accounts = ref([]);
    const filteredAccounts = ref([]);

    const wordFilter = ref('');
    const selectedTags = ref([]);

    const accountsService = new AccountsService(user.value);
    const filterService = new FilterService();


    const hasFilter = computed(() => {
        return wordFilter.value || selectedTags.value.length > 0;
    });

    const getUniqueTags = () => {
        let uniqueTags = [];

        filteredAccounts.value.forEach(account => {
            account.tags
            .split(',')
            .map(t => t.trim())
            .filter(t => t)
            .forEach(tagName => {
                // look if the tag was already added
                let alreadyAddedTag = uniqueTags.find(uniqueTag => uniqueTag.name === tagName);
                if (alreadyAddedTag) {
                    alreadyAddedTag.count++;
                }
                // otherwise add it and init its counter to 0
                else {
                    uniqueTags.push({
                        name: tagName,
                        count: 1
                    });
                }
            });
        });

        return uniqueTags.sort((a, b) => (a.name < b.name) ? -1 : (a.name > b.name) ? 1 : 0);
    }

    async function loadCache () {
        // Pre fill the store with the cached accounts
        recentAccounts.value = await accountsService.getRecentsCached();
        accounts.value = await accountsService.getAllCached();
        filteredAccounts.value = accounts.value;
    }

    async function fetchRecentAccounts() {
        try {
            recentAccounts.value = await accountsService.getRecents() || [];

            await accountsService.updateLocalRecentAccounts(recentAccounts.value);
        }
        catch (error) {
            if (error instanceof SessionExpiredException) {
                userStore.signOut();
            }

            throw error;
        }
    }

    async function fetchAccounts () {
        try {
            // Update account while getting page by page from server
            await accountsService.getAll(
                (fetchedAccounts) => {
                    // If fetchedAccounts exist in accounts, update them, otherwise add them
                    fetchedAccounts.forEach(account => {
                        let index = accounts.value.findIndex(a => a._id === account._id);

                        if (index !== -1) {
                            // Update only accounts where last_modified_date is greater than the one in the store
                            if (new Date(account.last_modified_date) > new Date(accounts.value[index].last_modified_date)) {
                                accounts.value[index] = account;
                                console.log('Updated account retrieved')//, account);
                            }
                        }
                        else {
                            accounts.value.push(account);
                            console.log('New account retrieved')//, account);
                        }
                    });
                },
                // Update cached accounts only when all accounts are fetched
                (totalAccounts) => {
                    updateLocalAccounts();
                }
            );
        }
        catch (error) {
            if (error instanceof SessionExpiredException) {
                userStore.signOut();
            }

            throw error;
        }
    }

    async function updateLocalAccounts() {
        await accountsService.updateLocalAccounts(accounts.value);
    }

    async function addAccount (account) {
        try {
           // Wait for account to come with newly created _id
            const addedAccount = await accountsService.add(account);

            accounts.value.push(addedAccount);

            updateLocalAccounts(); 
        }
        catch (error) {
            if (error instanceof SessionExpiredException) {
                userStore.signOut();
            }

            throw error;
        }
    }

    async function updateAccount (account) {
        try {
            account.last_modified_date = new Date();
            account.last_opened_date = new Date();
            account.opened_count = account.opened_count ? account.opened_count + 1 : 1;

            const updatedAccount = await accountsService.save(account);

            let index = accounts.value.findIndex(a => a._id === updatedAccount._id);

            accounts.value[index] = updatedAccount;

            updateLocalAccounts();
        }
        catch (error) {
            if (error instanceof SessionExpiredException) {
                userStore.signOut();
            }

            throw error;
        }
    }

    async function removeAccount(account) {
        try {
            await accountsService.remove(account);

            let indexToRemove = accounts.value.findIndex(a => a._id === account._id);

            accounts.value.splice(indexToRemove, 1);

            updateLocalAccounts();
        }
        catch (error) {
            if (error instanceof SessionExpiredException) {
                userStore.signOut();
            }

            throw error;
        }
    }

    async function enableServerEncryption() {
        try {
            await accountsService.enableServerEncryption(accounts.value);
        }
        catch (error) {
            if (error instanceof SessionExpiredException) {
                userStore.signOut();
            }

            throw error;
        }
    }

    function filterAccounts (sort = true) {
        filteredAccounts.value = accounts.value;

        if (!wordFilter.value && !selectedTags.value.length) {
            return;
        }

        if (selectedTags.value.length) {
            filteredAccounts.value = filterService.filterByTags(filteredAccounts.value, selectedTags.value);
        }

        if (wordFilter.value) {
            filteredAccounts.value = filterService.filterByQuery(filteredAccounts.value, wordFilter.value);
        }

        if (sort) {
            filteredAccounts.value = filterService.sortByName(filteredAccounts.value);
        }
    }

    function updateWordFilter (query) {
        wordFilter.value = query;

        // Update filtered accounts based on the new query
        filterAccounts();
    }

    function selectTag (tag) {
        selectedTags.value.push(tag);

        // Update filtered accounts based on the new tags
        filterAccounts();
    }

    function removeTag (tag) {
        selectedTags.value.splice(selectedTags.value.indexOf(tag), 1);

        // Update filtered accounts based on the new tags
        filterAccounts();
    }

    return {
        user,
        recentAccounts,
        accounts,
        filteredAccounts,

        wordFilter,
        updateWordFilter,

        selectedTags,
        selectTag,
        removeTag,

        hasFilter,

        // getAccountsFilteredByQuery,
        getUniqueTags,

        loadCache,
        fetchRecentAccounts,
        fetchAccounts,
        addAccount,
        updateAccount,
        removeAccount,

        enableServerEncryption
    }
}); 

export default store;

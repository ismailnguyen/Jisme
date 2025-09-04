import { ref, computed, toRaw } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import { useUserStore } from '@/store';
import { APP_ACCOUNTS_STORE } from '../utils/store';
import { SessionExpiredException } from '../utils/errors'

import AccountsService from '../services/AccountsService';
import FilterService from '../services/FilterService';

const MIN_SEARCH_QUERY_LENGTH = 3;

const store = defineStore(APP_ACCOUNTS_STORE, () => {
    const userStore = useUserStore();
    const { user } = storeToRefs(userStore);

    const areAccountsLoaded = ref(false);

    const totalAccounts = ref(0);
    const totalFetchedAccounts = ref(0);
    const recentAccounts = ref([]);
    const accounts = ref([]);
    const _filteredAccounts = ref([]);

    // Add these new refs to store filter state
    const searchQuery = ref('');  

    const shouldSort = ref(false);

    const selectedTags = ref([]);
    const selectedTypes = ref([]);
    const selectedFilters = ref([]);

    let accountsService = new AccountsService(user.value);

    const isSearching = computed(() => {
        return !!(
            (searchQuery.value && searchQuery.value.length >= MIN_SEARCH_QUERY_LENGTH)
            || selectedTags.value.length > 0
            || selectedTypes.value.length > 0
            || selectedFilters.value.length > 0
        )
    });

    // find all accounts with attributes isPinned to true
    const favoriteAccounts = computed(() => accounts.value.filter(account => account.isPinned));

    // Replace getAccountsFilteredByQuery with these:
    const filteredAccounts = computed(() => {
        if (!searchQuery.value && !selectedTags.value.length && 
            !selectedTypes.value.length && !selectedFilters.value.length) {
            _filteredAccounts.value = accounts.value;
            return accounts.value;
        }

        // Use a shallow copy of the reactive array to keep reactivity tracking of
        // array contents (push/replace) while avoiding in-place mutations by FilterService.
        // Avoid toRaw here, as it breaks deep reactivity and prevents recomputation
        // when accounts are added/updated.
        const filterService = new FilterService([...accounts.value]);

        if (selectedFilters.value.length > 0) {
            filterService.applyFilters(selectedFilters.value);
        }

        if (selectedTags.value.length > 0) {
            filterService.filterByTags(selectedTags.value);
        }

        if (selectedTypes.value.length > 0) {
            filterService.filterByTypes(selectedTypes.value); 
        }

        if (searchQuery.value) {
            filterService.filterByQuery(searchQuery.value);
        }

        if (shouldSort.value) {
            filterService.sortByName();
        }

        _filteredAccounts.value = filterService.getAccounts();
        return _filteredAccounts.value;
    });

    const getUniqueTags = () => {
        let uniqueTags = [];

        _filteredAccounts.value.forEach(account => {
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

    const getMostUsedTags = () => {
        let uniqueTags = getUniqueTags();

        return uniqueTags.sort((a, b) => b.count - a.count);
    }

    async function loadCache () {
        // Pre fill the store with the cached accounts
        recentAccounts.value = await accountsService.getRecentsCached();
        accounts.value = await accountsService.getAllCached();

        // After loading accounts from cache update the areAccountsLoaded value
        areAccountsLoaded.value = accounts.value.length > 0;

        _filteredAccounts.value = accounts.value;
    }

    function findAccountById(accountId) {
        return accounts.value.find(a => a._id === accountId);
    }

    async function fetchRecentAccounts() {
        try {
            recentAccounts.value = await accountsService.getRecents() || [];

            await accountsService.updateLocalRecentAccounts(recentAccounts.value);
        }
        catch (error) {
            if (error instanceof SessionExpiredException) {
                await userStore.signOut(true); // keep local cache when session expires
            }

            throw error;
        }
    }

    async function fetchAccounts () {
        try {
            // Update account while getting page by page from server
            await accountsService.getAll(
                (fetchedAccounts, totalAccountsNumber) => {
                    totalAccounts.value = totalAccountsNumber;

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

                    totalFetchedAccounts.value += fetchedAccounts.length;

                    // After loading accounts from server update the areAccountsLoaded value
                    areAccountsLoaded.value = totalAccountsNumber > 0;
                },
                // Update cached accounts only when all accounts are fetched
                () => {
                    updateLocalAccounts();
                }
            );
        }
        catch (error) {
            if (error instanceof SessionExpiredException) {
                await userStore.signOut(true);
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
                await userStore.signOut(true);
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
                await userStore.signOut(true);
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
                await userStore.signOut(true);
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
                await userStore.signOut();
            }

            throw error;
        }
    }

    return {
        user,
        recentAccounts,
        favoriteAccounts,
        accounts,
        totalFetchedAccounts,
        totalAccounts,
        areAccountsLoaded,

        searchQuery,
        selectedTypes,
        selectedTags,
        selectedFilters,

        isSearching,

        filteredAccounts,

        getUniqueTags,
        getMostUsedTags,

        loadCache,
        fetchRecentAccounts,
        fetchAccounts,
        addAccount,
        updateAccount,
        removeAccount,
        findAccountById,

        enableServerEncryption
    }
}); 

export default store;

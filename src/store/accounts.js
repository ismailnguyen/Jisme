import { ref, computed, watch } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import { useUserStore, useNetworkStore, useAlertStore } from '@/store';
import { APP_ACCOUNTS_STORE } from '../utils/store';
import { SessionExpiredException, isNetworkError, NetworkException } from '../utils/errors'
import localforage from 'localforage'
import { LOCAL_STORAGE_OUTBOX_KEY } from '../utils/storage'

import AccountsService from '../services/AccountsService';
import DemoAccountsService from '../services/demo/DemoAccountsService';
import { parseAccount } from '../utils/account';
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

    let accountsService = null;
    let isDemoService = false;
    let currentOwner = null;
    let generation = 0;
    const isSyncing = ref(false);
    const outbox = ref([]);
    const hasLegacyPending = ref(false);

    // Entering or leaving the demo must not mix demo items with a real vault (and its cache)
    const resetAccounts = () => {
        for (const record of new Set([...accounts.value, ...recentAccounts.value, ..._filteredAccounts.value, ...outbox.value.map(item => item.account)])) {
            for (const key of Object.keys(record || {})) record[key] = null;
        }
        areAccountsLoaded.value = false;
        totalAccounts.value = 0;
        totalFetchedAccounts.value = 0;
        recentAccounts.value = [];
        accounts.value = [];
        _filteredAccounts.value = [];
        searchQuery.value = '';
        selectedTags.value = [];
        selectedTypes.value = [];
        selectedFilters.value = [];
        outbox.value = [];
        isSyncing.value = false;
    };

    const refreshAccountsService = (currentUser) => {
        const owner = currentUser?.uuid || null;
        if (owner !== currentOwner || userStore.isDemo !== isDemoService || !owner) {
            generation++;
            resetAccounts();
            currentOwner = owner;
            isDemoService = userStore.isDemo;
        }
        accountsService?.dispose?.();
        accountsService = currentUser?.uuid
            ? (isDemoService ? new DemoAccountsService(currentUser) : new AccountsService(currentUser))
            : null;
    };

    watch([user, () => userStore.isDemo], ([newUser]) => {
        refreshAccountsService(newUser);
    }, { immediate: true, flush: 'sync' });

    const ensureAccountsService = () => {
        if (!accountsService) {
            throw new SessionExpiredException('Session expired. Please sign in again.');
        }

        return accountsService;
    };
    const networkStore = useNetworkStore();

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
        const epoch = generation;
        if (!accountsService) {
            recentAccounts.value = [];
            accounts.value = [];
            areAccountsLoaded.value = false;
            _filteredAccounts.value = [];
            return;
        }

        const service = accountsService;

        // Pre fill the store with the cached accounts
        const cachedRecents = await service.getRecentsCached();
        const cachedAccounts = await service.getAllCached();
        if (epoch !== generation) return;

        // The server fetch runs in parallel and may finish first:
        // never replace fresher server data with the (possibly empty) cache
        if (!recentAccounts.value.length) {
            recentAccounts.value = cachedRecents;
        }

        if (!totalFetchedAccounts.value) {
            accounts.value = cachedAccounts;

            // After loading accounts from cache update the areAccountsLoaded value
            areAccountsLoaded.value = accounts.value.length > 0;
        }

        _filteredAccounts.value = accounts.value;
    }

    function getPendingEdit(index) {
        const item = outbox.value[index];
        if (!item || item.owner !== currentOwner || item.session !== generation || item.inFlight || !userStore.isLoggedIn) return null;
        return { type: item.type, account: parseAccount(JSON.parse(JSON.stringify(item.account))) };
    }

    function rememberPending(type, account, inFlight = false) {
        const owner = user.value?.uuid;
        if (!owner) throw new SessionExpiredException();
        const item = { owner, session: generation, type, inFlight, account: JSON.parse(JSON.stringify(account)) };
        const index = outbox.value.findIndex(entry => entry.owner === owner && entry.type === type && entry.account._id === account._id);
        if (index < 0) outbox.value.push(item);
        else outbox.value[index] = item;
        return outbox.value[index < 0 ? outbox.value.length - 1 : index];
    }

    function retainPending(type, account) {
        rememberPending(type, account);
        throw new Error('Not saved: secure offline storage is unavailable. This edit is in memory only while unlocked. Keep this editor open and retry online. Locking, signing out or closing the page discards it. It will not sync automatically.');
    }

    // The old queue has no trustworthy owner: never replay, display, overwrite or
    // delete its payload. Recovery requires an explicit owner-verified migration.
    async function processOutbox() {
        if (userStore.isDemo) return;
        try {
            const legacy = await localforage.getItem(LOCAL_STORAGE_OUTBOX_KEY);
            hasLegacyPending.value = legacy != null && (!Array.isArray(legacy) || legacy.length > 0);
        } catch (_) {
            hasLegacyPending.value = true; // unknown is not equivalent to empty
        }
    }

    function initSyncListeners() {
        // Subscribe to network store to trigger sync and refresh when going online
        const unsub = networkStore.$subscribe(async (mutation, state) => {
            if (state.isOnline && !userStore.isDemo) {
                await processOutbox();
                try {
                    await fetchAccounts();
                    await fetchRecentAccounts();
                } catch (_) {
                    // ignore
                }
            }
        });
        // return unsub if needed by caller
    }

    function findAccountById(accountId) {
        return accounts.value.find(a => a._id === accountId);
    }

    async function fetchRecentAccounts() {
        const epoch = generation;
        try {
            const service = ensureAccountsService();
            const result = await service.getRecents() || [];
            if (epoch !== generation) return;
            recentAccounts.value = result;

            await service.updateLocalRecentAccounts(recentAccounts.value);
        }
        catch (error) {
            if (epoch !== generation) return;
            if (error instanceof SessionExpiredException) {
                await userStore.signOut(true, { force: true }); // keep local cache when session expires
            }

            throw error;
        }
    }

    async function fetchAccounts () {
        const epoch = generation;
        try {
            const service = ensureAccountsService();
            // Update account while getting page by page from server
            await service.getAll(
                (fetchedAccounts, totalAccountsNumber) => {
                    if (epoch !== generation) return;
                    totalAccounts.value = totalAccountsNumber;

                    // If fetchedAccounts exist in accounts, update them, otherwise add them
                    fetchedAccounts.forEach(account => {
                        let index = accounts.value.findIndex(a => a._id === account._id);

                        if (index !== -1) {
                            // Update only accounts where last_modified_date is greater than the one in the store
                            if (new Date(account.last_modified_date) > new Date(accounts.value[index].last_modified_date)) {
                                accounts.value[index] = account;
                            }
                        }
                        else {
                            accounts.value.push(account);
                        }
                    });

                    totalFetchedAccounts.value += fetchedAccounts.length;

                    // After loading accounts from server update the areAccountsLoaded value
                    areAccountsLoaded.value = totalAccountsNumber > 0;
                },
                // Update cached accounts only when all accounts are fetched
                () => {
                    if (epoch === generation) updateLocalAccounts();
                }
            );
        }
        catch (error) {
            if (epoch !== generation) return;
            if (error instanceof SessionExpiredException) {
                await userStore.signOut(true, { force: true });
            }
            // If offline, keep using cache and schedule refresh on online
            if (networkStore.isOffline) {
                return; // cache is already loaded in loadCache; online listener will refresh
            }
            throw error;
        }
    }

    async function updateLocalAccounts() {
        const service = ensureAccountsService();
        await service.updateLocalAccounts(accounts.value);
    }

    async function addAccount (account) {
        const epoch = generation;
        ensureAccountsService();
        if (networkStore.isOffline && !userStore.isDemo) retainPending('create', account);
        const pending = userStore.isDemo ? null : rememberPending('create', account, true);
        try {
            const service = ensureAccountsService();
           // Wait for account to come with newly created _id
            const addedAccount = await service.add(account);
            if (epoch !== generation) return;
            outbox.value = outbox.value.filter(item => item !== pending);

            accounts.value.push(addedAccount);

            updateLocalAccounts(); 
        }
        catch (error) {
            if (epoch !== generation) return;
            if (pending) pending.inFlight = false;
            if (error instanceof SessionExpiredException) {
                await userStore.signOut(true, { force: true });
                throw error;
            }

            if (!userStore.isDemo && (networkStore.isOffline || error instanceof NetworkException || isNetworkError(error))) retainPending('create', account);

            throw error;
        }
    }

    async function updateAccount (account) {
        const epoch = generation;
        ensureAccountsService();
        if (networkStore.isOffline && !userStore.isDemo) retainPending('update', account);
        const pending = userStore.isDemo ? null : rememberPending('update', account, true);
        try {
            account.last_modified_date = new Date();
            account.last_opened_date = new Date();
            account.opened_count = account.opened_count ? account.opened_count + 1 : 1;

            const service = ensureAccountsService();
            const updatedAccount = await service.save(account);
            if (epoch !== generation) return;
            outbox.value = outbox.value.filter(item => item !== pending);

            let index = accounts.value.findIndex(a => a._id === updatedAccount._id);

            accounts.value[index] = updatedAccount;

            updateLocalAccounts();
        }
        catch (error) {
            if (epoch !== generation) return;
            if (pending) pending.inFlight = false;
            if (error instanceof SessionExpiredException) {
                await userStore.signOut(true, { force: true });
                throw error;
            }

            if (!userStore.isDemo && (networkStore.isOffline || error instanceof NetworkException || isNetworkError(error))) retainPending('update', account);

            throw error;
        }
    }

    async function removeAccount(account) {
        const epoch = generation;
        ensureAccountsService();
        if (networkStore.isOffline && !userStore.isDemo) retainPending('remove', account);
        const pending = userStore.isDemo ? null : rememberPending('remove', account, true);
        try {
            const service = ensureAccountsService();
            await service.remove(account);
            if (epoch !== generation) return;
            outbox.value = outbox.value.filter(item => item !== pending);

            let indexToRemove = accounts.value.findIndex(a => a._id === account._id);

            accounts.value.splice(indexToRemove, 1);

            updateLocalAccounts();
        }
        catch (error) {
            if (epoch !== generation) return;
            if (pending) pending.inFlight = false;
            if (error instanceof SessionExpiredException) {
                await userStore.signOut(true, { force: true });
                throw error;
            }

            if (!userStore.isDemo && (networkStore.isOffline || error instanceof NetworkException || isNetworkError(error))) retainPending('remove', account);

            throw error;
        }
    }

    async function enableServerEncryption() {
        const epoch = generation;
        try {
            const service = ensureAccountsService();
            await service.enableServerEncryption(accounts.value);
        }
        catch (error) {
            if (epoch !== generation) return;
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
        outbox,
        getPendingEdit,
        hasLegacyPending,
        isSyncing,

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

        enableServerEncryption,

        // offline sync API
        processOutbox,
        initSyncListeners
    }
}); 

export default store;

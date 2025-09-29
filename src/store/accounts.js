import { ref, computed, watch } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import { useUserStore, useNetworkStore, useAlertStore } from '@/store';
import { APP_ACCOUNTS_STORE } from '../utils/store';
import { SessionExpiredException, isNetworkError } from '../utils/errors'
import localforage from 'localforage'
import { LOCAL_STORAGE_OUTBOX_KEY } from '../utils/storage'

import AccountsService from '../services/AccountsService';
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

    const refreshAccountsService = (currentUser) => {
        accountsService = currentUser ? new AccountsService(currentUser) : null;
    };

    watch(user, (newUser) => {
        refreshAccountsService(newUser);
    }, { immediate: true });

    const ensureAccountsService = () => {
        if (!accountsService) {
            throw new SessionExpiredException('Session expired. Please sign in again.');
        }

        return accountsService;
    };
    const networkStore = useNetworkStore();

    // Simple lock to prevent concurrent sync
    const isSyncing = ref(false);
    const outbox = ref([]);

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
        if (!accountsService) {
            recentAccounts.value = [];
            accounts.value = [];
            areAccountsLoaded.value = false;
            _filteredAccounts.value = [];
            return;
        }

        const service = accountsService;

        // Pre fill the store with the cached accounts
        recentAccounts.value = await service.getRecentsCached();
        accounts.value = await service.getAllCached();

        // After loading accounts from cache update the areAccountsLoaded value
        areAccountsLoaded.value = accounts.value.length > 0;

        _filteredAccounts.value = accounts.value;
    }

    // -------- Outbox helpers --------
    async function readOutbox() {
        const q = await localforage.getItem(LOCAL_STORAGE_OUTBOX_KEY);
        outbox.value = Array.isArray(q) ? q : [];
        return outbox.value;
    }

    async function writeOutbox(queue) {
        // Ensure we never pass reactive proxies to IndexedDB
        const serializable = JSON.parse(JSON.stringify(queue || []));
        outbox.value = serializable;
        await localforage.setItem(LOCAL_STORAGE_OUTBOX_KEY, serializable);
    }

    async function enqueueOutbox(item) {
        const queue = await readOutbox();
        queue.push({ ...item, id: `${Date.now()}-${Math.random().toString(36).slice(2)}` });
        await writeOutbox(queue);
    }

    // Map temp ids to server ids during sync
    function isTempId(id) {
        return typeof id === 'string' && id.startsWith('tmp_');
    }

    // Process queued offline operations when back online
    async function processOutbox() {
        if (isSyncing.value) return;
        if (networkStore.isOffline) return;
        if (!user.value || !user.value.token) return;

        const service = ensureAccountsService();

        isSyncing.value = true;
        try {
            let queue = await readOutbox();
            if (!queue.length) return;

            const idMap = {}; // tempId -> realId
            let processedCount = 0;

            for (let i = 0; i < queue.length; i++) {
                const item = queue[i];
                try {
                    if (item.type === 'create') {
                        // Send create
                        const created = await service.add(item.account);

                        // Replace temp in local state
                        const index = accounts.value.findIndex(a => a._id === item.account._id);
                        if (index !== -1) {
                            accounts.value[index] = created;
                        } else {
                            accounts.value.push(created);
                        }

                        idMap[item.account._id] = created._id;
                        await updateLocalAccounts();
                    }
                    else if (item.type === 'update') {
                        // Fix id if it was a temp id replaced earlier in the same run
                        if (isTempId(item.account._id) && idMap[item.account._id]) {
                            item.account._id = idMap[item.account._id];
                        }
                        const updated = await service.save(item.account);
                        const index = accounts.value.findIndex(a => a._id === updated._id);
                        if (index !== -1) {
                            accounts.value[index] = updated;
                        }
                        await updateLocalAccounts();
                    }
                    else if (item.type === 'remove') {
                        // Fix id if it was a temp id
                        if (isTempId(item.account._id) && idMap[item.account._id]) {
                            item.account._id = idMap[item.account._id];
                        }
                        await service.remove(item.account);
                        // Already removed locally when enqueued
                    }

                    // Remove processed item from the queue
                    queue.splice(i, 1);
                    i--; // adjust index after removal
                    await writeOutbox(queue);
                    processedCount++;
                }
                catch (err) {
                    // Stop processing on first failure (likely offline again or server issue)
                    break;
                }
            }

            // Notify user once when sync succeeded for some items
            if (processedCount > 0) {
                const alertStore = useAlertStore();
                alertStore.openAlert('Synced changes', `Successfully synced ${processedCount} change${processedCount>1?'s':''}.`, 'success');
            }
        } finally {
            isSyncing.value = false;
        }
    }

    function initSyncListeners() {
        // Subscribe to network store to trigger sync and refresh when going online
        const unsub = networkStore.$subscribe(async (mutation, state) => {
            if (state.isOnline) {
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
        try {
            const service = ensureAccountsService();
            recentAccounts.value = await service.getRecents() || [];

            await service.updateLocalRecentAccounts(recentAccounts.value);
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
            const service = ensureAccountsService();
            // Update account while getting page by page from server
            await service.getAll(
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
        try {
            const service = ensureAccountsService();
           // Wait for account to come with newly created _id
            const addedAccount = await service.add(account);

            accounts.value.push(addedAccount);

            updateLocalAccounts(); 
        }
        catch (error) {
            if (error instanceof SessionExpiredException) {
                await userStore.signOut(true);
                throw error;
            }

            // Offline: create a temporary account locally and enqueue
            if (networkStore.isOffline) {
                const tempId = `tmp_${Date.now()}`;
                const tempAccount = parseAccount({ ...account, _id: tempId, created_date: new Date(), last_modified_date: new Date(), last_opened_date: new Date(), opened_count: account.opened_count || 0 });
                accounts.value.push(tempAccount);
                await updateLocalAccounts();

                await enqueueOutbox({ type: 'create', account: tempAccount, timestamp: Date.now() });
                return; // consider as success for UX
            }

            throw error;
        }
    }

    async function updateAccount (account) {
        try {
            account.last_modified_date = new Date();
            account.last_opened_date = new Date();
            account.opened_count = account.opened_count ? account.opened_count + 1 : 1;

            const service = ensureAccountsService();
            const updatedAccount = await service.save(account);

            let index = accounts.value.findIndex(a => a._id === updatedAccount._id);

            accounts.value[index] = updatedAccount;

            updateLocalAccounts();
        }
        catch (error) {
            if (error instanceof SessionExpiredException) {
                await userStore.signOut(true);
                throw error;
            }

            // Offline: update locally and enqueue
            if (networkStore.isOffline) {
                const index = accounts.value.findIndex(a => a._id === account._id);
                if (index !== -1) {
                    accounts.value[index] = parseAccount({ ...account });
                }
                await updateLocalAccounts();

                await enqueueOutbox({ type: 'update', account: { ...account }, timestamp: Date.now() });
                return;
            }

            throw error;
        }
    }

    async function removeAccount(account) {
        try {
            const service = ensureAccountsService();
            await service.remove(account);

            let indexToRemove = accounts.value.findIndex(a => a._id === account._id);

            accounts.value.splice(indexToRemove, 1);

            updateLocalAccounts();
        }
        catch (error) {
            if (error instanceof SessionExpiredException) {
                await userStore.signOut(true);
                throw error;
            }

            // Offline: remove locally and enqueue
            if (networkStore.isOffline) {
                const indexToRemove = accounts.value.findIndex(a => a._id === account._id);
                if (indexToRemove !== -1) {
                    accounts.value.splice(indexToRemove, 1);
                }
                await updateLocalAccounts();

                await enqueueOutbox({ type: 'remove', account: { _id: account._id }, timestamp: Date.now() });
                return;
            }

            throw error;
        }
    }

    async function enableServerEncryption() {
        try {
            const service = ensureAccountsService();
            await service.enableServerEncryption(accounts.value);
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
        outbox,

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

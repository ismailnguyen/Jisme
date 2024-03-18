import { ref, computed, toRaw } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import { useUserStore } from '@/store';
import { APP_ACCOUNTS_STORE } from '../utils/store';

import AccountsService from '../services/AccountsService';
import FilterService from '../services/FilterService';

const store = defineStore(APP_ACCOUNTS_STORE, () => {
    const userStore = useUserStore();
    // const user = ref(userStore.user)
    const { user } = storeToRefs(userStore);

    const recentAccounts = ref([]);
    const accounts = ref([]);

    let accountsService = new AccountsService(user.value);

    const getAccountsFilteredByQuery = computed(() => {
        return (searchQuery, tags, sort = false) => {
            const filterService = new FilterService(toRaw(accounts.value));
            filterService.filterByTags(tags);
            filterService.filterByQuery(searchQuery);

            if (sort) {
                filterService.sortByLastOpened();
            }

            return filterService.getAccounts();
        }
    })

    const getUniqueTags = () => {
        let uniqueTags = [];

        accounts.value.forEach(account => {
            account.tags.split(',').map(t => t.trim()).forEach(tagName => {
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
    }

    async function fetchRecentAccounts() {
        recentAccounts.value = await accountsService.getRecents();

        await accountsService.updateLocalRecentAccounts(recentAccounts.value );
    }

    async function fetchAccounts () {
        // Update account while getting page by page from server
        await accountsService.getAll((fetchedAccounts) => {
            accounts.value = fetchedAccounts;

            updateLocalAccounts(accounts.value);
        });
    }

    async function updateLocalAccounts(accounts) {
        await accountsService.updateLocalAccounts(accounts);
    }

    async function addAccount (account) {
        await accountsService.add(account);

        accounts.value.push(account);

        updateLocalAccounts(accounts.value);

        userStore.update();
    }

    async function updateAccount (account) {
        account.last_modified_date = new Date();
        account.last_opened_date = new Date();
        account.opened_count = account.opened_count ? account.opened_count + 1 : 1;

        await accountsService.save(account);

        let index = accounts.value.findIndex(a => a._id === account._id);

        accounts.value[index] = account;

        updateLocalAccounts(accounts.value);
    }

    async function removeAccount(account) {
        await accountsService.remove(account);

        let indexToRemove = accounts.value.findIndex(a => a._id === account._id);

        accounts.value.splice(indexToRemove, 1);

        updateLocalAccounts(accounts.value);

        userStore.update();
    }

    return {
        user,
        recentAccounts,
        accounts,

        getAccountsFilteredByQuery,
        getUniqueTags,

        loadCache,
        fetchRecentAccounts,
        fetchAccounts,
        addAccount,
        updateAccount,
        removeAccount
    }
})

export default store;

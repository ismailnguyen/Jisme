import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { useAccountsStore } from '@/store';

import Account from '../models/Account';

const store = defineStore('ui', () => {
    const accountsStore = useAccountsStore();

    const isMenuOpened = ref(false);
    const isAddAccountModalOpened = ref(false);
    const isEditAccountModalOpened = ref(false);
    const isSettingsOpened = ref(false);
    const isTagsListOpened = ref(false);
    const isTagsTreeOpened = ref(false);
    const currentEditingAccount = ref(new Account());

    const isAccountOpened = computed(() => {
        return isAddAccountModalOpened.value == true
            || isEditAccountModalOpened.value == true;
    })

    const toggleMenu = () => {
        isMenuOpened.value = !isMenuOpened.value;
    }

    const openMenu = () => {
        isMenuOpened.value = true;
    }

    const openSettings = () => {
        isSettingsOpened.value = true;
    }

    const closeSettings = () => {
        isSettingsOpened.value = false;
    }

    const openTagsList = () => {
        isTagsListOpened.value = true;
    }

    const closeTagsList = () => {
        isTagsListOpened.value = false;
    }

    const openTagsTree = () => {
        isTagsListOpened.value = true;
    }

    const closeTagsTree = () => {
        isTagsListOpened.value = false;
    }

    const openAddAccountModal = () => {
        isAddAccountModalOpened.value = true;
    }

    const closeAddAccountModal = () => {
        isAddAccountModalOpened.value = false;
    }

    const openEditAccountModal = async (account) => {
        currentEditingAccount.value = account;
        isEditAccountModalOpened.value = true;

        await accountsStore.updateAccount(account);
    }

    const closeEditAccountModal = () => {
        isEditAccountModalOpened.value = false;
        currentEditingAccount.value = new Account();
    }

    const openSidebar = (name) => {
        // Map of each sidebar name and its action to open them
        const sidebarMap = {
            'Settings': openSettings,
            'Tags': openTagsList,
            'AddAccount': openAddAccountModal,
            'Menu': openMenu
        }

        if (sidebarMap[name]) {
            sidebarMap[name]();
        }
    }

    return {
        isMenuOpened,
        openMenu,
        toggleMenu,

        isAccountOpened,

        isAddAccountModalOpened,
        openAddAccountModal,
        closeAddAccountModal,

        currentEditingAccount,
        isEditAccountModalOpened,
        openEditAccountModal,
        closeEditAccountModal,

        isSettingsOpened,
        openSettings,
        closeSettings,

        isTagsListOpened,
        openTagsList,
        closeTagsList,

        isTagsTreeOpened,
        openTagsTree,
        openTagsList,

        openSidebar
    };
})

export default store;
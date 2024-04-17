import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import Account from '../models/Account';

const store = defineStore('ui', () => {
    const isMenuOpened = ref(false);
    const isAddAccountModalOpened = ref(false);
    const isEditAccountModalOpened = ref(false);
    const isSettingsOpened = ref(false);
    const isTagsOpened = ref(false);
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

    const openTags = () => {
        isTagsOpened.value = true;
    }

    const closeTags = () => {
        isTagsOpened.value = false;
    }

    const openAddAccountModal = () => {
        isAddAccountModalOpened.value = true;
    }

    const closeAddAccountModal = () => {
        isAddAccountModalOpened.value = false;
    }

    const openEditAccountModal = (account) => {
        currentEditingAccount.value = account;
        isEditAccountModalOpened.value = true;
    }

    const closeEditAccountModal = () => {
        isEditAccountModalOpened.value = false;
        currentEditingAccount.value = new Account();
    }

    const openSidebar = (name) => {
        // Map of each sidebar name and its action to open them
        const sidebarMap = {
            'Settings': openSettings,
            'Tags': openTags,
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

        isTagsOpened,
        openTags,
        closeTags,

        openSidebar
    };
})

export default store;
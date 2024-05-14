import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { useAccountsStore } from '@/store';

import Account from '../models/Account';

const store = defineStore('ui', () => {
    const accountsStore = useAccountsStore();

    const currentEditingAccount = ref(new Account());
    const openedSidebarList = ref([]);

    const SIDEBAR = {
        MENU: 'menu',
        SETTINGS: 'settings',
        SETTINGS_PROFILE: 'settings_profile',
        SETTINGS_SECURITY: 'settings_security',
        SETTINGS_RECENT_ACTIVITIES: 'settings_recent-activities',
        TAGS_LIST: 'tags-list',
        TAGS_TREE: 'tags-tree',
        ADD_ACCOUNT: 'add-account',
        EDIT_ACCOUNT: 'edit-account'
    };

    const isLeftSidebarOpened = computed(() => {
        return isSidebarOpen(SIDEBAR.MENU);
    })

    const isRightSidebarOpened = computed(() => {
        return isSidebarOpen(SIDEBAR.SETTINGS)
            || isSidebarOpen(SIDEBAR.SETTINGS_PROFILE)
            || isSidebarOpen(SIDEBAR.SETTINGS_SECURITY)
            || isSidebarOpen(SIDEBAR.SETTINGS_RECENT_ACTIVITIES)
            || isSidebarOpen(SIDEBAR.TAGS_LIST)
            || isSidebarOpen(SIDEBAR.TAGS_TREE)
            || isSidebarOpen(SIDEBAR.EDIT_ACCOUNT)
            || isSidebarOpen(SIDEBAR.ADD_ACCOUNT);
    })

    const setCurrentEditingAccount = async (account) => {
        currentEditingAccount.value = account;

        // Do not await for this task because it can run on background
        accountsStore.updateAccount(account);
    }

    const resetCurrentEditingAccount = () => {
        currentEditingAccount.value = new Account();
    }

    const openSidebar = (name) => {
        openedSidebarList.value.push(name);
    }

    const closeSidebar = (name) => {
        openedSidebarList.value = openedSidebarList.value.filter(item => item !== name);
    }

    const isSidebarOpen = (name) => {
        return openedSidebarList.value.includes(name);
    }

    const toggleSidebar = (name) => {
        if (isSidebarOpen(name)){
            closeSidebar(name);
        }
        else {
            openSidebar(name);
        }
    }

    return {
        currentEditingAccount,
        setCurrentEditingAccount,
        resetCurrentEditingAccount,

        SIDEBAR,

        toggleSidebar,
        openSidebar,
        closeSidebar,

        isSidebarOpen,
        isLeftSidebarOpened,
        isRightSidebarOpened,
    };
})

export default store;
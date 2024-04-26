import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { useAccountsStore } from '@/store';

import Account from '../models/Account';

const store = defineStore('ui', () => {
    const accountsStore = useAccountsStore();

    const currentEditingAccount = ref(new Account());
    const activeSidebarPanel = ref('');
    const openedSidebarList = ref([]);

    const SIDEBAR = {
        MENU: 'menu',
        SETTINGS: 'settings',
        TAGS_LIST: 'tags-list',
        TAGS_TREE: 'tags-tree',
        ADD_ACCOUNT: 'add-account',
        EDIT_ACCOUNT: 'edit-account'
    };

    const setActiveSidebarPanel = (panel) => {
        activeSidebarPanel.value = panel;
    }

    const isLeftSidebarOpened = computed(() => {
        return isSidebarOpen(SIDEBAR.MENU);
    })

    const isRightSidebarOpened = computed(() => {
        return isSidebarOpen(SIDEBAR.MENU)
            || isSidebarOpen(SIDEBAR.SETTINGS)
            || isSidebarOpen(SIDEBAR.TAGS_LIST)
            || isSidebarOpen(SIDEBAR.TAGS_TREE)
            || isSidebarOpen(SIDEBAR.EDIT_ACCOUNT)
            || isSidebarOpen(SIDEBAR.ADD_ACCOUNT);
    })

    const setCurrentEditingAccount = async (account) => {
        currentEditingAccount.value = account;

        await accountsStore.updateAccount(account);
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

        activeSidebarPanel,
        setActiveSidebarPanel,
    };
})

export default store;
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

    const isRightSidebarOpened = computed(() => {
        return isSidebarOpen(SIDEBAR.SETTINGS)
            || isSidebarOpen(SIDEBAR.SETTINGS_PROFILE)
            || isSidebarOpen(SIDEBAR.SETTINGS_SECURITY)
            || isSidebarOpen(SIDEBAR.SETTINGS_RECENT_ACTIVITIES)
            || isSidebarOpen(SIDEBAR.TAGS_LIST)
            || isSidebarOpen(SIDEBAR.TAGS_TREE);
    })

    const setCurrentEditingAccount = async (account) => {
        currentEditingAccount.value = account;

        // Do not await for this task because it can run on background
        accountsStore.updateAccount(account);
    }

    const resetCurrentEditingAccount = () => {
        currentEditingAccount.value = new Account();
    }

    const initBottomSheet = (bottomSheetElementId) => {
        const bottomSheet = document.querySelector(`#${ bottomSheetElementId }.bottom-sheet`);
        const sheetContent = bottomSheet.querySelector(`#${ bottomSheetElementId }.bottom-sheet .content`);
        const dragIcon = bottomSheet.querySelector(`#${ bottomSheetElementId }.bottom-sheet .drag-icon`);

        let isDragging = false, startY, startHeight;

        const dragStart = (e) => {
            isDragging = true;
            startY = e.pageY || e.touches?.[0].pageY;
            startHeight = parseInt(sheetContent.style.height);
            bottomSheet.classList.add("dragging");
        }

        const dragging = (e, bottomSheetElementId) => {
            if(!isDragging) return;
            const delta = startY - (e.pageY || e.touches?.[0].pageY);
            const newHeight = startHeight + delta / window.innerHeight * 100;
            updateSheetHeight(bottomSheetElementId, newHeight);
        }

        const dragStop = () => {
            isDragging = false;
            bottomSheet.classList.remove("dragging");
            const sheetHeight = parseInt(sheetContent.style.height);
            sheetHeight < 25 ? hideBottomSheet() : sheetHeight > 75 ? updateSheetHeight(bottomSheetElementId, 100) : updateSheetHeight(bottomSheetElementId, 50);
        }

        dragIcon.addEventListener("mousedown", dragStart);
        document.addEventListener("mousemove", (event) => dragging(event, bottomSheetElementId));
        document.addEventListener("mouseup", dragStop);

        dragIcon.addEventListener("touchstart", dragStart);
        document.addEventListener("touchmove", (event) => dragging(event, bottomSheetElementId));
        document.addEventListener("touchend", dragStop);
    }

    const openSidebar = (name) => {
        openedSidebarList.value.push(name);
        document.body.style.overflowY = "hidden";

        if (name === SIDEBAR.EDIT_ACCOUNT || name === SIDEBAR.ADD_ACCOUNT) {
            showBottomSheet(`${ name }-bottom-sheet`);
        }
    }

    const updateSheetHeight = (bottomSheetElementId, height) => {
        const sheetContent = document.querySelector(`#${ bottomSheetElementId }.bottom-sheet .content`);
        sheetContent.style.height = `${height}vh`; //updates the height of the sheet content

        const bottomSheet = document.querySelector(`#${ bottomSheetElementId }.bottom-sheet`);
        // Toggles the fullscreen class to bottomSheet if the height is equal to 100
        bottomSheet.classList.toggle("fullscreen", height === 100);
        document.body.classList.toggle("right-sidebar-opened", height === 100);
    }

    const showBottomSheet = (bottomSheetElementId) => {
        disableBodyScroll();
        updateSheetHeight(bottomSheetElementId, 50);
    }

    const hideBottomSheet = () => {
        enableBodyScroll();
    }

    const enableBodyScroll = () => {
        document.body.style.overflowY = "auto";
    }

    const disableBodyScroll = () => {
        document.body.style.overflowY = "hidden";
    }

    const closeSidebar = (name) => {
        openedSidebarList.value = openedSidebarList.value.filter(item => item !== name);

        if (name === SIDEBAR.EDIT_ACCOUNT || name === SIDEBAR.ADD_ACCOUNT) {
            hideBottomSheet();
        }
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
        isRightSidebarOpened,

        initBottomSheet
    };
})

export default store;
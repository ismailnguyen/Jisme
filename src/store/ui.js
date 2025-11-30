import { ref } from 'vue';
import { defineStore } from 'pinia';
import { useAccountsStore, useNetworkStore } from '@/store';

import Account from '../models/Account';

const store = defineStore('ui', () => {
    const accountsStore = useAccountsStore();

    const currentAddingAccount = ref(new Account());
    const currentEditingAccount = ref(new Account());
    const openedSidebarList = ref([]);

    const isSummaryPaneExpanded = ref(false);
    const isAdvancedSearchMode = ref(false);

    const SIDEBAR = {
        MENU: 'menu',
        ADD_ACCOUNT: 'add-account',
        EDIT_ACCOUNT: 'edit-account'
    };

    const setCurrentAddingAccount = async (account) => {
        currentAddingAccount.value = account;
    }

    const resetCurrentAddingAccount = () => {
        currentAddingAccount.value = new Account();
    }

    const setCurrentEditingAccount = async (account) => {
        currentEditingAccount.value = account;

        // Do not await for this task because it can run on background
        const networkStore = useNetworkStore();
        accountsStore.updateAccount(account).catch((error) => {
            if (networkStore.isOffline) {
                return; // silently ignore background updates while offline
            }
            console.error('Background updateAccount failed', error);
        });
    }

    const resetCurrentEditingAccount = () => {
        currentEditingAccount.value = new Account();
    }

    const initBottomSheet = (bottomSheetElementId) => {
        const bottomSheet = document.querySelector(`#${ bottomSheetElementId }.bottom-sheet`);
        const dragIcon = bottomSheet.querySelector(`#${ bottomSheetElementId }.bottom-sheet .drag-icon`);

        let isDragging = false, startY, startHeight;

        const dragStart = (e, bottomSheetElementId) => {
            isDragging = true;
            startY = e.pageY || e.touches?.[0].pageY;

            const bottomSheet = document.querySelector(`#${ bottomSheetElementId }.bottom-sheet`);
            const sheetContent = bottomSheet.querySelector(`#${ bottomSheetElementId }.bottom-sheet .content`);

            startHeight = parseInt(sheetContent.style.height);
            bottomSheet.classList.add("dragging");
        }

        const dragging = (e, bottomSheetElementId) => {
            if(!isDragging) return;

            const delta = startY - (e.pageY || e.touches?.[0].pageY);
            const newHeight = startHeight + delta / window.innerHeight * 100;

            updateSheetHeight(bottomSheetElementId, newHeight);
        }

        const dragStop = (e, bottomSheetElementId) => {
            isDragging = false;
        
            const bottomSheet = document.querySelector(`#${ bottomSheetElementId }.bottom-sheet`);
            bottomSheet.classList.remove("dragging");

            const sheetContent = bottomSheet.querySelector(`#${ bottomSheetElementId }.bottom-sheet .content`);
            const sheetHeight = parseInt(sheetContent.style.height);

            sheetHeight < 25 ? 
                hideBottomSheet() : sheetHeight > 75 ? 
                    updateSheetHeight(bottomSheetElementId, 100) : updateSheetHeight(bottomSheetElementId, 50);
        }

        dragIcon.addEventListener('mousedown', (event) => dragStart(event, bottomSheetElementId));
        document.addEventListener('mousemove', (event) => dragging(event, bottomSheetElementId));
        document.addEventListener('mouseup', (event) => dragStop(event, bottomSheetElementId));

        dragIcon.addEventListener('touchstart', (event) => dragStart(event, bottomSheetElementId), { passive: true });
        document.addEventListener('touchmove', (event) => dragging(event, bottomSheetElementId));
        document.addEventListener('touchend', (event) => dragStop(event, bottomSheetElementId));
    }

    const openSidebar = (name) => {
        openedSidebarList.value.push(name);
        disableBodyScroll();

        if (name === SIDEBAR.EDIT_ACCOUNT && isMobile()) {
            expandBottomSheet('edit-account-bottom-sheet');
        }
    }

    const updateSheetHeight = (bottomSheetElementId, height) => {   
        const sheetContent = document.querySelector(`#${ bottomSheetElementId }.bottom-sheet .content`);
        sheetContent.style.height = `${height}vh`; //updates the height of the sheet content

        // const bottomSheet = document.querySelector(`#${ bottomSheetElementId }.bottom-sheet`);
        // // Toggles the fullscreen class to bottomSheet if the height is equal to 100
        // bottomSheet.classList.toggle("fullscreen", height === 100);
    }

    // Programmatic controls
    const setBottomSheetHeight = (bottomSheetElementId, height) => {
        updateSheetHeight(bottomSheetElementId, height);
    }

    const expandBottomSheet = (bottomSheetElementId) => {
        updateSheetHeight(bottomSheetElementId, 100);
    }

    const reduceBottomSheet = (bottomSheetElementId) => {
        updateSheetHeight(bottomSheetElementId, 50);
    }

    const hideBottomSheet = () => {
        enableBodyScroll();
    }

    const enableBodyScroll = () => {
        document.body.style.overflowY = 'auto';
        document.body.style.touchAction = 'auto';
    }

    const disableBodyScroll = () => {
        document.body.style.overflowY = 'hidden';
        document.body.style.touchAction = 'none';
    }

    const closeSidebar = (name) => {
        openedSidebarList.value = openedSidebarList.value.filter(item => item !== name);
        enableBodyScroll();

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

    const reduceSummaryPane = () => {
        isSummaryPaneExpanded.value = false;
    }

    const expandSummaryPane = () => {
        isSummaryPaneExpanded.value = true;
    }

    const toggleAdvancedSearchMode = (toggled) => {
        isAdvancedSearchMode.value = toggled;
        if (isAdvancedSearchMode.value) {
            expandSummaryPane();
        } else {
            reduceSummaryPane();
        }
    }

    const isMobile = () => {
        return window.innerWidth <= 768; // Adjust the width as per your design breakpoints
    }

    const isSummaryShortcutsEnabled = () => {
        // Show summary shortcuts only if there are accounts
        if (accountsStore.totalAccounts === false) {
            return false;
        }

        // On desktop, always show summary shortcuts
        if (!isMobile()) {
            return true;
        }

        // On mobile, show summary shortcuts only when:
        // - not searching
        // - and not in advanced search mode
        if (isMobile()) {
            // Is user is searching
            if (accountsStore.isSearching) {
                return false;
            }

            // Or advanced search mode panel is open
            if (isAdvancedSearchMode.value) {
                return true;//false;
            }
        }

        return true;
    }

    return {
        currentAddingAccount,
        setCurrentAddingAccount,
        resetCurrentAddingAccount,

        currentEditingAccount,
        setCurrentEditingAccount,
        resetCurrentEditingAccount,

        SIDEBAR,

        toggleSidebar,
        openSidebar,
        closeSidebar,

        isSidebarOpen,

        initBottomSheet,
        setBottomSheetHeight,
        expandBottomSheet,
        reduceBottomSheet,

        isSummaryPaneExpanded,

        isAdvancedSearchMode,
        toggleAdvancedSearchMode,

        isSummaryShortcutsEnabled
    };
})

export default store;

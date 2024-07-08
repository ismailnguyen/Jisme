import { ref } from 'vue';
import { defineStore } from 'pinia';
import { useAccountsStore } from '@/store';

import Account from '../models/Account';

const store = defineStore('ui', () => {
    const accountsStore = useAccountsStore();

    const currentEditingAccount = ref(new Account());
    const openedSidebarList = ref([]);

    const SIDEBAR = {
        MENU: 'menu',
        ADD_ACCOUNT: 'add-account',
        EDIT_ACCOUNT: 'edit-account'
    };

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
    }

    const updateSheetHeight = (bottomSheetElementId, height) => {
        const sheetContent = document.querySelector(`#${ bottomSheetElementId }.bottom-sheet .content`);
        sheetContent.style.height = `${height}vh`; //updates the height of the sheet content

        const bottomSheet = document.querySelector(`#${ bottomSheetElementId }.bottom-sheet`);
        // Toggles the fullscreen class to bottomSheet if the height is equal to 100
        bottomSheet.classList.toggle("fullscreen", height === 100);
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

    return {
        currentEditingAccount,
        setCurrentEditingAccount,
        resetCurrentEditingAccount,

        SIDEBAR,

        toggleSidebar,
        openSidebar,
        closeSidebar,

        isSidebarOpen,

        initBottomSheet
    };
})

export default store;
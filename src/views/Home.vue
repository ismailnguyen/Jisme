<template>
    <div :class="sidebarAdjustmentClasses">
        <Menu
            :user="user"
            v-if="displayMenus" />
 
        <AddAccountModal v-if="displayMenus && isAddAccountModalOpened" />

        <EditAccountModal 
            :account="currentEditingAccount"
            v-if="displayMenus && isEditAccountModalOpened" />

        <Settings v-if="isSettingsOpened" />
        <TagsList v-if="isTagsOpened" />

        <AccountList />

        <a
            id="menu-toggle"
            class="floating-button"
            :class="isMenuOpened ? 'floating-button--close' : 'floating-button--menu'"
            @click="onToggleMenu" v-show="displayMenus">
            <i class="fa fa-solid" :class="isMenuOpened ? 'fa-close' : 'fa-bars-staggered'"></i>
        </a>

        <a
            id="menu-toggle"
            class="floating-button floating-button--add d-none d-lg-block d-xl-block"
            @click="onAddAccountModalToggled"
            v-if="!isMenuOpened && displayMenus">
            <i class="fa fa-plus"></i>
        </a>
    </div>
</template>

<script>
    import '../assets/home.css'

    import { storeToRefs } from 'pinia'
    import {
        useUiStore,
        useUserStore
    } from '@/store'
    import Menu from '../components/Menu.vue'
    import AddAccountModal from '../components/AddAccount.vue'
    import EditAccountModal from '../components/EditAccount.vue'
    import AccountList from '../components/AccountList.vue'
    import Settings from '../components/Settings.vue'
    import TagsList from '../components/TagsList.vue'

    export default {
        components: {
            Menu,
            AddAccountModal,
            EditAccountModal,
            AccountList,
            Settings,
            TagsList
        },
        setup() {
            const uiStore = useUiStore()
            const {
                currentEditingAccount,
                isMenuOpened,
                isSettingsOpened,
                isTagsOpened,
                isAddAccountModalOpened,
                isEditAccountModalOpened
            } = storeToRefs(uiStore)
            const { toggleMenu, openAddAccountModal } = uiStore 

            const userStore = useUserStore()
            const { user, isLoggedIn } = storeToRefs(userStore)

            return {
                currentEditingAccount,
                isMenuOpened,
                isAddAccountModalOpened,
                isEditAccountModalOpened,
                toggleMenu,
                openAddAccountModal,
                isSettingsOpened,
                isTagsOpened,

                user,
                isLoggedIn
            }
        },
        computed: {
            isAccountOpened: function () {
                return this.isAddAccountModalOpened || this.isEditAccountModalOpened;
            },

            displayMenus: function () {
                return this.isLoggedIn
            },

            sidebarAdjustmentClasses: function () {
                let cssClass = ''

                if (this.isMenuOpened) {
                    cssClass += ' menuDisplayed'
                }
                
                if (this.isAccountOpened) {
                    cssClass += ' accountOpened'
                }

                if (this.isSettingsOpened) {
                    cssClass += ' settingsOpened'
                }

                if (this.isTagsOpened) {
                    cssClass += ' tagsOpened'
                }

                return cssClass
            }
        },
        methods: {
            onAddAccountModalToggled: function () {
                this.openAddAccountModal();
            },

            onToggleMenu: function () {
                this.toggleMenu()
            }
        }
    }
</script>

<style>
    
</style>

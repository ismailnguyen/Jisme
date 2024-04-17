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
            @click="toggleMenu" v-show="displayMenus">
            <i class="fa fa-solid" :class="isMenuOpened ? 'fa-close' : 'fa-bars-staggered'"></i>
        </a>

        <a
            id="menu-toggle"
            class="floating-button floating-button--add d-none d-lg-block d-xl-block"
            @click="openAddAccountModal"
            v-if="!isMenuOpened && displayMenus">
            <i class="fa fa-plus"></i>
        </a>
    </div>
</template>

<script>
    import '../assets/home.css'

    import {
        mapState,
        mapActions
    } from 'pinia'
    import {
        useUserStore,
        useUiStore,
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
        props: {
            isSidebarOpen: {
                type: Boolean,
                default: false
            }
        },
        mounted() {
            if(this.isSidebarOpen) {
                this.openSidebar(this.$route.name);
            }
        },
        computed: {
            ...mapState(useUserStore, ['user', 'isLoggedIn']),
            ...mapState(useUiStore, [
                'currentEditingAccount',
                'isMenuOpened',
                'isSettingsOpened',
                'isTagsOpened',
                'isAddAccountModalOpened',
                'isEditAccountModalOpened'
            ]),

            isAccountOpened: function () {
                return this.isAddAccountModalOpened
                        || this.isEditAccountModalOpened;
            },

            displayMenus: function () {
                return this.isLoggedIn;
            },

            sidebarAdjustmentClasses: function () {
                let cssClass = '';

                if (this.isMenuOpened) {
                    cssClass += ' left-sidebar-opened';
                }
                
                if (this.isAccountOpened || this.isSettingsOpened || this.isTagsOpened) {
                    cssClass += ' right-sidebar-opened';
                }

                return cssClass;
            }
        },
        methods: {
            ...mapActions(useUiStore, [
                'toggleMenu',
                'openAddAccountModal',
                'openSidebar'
            ])
        }
    }
</script>

<style>
    
</style>

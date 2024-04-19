<template>
    <div :class="sidebarAdjustmentClasses">
        <Menu />
 
        <AddAccountModal v-if="isAddAccountModalOpened" />

        <EditAccountModal 
            :account="currentEditingAccount"
            v-if="isEditAccountModalOpened" />

        <Settings v-if="isSettingsOpened" />
        <TagsList v-if="isTagsListOpened" />

        <AccountList />

        <a
            id="menu-toggle"
            class="floating-button floating-button--menu"
            @click="toggleMenu">
            <i class="fa fa-solid fa-bars-staggered"></i>
        </a>

        <a
            id="menu-toggle"
            class="floating-button floating-button--add d-none"
            :class="isMenuOpened ? '' : 'd-lg-block d-xl-block'"
            @click="openAddAccountModal">
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
                'isTagsListOpened',
                'isAddAccountModalOpened',
                'isEditAccountModalOpened'
            ]),

            isAccountOpened: function () {
                return this.isAddAccountModalOpened
                        || this.isEditAccountModalOpened;
            },

            sidebarAdjustmentClasses: function () {
                let cssClass = '';

                if (this.isMenuOpened) {
                    cssClass += ' left-sidebar-opened';
                }
                
                if (this.isAccountOpened || this.isSettingsOpened || this.isTagsListOpened) {
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

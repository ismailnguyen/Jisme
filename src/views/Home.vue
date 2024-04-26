<template>
    <div :class="sidebarAdjustmentClasses" v-if="user">
        <Menu :visible="isMenuOpened" />
 
        <AddAccountModal :visible="isAddAccountModalOpened" />

        <EditAccountModal 
            :account="currentEditingAccount"
            :visible="isEditAccountModalOpened" />

        <Settings :visible="isSettingsOpened" />
        <TagsList :visible="isTagsListOpened" />
        <TagsTree :visible="isTagsTreeOpened" />

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
    import TagsTree from '../components/TagsTree.vue'

    export default {
        components: {
            Menu,
            AddAccountModal,
            EditAccountModal,
            AccountList,
            Settings,
            TagsList,
            TagsTree
        },
        props: {
            isAnySidebarOpen: {
                type: Boolean,
                default: false
            },
            sidebarName: {
                type: String,
                default: ''
            }
        },
        mounted() {
            if(this.isAnySidebarOpen && this.sidebarName) {
                this.openSidebar(this.sidebarName);
            }
        },
        computed: {
            ...mapState(useUserStore, ['user', 'isLoggedIn']),
            ...mapState(useUiStore, [
                'currentEditingAccount',
                'isLeftSidebarOpened',
                'isRightSidebarOpened',
                'isMenuOpened',
                'isSettingsOpened',
                'isTagsListOpened',
                'isTagsTreeOpened',
                'isAddAccountModalOpened',
                'isEditAccountModalOpened'
            ]),

            isAccountOpened: function () {
                return this.isAddAccountModalOpened
                        || this.isEditAccountModalOpened;
            },

            sidebarAdjustmentClasses: function () {
                let cssClass = '';

                if (this.isLeftSidebarOpened) {
                    cssClass += ' left-sidebar-opened';
                }
                
                if (this.isRightSidebarOpened) {
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

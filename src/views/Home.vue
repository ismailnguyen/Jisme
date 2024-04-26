<template>
    <div :class="sidebarAdjustmentClasses" v-if="user">
        <Menu :visible="isSidebarOpen(SIDEBAR.MENU)" />
 
        <AddAccountModal :visible="isSidebarOpen(SIDEBAR.ADD_ACCOUNT)" />

        <EditAccountModal 
            :account="currentEditingAccount"
            :visible="isSidebarOpen(SIDEBAR.EDIT_ACCOUNT)" />

        <Settings :visible="isSidebarOpen(SIDEBAR.SETTINGS)" />
        <TagsList :visible="isSidebarOpen(SIDEBAR.TAGS_LIST)" />
        <TagsTree :visible="isSidebarOpen(SIDEBAR.TAGS_TREE)" />

        <AccountList />

        <a
            id="menu-toggle"
            class="floating-button floating-button--menu"
            @click="toggleSidebar(SIDEBAR.MENU)">
            <i class="fa fa-solid fa-bars-staggered"></i>
        </a>

        <a
            id="menu-toggle"
            class="floating-button floating-button--add d-none"
            :class="isSidebarOpen(SIDEBAR.MENU) ? '' : 'd-lg-block d-xl-block'"
            @click="openSidebar(SIDEBAR.ADD_ACCOUNT)">
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
            },
            sidebarPanel: {
                type: String,
                default: ''
            }
        },
        mounted() {
            if(this.isAnySidebarOpen && this.sidebarName) {
                this.openSidebar(this.sidebarName);

                if (this.sidebarPanel) {
                    this.setActiveSidebarPanel(this.sidebarPanel);
                }
            }
        },
        computed: {
            ...mapState(useUserStore, ['user', 'isLoggedIn']),
            ...mapState(useUiStore, [
                'currentEditingAccount',
                'isLeftSidebarOpened',
                'isRightSidebarOpened',
                'isSidebarOpen',
                'SIDEBAR'
            ]),

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
                'toggleSidebar',
                'openSidebar',
                'openSidebar',
                'setActiveSidebarPanel'
            ])
        }
    }
</script>

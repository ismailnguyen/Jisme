<template>
    <div :class="sidebarAdjustmentClasses" v-if="user">
        <Menu :visible="isSidebarOpen(SIDEBAR.MENU)" />
 
        <AddAccountModal :visible="isSidebarOpen(SIDEBAR.ADD_ACCOUNT)" />

        <EditAccountModal 
            :account="currentEditingAccount"
            :visible="isSidebarOpen(SIDEBAR.EDIT_ACCOUNT)" />

        <Settings :visible="isSidebarOpen(SIDEBAR.SETTINGS)" />
        <SettingsProfile :visible="isSidebarOpen(SIDEBAR.SETTINGS_PROFILE)" />
        <SettingsSecurity :visible="isSidebarOpen(SIDEBAR.SETTINGS_SECURITY)" />
        <SettingsRecentActivities :visible="isSidebarOpen(SIDEBAR.SETTINGS_RECENT_ACTIVITIES)" />
        <TagsList :visible="isSidebarOpen(SIDEBAR.TAGS_LIST)" />
        <TagsTree :visible="isSidebarOpen(SIDEBAR.TAGS_TREE)" />

        <AccountList
            @menuOpened="onMenuOpened"
         />
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
    import SettingsProfile from '../components/settings/Profile.vue'
    import SettingsSecurity from '../components/settings/Security.vue'
    import SettingsRecentActivities from '../components/settings/RecentActivities.vue'
    import TagsList from '../components/TagsList.vue'
    import TagsTree from '../components/TagsTree.vue'

    export default {
        components: {
            Menu,
            AddAccountModal,
            EditAccountModal,
            AccountList,
            Settings,
            SettingsProfile,
            SettingsSecurity,
            SettingsRecentActivities,
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
        },
        async mounted() {
            if(this.isAnySidebarOpen && this.sidebarName) {
                this.openSidebar(this.sidebarName);
            }

            const lastUserUpdate = await this.getLastUpdatedTime();
            console.log('Last user update:', lastUserUpdate, new Date());
        },
        computed: {
            ...mapState(useUserStore, ['user', 'isLoggedIn']),
            ...mapState(useUiStore, [
                'currentEditingAccount',
                'isRightSidebarOpened',
                'isSidebarOpen',
                'SIDEBAR'
            ]),

            sidebarAdjustmentClasses: function () {
                let cssClass = '';

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
            ]),

            ...mapActions(useUserStore, [
                'getLastUpdatedTime'
            ]),

            onMenuOpened: function() {
                this.toggleSidebar(this.SIDEBAR.MENU);
            }
        }
    }
</script>

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

        <AccountList />

        <a
            id="menu-toggle"
            class="floating-button floating-button--menu"
            :class="isSidebarOpen(SIDEBAR.MENU) ? 'd-none' : ''"
            @click="toggleSidebar(SIDEBAR.MENU)">
            <i class="fa fa-solid fa-bars-staggered"></i>
        </a>

        <a
            id="add-account-toggle"
            class="floating-button floating-button--add d-none d-lg-block d-xl-block"
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

            document.addEventListener('scroll', this.hideFloatingButtonsonScroll)
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

            hideFloatingButtonsonScroll: function(event) {
                const scrollingElement = event.target.scrollingElement;
                var lastScrollTop = 0;

                var st = scrollingElement.scrollTop;

                var isScrollDown = st > lastScrollTop;

                const floatingButtons = document.querySelectorAll('.floating-button');
                floatingButtons.forEach(button => {
                    button.style.top = isScrollDown ? '-80rem' : '20px';
                });

                lastScrollTop = st;
            }
        }
    }
</script>

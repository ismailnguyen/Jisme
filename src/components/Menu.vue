<template>
    <div class="tray-wrapper" :class="visible ? 'tray-wrapper-open' : ''" @keydown.esc="closeTray()">
        <div class="tray-overlay" @click="closeTray()"></div>
        <div class="tray" role="dialog" aria-modal="true" aria-label="Menu">
            <div class="tray-header">
                <button
                    v-if="currentPanel != 'menu'"
                    type="button"
                    class="button--navigation"
                    aria-label="Back"
                    @click="goToPreviousPanel()">
                    <i class="fa-solid fa-chevron-left" aria-hidden="true"></i>
                </button>
                <h2 v-if="currentPanel != 'menu'" class="tray-title">{{ panelTitle }}</h2>
                <div v-else class="tray-account">
                    <span class="tray-avatar" aria-hidden="true">
                        <img v-if="user && user.avatarUrl && !isAvatarBroken" :src="user.avatarUrl" alt="" @error="isAvatarBroken = true">
                        <span v-else>{{ userInitial }}</span>
                    </span>
                    <span class="tray-account-text">
                        <small>Signed in as</small>
                        <b :title="user && user.email">{{ user && user.email }}</b>
                    </span>
                </div>
                <button type="button" class="button--navigation" aria-label="Close menu" @click="closeTray()">
                    <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                </button>
            </div>

            <div class="tray-body">
                <router-view name="menu" />
                <MainMenuPanel
                    v-if="currentPanel == 'menu'"
                    @panelChanged="onPanelChanged" />

                <TagsListMenuPanel
                    v-if="currentPanel == 'tags-list'"
                    @panelChanged="onPanelChanged" />

               <SettingsMenuPanel
                    v-if="currentPanel == 'settings'"
                    @panelChanged="onPanelChanged" />

                <SettingsProfileMenuPanel
                    v-if="currentPanel == 'settings-profile'"
                    @panelChanged="onPanelChanged" />

                <SettingsSecurityMenuPanel
                    v-if="currentPanel == 'settings-security'"
                    @panelChanged="onPanelChanged" />

                <SettingsActivitiesMenuPanel
                    v-if="currentPanel == 'settings-activities'"
                    @panelChanged="onPanelChanged" />

                <SettingsAboutMenuPanel
                    v-if="currentPanel == 'settings-about'"
                    @panelChanged="onPanelChanged" />
            </div>
        </div>
    </div>
</template>

<script>
    import '../assets/tray.css'

    import MainMenuPanel from './menu/MainMenuPanel.vue'
    import SettingsMenuPanel from './menu/SettingsMenuPanel.vue'
    import SettingsProfileMenuPanel from './menu/SettingsProfileMenuPanel.vue'
    import SettingsSecurityMenuPanel from './menu/SettingsSecurityMenuPanel.vue'
    import SettingsActivitiesMenuPanel from './menu/SettingsActivitiesMenuPanel.vue'
    import TagsListMenuPanel from './menu/TagsListMenuPanel.vue'
    import SettingsAboutMenuPanel from './menu/SettingsAboutMenuPanel.vue'

    import {
        mapState,
        mapActions
    } from 'pinia'
    import {
        useUiStore,
        useUserStore
    } from '@/store'

    export default {
        props: {
            visible: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                currentPanel: 'menu',
                isAvatarBroken: false,
            }
        },
        components: {
            MainMenuPanel,
            SettingsMenuPanel,
            SettingsProfileMenuPanel,
            SettingsSecurityMenuPanel,
            SettingsActivitiesMenuPanel,
            TagsListMenuPanel,
            SettingsAboutMenuPanel
        },
        computed: {
            ...mapState(useUserStore, [
                'user'
            ]),

            ...mapState(useUiStore, [
                'SIDEBAR'
            ]),

            panelTitle: function () {
                return {
                    'tags-list': 'Tags',
                    'settings': 'Settings',
                    'settings-profile': 'Profile',
                    'settings-security': 'Security',
                    'settings-activities': 'Recent activities',
                    'settings-about': 'About',
                }[this.currentPanel] || '';
            },

            userInitial: function () {
                const email = this.user && this.user.email || '';
                return (email.trim()[0] || '?').toUpperCase();
            }
        },
        methods: {
            ...mapActions(useUiStore, [
                'openSidebar',
                'closeSidebar',
            ]),

            goToPreviousPanel: function () {
                if (['settings', 'tags-list'].includes(this.currentPanel)) {
                    this.currentPanel = 'menu';
                    return;
                }

                if (['settings-profile', 'settings-security', 'settings-activities', 'settings-about'].includes(this.currentPanel)) {
                    this.currentPanel = 'settings';
                    return;
                }
            },

            closeTray: function () {
                this.closeSidebar(this.SIDEBAR.MENU);

                // Re init the current panel
                this.currentPanel = 'menu';
            },

            onPanelChanged: function (newPanelName) {
                this.currentPanel = newPanelName;
            },
        }
    }
</script>

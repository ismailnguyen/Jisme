<template>
    <div class="tray-wrapper" :class="visible ? 'tray-wrapper-open' : ''">
        <div class="tray-overlay" @click="closeTray()"></div>
        <div class="tray">
            <div class="tray-header">
                <div class="row">
                    <div class="mb-3 col-xs-4 col-sm-4 col-4 col-md-4 col-lg-4" v-if="currentPanel == 'menu'">
                        <img
                            :src="user && user.avatarUrl"
                            loading="lazy"
                            :alt="user.email"
                            :title="user.email"
                            class="tray-icon" />
                    </div>

                    <div class="mb-3 col-xs-4 col-sm-4 col-4 col-md-4 col-lg-4" v-else>
                        <button type="button" class="button--navigation" @click="goToPreviousPanel()">
                            <i class="fa fa-solid fa-chevron-left"></i>
                        </button>
                    </div>

                    <div class="mb-3" :class="user && user.avatarUrl ? 'col-xs-4 col-sm-4 col-4 col-md-4 col-lg-4' : 'col-xs-8 col-sm-8 col-8 col-md-8 col-lg-8'">
                    </div>
                    
                    <div class="mb-3 col-xs-4 col-sm-4 col-4 col-md-4 col-lg-4 justify-content-end" v-if="user && user.avatarUrl">
                        <button type="button" class="button--navigation" @click="closeTray()">
                            <i class="fa fa-solid fa-close"></i>
                        </button>
                    </div>
                </div>
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
            }
        },
        components: {
            MainMenuPanel,
            SettingsMenuPanel,
            SettingsProfileMenuPanel,
            SettingsSecurityMenuPanel,
            SettingsActivitiesMenuPanel,
            TagsListMenuPanel
        },
        computed: {
            ...mapState(useUserStore, [
                'user'
            ]),

            ...mapState(useUiStore, [
                'SIDEBAR'
            ])
        },
        methods: {
            ...mapActions(useUiStore, [
                'openSidebar',
                'closeSidebar',
            ]),

            goToPreviousPanel: function () {
                if (this.currentPanel == 'settings') {
                    this.currentPanel = 'menu';
                    return;
                }

                if (['settings-profile', 'settings-security', 'settings-activities'].includes(this.currentPanel)) {
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

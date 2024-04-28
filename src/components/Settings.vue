<template>
    <div class="sidebar-wrapper right-sidebar-wrapper" :class="visible ? 'sidebar-wrapper-open' : ''">
        <div class="sidebar right-sidebar">
            <div class="sidebar-header">
                <div class="row">
                    <div class="mb-3 col-xs-3 col-sm-3 col-3 col-md-3 col-lg-3">
                        <img
                            class="rounded-circle mb-3 sidebar-icon"
                            :src="user && user.avatarUrl ? user.avatarUrl : '../assets/logo_medium.png'"
                            alt="" width="72" height="72"
                            loading="lazy"
                            v-show="!isLoading">
                    </div>

                    <div class="mb-3 col-xs-6 col-sm-6 col-6 col-md-6 col-lg-6">
                        <h2 class="sidebar-title">Settings</h2>
                    </div>

                    <div class="mb-3 col-xs-3 col-sm-3 col-3 col-md-3 col-lg-3 justify-content-end">
                        <button type="button" class="button--close" @click="closeSidebar(SIDEBAR.SETTINGS)">
                            <i class="fa fa-solid fa-close"></i>
                        </button>
                    </div>
                </div>
            </div>

            <div class="sidebar-body">
                <Loader v-show="isLoading" />

                <div class="list-group">
                    <div class="list-group-item" v-if="!activeSidebarPanel || activeSidebarPanel == 'profile'">
                        <div class="row align-items-center">
                            <div class="col-auto" v-if="activeSidebarPanel">
                                <button class="btn btn-light" @click="resetActiveSidebarPanel()">
                                    <i class="fa fa-chevron-left"></i>
                                </button>
                            </div>
                            <div class="col">
                                <strong class="mb-2">Profile</strong>
                                <!-- <p class="text-muted mb-0"></p> -->
                            </div>
                            <div class="col-auto" v-if="!activeSidebarPanel">
                                <button class="btn btn-light" @click="setActiveSidebarPanel('profile')">
                                    <i class="fa fa-chevron-right"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="list-group-item" v-if="activeSidebarPanel == 'profile'">
                        <Profile />
                    </div>

                    <div class="list-group-item" v-if="!activeSidebarPanel || activeSidebarPanel == 'security'">
                        <div class="row align-items-center">
                            <div class="col-auto" v-if="activeSidebarPanel">
                                <button class="btn btn-light" @click="resetActiveSidebarPanel()">
                                    <i class="fa fa-chevron-left"></i>
                                </button>
                            </div>
                            <div class="col">
                                <strong class="mb-2">Security Settings</strong>
                                <span class="badge badge-pill badge-success">Enabled</span>
                                <p class="text-muted mb-0">These settings are helps you keep your account secure.</p>
                            </div>
                            <div class="col-auto" v-if="!activeSidebarPanel">
                                <button class="btn btn-light" @click="setActiveSidebarPanel('security')">
                                    <i class="fa fa-chevron-right"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="list-group-item" v-if="activeSidebarPanel == 'security'">
                        <Security />
                    </div>

                    <div class="list-group-item" v-if="!activeSidebarPanel || activeSidebarPanel == 'recent-activities'">
                        <div class="row align-items-center">
                            <div class="col-auto" v-if="activeSidebarPanel">
                                <button class="btn btn-light" @click="resetActiveSidebarPanel()">
                                    <i class="fa fa-chevron-left"></i>
                                </button>
                            </div>
                            <div class="col">
                                <strong class="mb-2">Recent Activities</strong>
                                <p class="text-muted mb-0">Last activities with your account.</p>
                            </div>
                            <div class="col-auto" v-if="!activeSidebarPanel">
                                <button class="btn btn-light" @click="setActiveSidebarPanel('recent-activities')">
                                    <i class="fa fa-chevron-right"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="list-group-item" v-if="activeSidebarPanel == 'recent-activities'">
                        <RecentActivities />
                    </div>
                </div>
            </div>

            <div class="row sidebar-footer">
                <div class="col-xs-6 col-sm-6 col-6 col-md-6 col-lg-6">
                    <button type="button" class="btn btn-outline-danger" @click="onSignOut()">
                        <i class="fa fa-power-off"></i>
                            Logout
                    </button>
                </div>
                <div class="col-xs-6 col-sm-6 col-6 col-md-6 col-lg-6">
                    <button type="button" class="btn" :class="isLoading ? 'btn-dark' : 'btn-primary'" @click="onSave()">
                        <i class="fa fa-save"></i>
                        Save
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import '../assets/right_sidebar.css'

    import {
        mapState,
        mapActions
    } from 'pinia'
    import {
        useUiStore,
        useAlertStore,
        useUserStore,
        useAccountsStore
    } from '@/store'
    import Loader from './Loader.vue'
    import Profile from './settings/Profile.vue'
    import Security from './settings/Security.vue'
    import RecentActivities from './settings/RecentActivities.vue'

    export default {
        props: {
            visible: {
                type: Boolean,
                default: false
            }
        },
        components: {
            Loader,
            Profile,
            Security,
            RecentActivities
        },
        data() {
            return {
                totpToken: '',
                autoLoginEnabled: false,
                isLoading: false,
                isGeneratePasskeyBtnVisible: false
            }
        },
        async created() {
            try {
                await this.getAccountInformation();
            } catch (error) {
                this.openAlert('Error!', error, 'danger');
            }
        },
        async mounted() {
            this.isPasskeyCreationSupported(this.onPasskeySupported, this.onPasskeyUnsupported);

            this.autoLoginEnabled = await this.isAutoLoginEnabled;
        },
        computed: {
            ...mapState(useUserStore, [
                'user',
                'isAutoLoginEnabled',
                'isPasskeyCreationSupported'
            ]),
            ...mapState(useAccountsStore, ['accounts']),
            ...mapState(useUiStore, [
                'activeSidebarPanel',
                'SIDEBAR'
            ])
        },
        methods: {
            ...mapActions(useUserStore, [
                'getAccountInformation',
                'signOut',
                'generatePasskey',
                'removePasskey',
                'update',
                'setAutoLogin'
            ]),

            ...mapActions(useAlertStore, [
                'openAlert'
            ]),

            ...mapActions(useUiStore, [
                'closeSidebar',
                'setActiveSidebarPanel',
                'resetActiveSidebarPanel'
            ]),

            ...mapActions(useAccountsStore, [
                'enableServerEncryption'
            ]),

            onSignOut: async function () {
                await this.signOut();
            },

            onPasskeySupported: function () {
                // Display button
                this.isGeneratePasskeyBtnVisible = true;
            },

            onPasskeyUnsupported: function () {
                this.isGeneratePasskeyBtnVisible = false;
            },

            capitalizeFirstLetter (word) {
                return word.charAt(0).toUpperCase() + word.slice(1);
            },

            toDaysAgo: function (dateString) {
                const date = new Date(dateString);
                const now = new Date();
                const diff = now - date;
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));

                if (days === 0) {
                    return 'Today';
                }

                if (days === 1) {
                    return 'Yesterday';
                }

                return days + ' days ago';
            },

            onGeneratePasskey: async function () {
                const deviceName = prompt('Enter a device name', 'Device #1');
                if (deviceName) {
                    try {
                        await this.generatePasskey(deviceName);
                        
                        this.openAlert('Passkey added!', 'Save to confirm.');
                    }
                    catch(error) {
                        this.openAlert('Error!', error, 'danger');
                    }
                }
            },

            onRemovePasskey: function (passkeyToDelete) {
                //need to stringify and parse because Vuejs gives an observer instead of the object
                passkeyToDelete = JSON.parse(JSON.stringify(passkeyToDelete));
                if(confirm("Do you want to delete passkey for " + passkeyToDelete.deviceName + "?")) {
                    this.removePasskey(passkeyToDelete);
                    this.openAlert('Passkey deleted!', 'Save to confirm.');
                }
            },

            onSave: async function () {
                this.isLoading = true;

                try {
                    await this.setAutoLogin(this.autoLoginEnabled);
                    await this.update();

                    this.isLoading = false;
                    this.openAlert('Saved!', '', 'success');
                }
                catch(error) {
                    this.isLoading = false;
                }
            }
        }
    }
</script>

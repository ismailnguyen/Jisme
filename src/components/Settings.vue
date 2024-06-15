<template>
<div class="tray-wrapper" :class="visible ? 'tray-wrapper-open' : ''">
        <div class="tray-overlay" @click="closeSidebar(SIDEBAR.SETTINGS)"></div>
        <div class="tray">
            <div class="tray-header">
                <div class="row">
                    <div class="mb-3 col-xs-4 col-sm-4 col-4 col-md-4 col-lg-4">
                        <img
                            :src="user && user.avatarUrl"
                            loading="lazy"
                            :alt="user.email"
                            :title="user.email"
                            class="sidebar-icon" />
                    </div>

                    <div class="mb-3" :class="user && user.avatarUrl ? 'col-xs-4 col-sm-4 col-4 col-md-4 col-lg-4' : 'col-xs-8 col-sm-8 col-8 col-md-8 col-lg-8'">
                    </div>
                    
                    <div class="mb-3 col-xs-4 col-sm-4 col-4 col-md-4 col-lg-4 justify-content-end" v-if="user && user.avatarUrl">
                        <button type="button" class="button--navigation" @click="closeSidebar(SIDEBAR.SETTINGS)">
                            <i class="fa fa-solid fa-close"></i>
                        </button>
                    </div>
                </div>
            </div>

            <div class="tray-body">
                <div class="row">
                    <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
                        <button class="btn btn-light w-100" type="button" @click="openSidebar(SIDEBAR.SETTINGS_PROFILE)">
                            <i class="fa fa-user"></i>
                            Profile
                        </button>
                    </div>

                    <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
                        <button class="btn btn-light" type="button" @click="openSidebar(SIDEBAR.SETTINGS_SECURITY)">
                            <i class="fa fa-bullseye"></i>
                            Security Settings
                        </button>
                    </div>

                    <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
                        <button class="btn btn-light" type="button" @click="openSidebar(SIDEBAR.SETTINGS_RECENT_ACTIVITIES)">
                            <i class="fa fa-share-alt"></i>
                            Recent Activities
                        </button>
                    </div>

                    <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
                        <button type="button" class="btn btn-red" @click="onAddAccount()">
                            <i class="fa fa-power-off"></i>
                            Logout
                        </button>
                    </div>
               </div>
            </div>
        </div>
    </div>
    <!-- <div class="sidebar-wrapper right-sidebar-wrapper" :class="visible ? 'sidebar-wrapper-open' : ''">
        <div class="sidebar right-sidebar">
            <div class="sidebar-header">
                <div class="row">
                    <div class="mb-3 col-xs-3 col-sm-3 col-3 col-md-3 col-lg-3">
                        <img
                            class="rounded-circle mb-3 sidebar-icon"
                            :src="user && user.avatarUrl ? user.avatarUrl : '../assets/logo_medium.png'"
                            alt="" width="72" height="72"
                            loading="lazy">
                    </div>

                    <div class="mb-3 col-xs-6 col-sm-6 col-6 col-md-6 col-lg-6">
                        <h2 class="sidebar-title">Settings</h2>
                    </div>

                    <div class="mb-3 col-xs-3 col-sm-3 col-3 col-md-3 col-lg-3 justify-content-end">
                        <button type="button" class="button--navigation" @click="closeSidebar(SIDEBAR.SETTINGS)">
                            <i class="fa fa-solid fa-close"></i>
                        </button>
                    </div>
                </div>
            </div>

            <div class="sidebar-body">
                <div class="card">
                    <div class="content mt-0 mb-0">
                        <div class="list-group list-custom-large short-border check-visited">
                            <a @click="openSidebar(SIDEBAR.SETTINGS_PROFILE)">
                                <i class="fa fa-user bg-green-dark rounded-s"></i>
                                <span>Profile</span>
                                <i class="fa fa-chevron-right"></i>
                            </a>

                            <a  @click="openSidebar(SIDEBAR.SETTINGS_SECURITY)">
                                <i class="fa fa-bullseye bg-orange-dark rounded-s"></i>
                                <span>Security Settings</span>
                                <strong>These settings are helps you keep your account secure.</strong>
                                <i class="fa fa-chevron-right"></i>
                            </a>
                            <a @click="openSidebar(SIDEBAR.SETTINGS_RECENT_ACTIVITIES)">
                                <i class="fa fa-share-alt bg-blue-dark rounded-s"></i>
                                <span>Recent Activities</span>
                                <strong>Last activities with your account.</strong>
                                <i class="fa fa-chevron-right"></i>
                            </a>
                        </div>
                    </div>
                </div>
                <div class="card">
                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12 clickable" @click="openSidebar(SIDEBAR.SETTINGS_PROFILE)">
                            <label
                                class="form-label"
                                for="editAccount_input_card_cryptogram">
                                <i class="fa fa-user" aria-hidden="true"></i> Profile
                                <i class="fa fa-chevron-right float-end" aria-hidden="true"></i>
                            </label>
                        </div>

                        <hr class="my-4">

                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12 clickable" @click="openSidebar(SIDEBAR.SETTINGS_SECURITY)">
                            <label
                                class="form-label"
                                for="editAccount_input_card_cryptogram">
                                <i class="fa fa-lock" aria-hidden="true"></i> Security Settings
                                <i class="fa fa-chevron-right float-end" aria-hidden="true"></i>

                                <p class="text-muted mb-0">These settings are helps you keep your account secure.</p>
                            </label>
                        </div>

                        <hr class="my-4">

                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12 clickable" @click="openSidebar(SIDEBAR.SETTINGS_RECENT_ACTIVITIES)">
                            <label
                                class="form-label"
                                for="editAccount_input_card_cryptogram">
                                <i class="fa fa-list" aria-hidden="true"></i> Recent Activities
                                <i class="fa fa-chevron-right float-end" aria-hidden="true"></i>

                                <p class="text-muted mb-0">Last activities with your account.</p>
                            </label>
                        </div>

                        <hr class="my-4">
                    </div> 
            </div>

            <div class="row sidebar-footer">
                <div class="col-xs-12 col-sm-12 col-12 col-md-12 col-lg-12">
                    <button type="button" class="btn btn-link-danger" @click="onSignOut()">
                        <i class="fa fa-power-off"></i>
                            Logout
                    </button>
                </div>
            </div>
        </div>
    </div> -->
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
    } from '@/store'

    export default {
        props: {
            visible: {
                type: Boolean,
                default: false
            }
        },
        async created() {
            try {
                await this.getAccountInformation();
            } catch (error) {
                this.openAlert('Error!', error, 'danger');
            }
        },
        computed: {
            ...mapState(useUserStore, [
                'user',
            ]),
            ...mapState(useUiStore, [
                'SIDEBAR'
            ])
        },
        methods: {
            ...mapActions(useUserStore, [
                'getAccountInformation',
                'signOut',
            ]),

            ...mapActions(useAlertStore, [
                'openAlert'
            ]),

            ...mapActions(useUiStore, [
                'openSidebar',
                'closeSidebar',
            ]),

            onSignOut: async function () {
                await this.signOut();
            },
        }
    }
</script>

<style scoped>
    .list-custom-large a {
        line-height: 70px;
        color: #1f1f1f;
        font-weight: 500;
        font-size: 13px;
        border-bottom: solid 1px rgba(0, 0, 0, .05);
    }
    .short-border {
        margin-left: 45px;
    }
    .list-custom-large a i:first-child {
        width: 32px;
        height: 32px;
        line-height: 32px;
        margin-top: 21px;
        text-align: center;
        float: left;
        margin-right: 15px;
        background-color: var(--color-text);
        border-radius: 2rem;
        color: var(--color-text-inverted);
    }
    .short-border i:first-child {
        margin-left: -45px;
        margin-top: 23px;
    }
    .list-custom-large a span:not(.badge) {
        font-size: 14px;
        position: absolute;
        margin-top: -6px;
    }

    .list-custom-large a strong {
        font-size: 7px;
        position: absolute;
        font-size: 11px;
        margin-top: 10px;
        color: var(--color-text);;
        font-weight: 500;
    }
    .list-custom-large a i:last-child {
        float: right;
        font-size: 10px;
    }
    .list-custom-large i {
        line-height: 74px;
    }
    .list-group {
        display: flex;
        flex-direction: column;
        padding-left: 0;
        margin-bottom: 0;
        border-radius: .25rem;
    }
</style>
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
                            loading="lazy">
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

            <div class="row sidebar-footer">
                <div class="col-xs-12 col-sm-12 col-12 col-md-12 col-lg-12">
                    <button type="button" class="btn btn-outline-danger" @click="onSignOut()">
                        <i class="fa fa-power-off"></i>
                            Logout
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
        }
    }
</script>

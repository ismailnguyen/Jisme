<template>
    <div class="sidebar-wrapper right-sidebar-wrapper" :class="visible ? 'sidebar-wrapper-open' : ''">
        <div class="sidebar right-sidebar">
            <div class="sidebar-header">
                <div class="row">
                    <div class="mb-3 col-xs-3 col-sm-3 col-3 col-md-3 col-lg-3">
                        <img
                            class="rounded-circle mb-3 sidebar-icon"
                            :src="user && user.avatarUrl ? user.avatarUrl : '../../assets/logo_medium.png'"
                            alt="" width="72" height="72"
                            loading="lazy"
                            v-show="!isLoading">
                    </div>

                    <div class="mb-3 col-xs-6 col-sm-6 col-6 col-md-6 col-lg-6">
                        <h2 class="sidebar-title">Security</h2>
                    </div>

                    <div class="mb-3 col-xs-3 col-sm-3 col-3 col-md-3 col-lg-3 justify-content-end">
                        <button type="button" class="button--close" @click="closeSidebar(SIDEBAR.SETTINGS_SECURITY)">
                            <i class="fa fa-solid fa-close"></i>
                        </button>
                    </div>
                </div>
            </div>

            <div class="sidebar-body">
                <Loader v-show="isLoading" />

                <div class="row align-items-center">
                    <div class="col">
                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
                            <h5 class="font-size-16 me-3 mb-0">
                                <i class="fa fa-right-to-bracket" aria-hidden="true"></i> Auto login
                            </h5>

                            <div class="form-check form-switch">
                                <label class="form-check-label" for="autoLoginCheckbox">{{ isAutoLoginEnabled ? 'Enabled' : 'Disabled' }}</label>
                                <input class="form-check-input float-end" type="checkbox" role="switch" id="autoLoginCheckbox" v-model="isAutoLoginEnabled">
                            </div>
                            <small class="form-text text-muted">Applies only to this device.</small>

                        </div>

                        <hr class="my-4">


                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
                            <label class="form-label" for="inputTotpSecret">
                                <h5 class="font-size-16 me-3 mb-0">
                                    <i class="fa fa-qrcode" aria-hidden="true"></i> TOTP Secret
                                </h5>
                            </label>
                            <input id="inputTotpSecret" class="form-control" type="text" placeholder="Loading" laceholder="MFA TOTP secret" v-model="user.totp_secret" disabled />
                        </div>

                        <hr class="my-4">


                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12 input-group-list">
                            <label class="form-label" for="passwordlesslogin_btn">
                                <h5 class="font-size-16 me-3 mb-0">
                                    <i class="fa fa-fingerprint" aria-hidden="true"></i> Passkeys
                                </h5>
                            </label>

                            <div class="input-group"
                                v-for="passkey in user.passkeys"
                                :key="passkey.passkey.id">
                                <input :id="'passkey_' + passkey.passkey.id" name="passkey_device" class="form-control" type="text" placeholder="Loading" v-model="passkey.deviceName" disabled />
                                <button class="btn btn-outline-secondary hover-danger" type="button" @click="onRemovePasskey(passkey)"><i class="fa fa-trash"></i> Remove</button>
                            </div>
                            <button id="passwordlesslogin_btn" class="btn btn-danger btn-block" @click.prevent="onGeneratePasskey()" v-if="isGeneratePasskeyBtnVisible">
                                <i class="fa fa-plus"></i> Add a passkey
                            </button>

                            <button id="passwordlesslogin_unsupported_btn" class="btn btn-danger btn-block" v-if="!isGeneratePasskeyBtnVisible" disabled>
                                <i class="fa fa-ban"></i> Passkey not supported in this device
                            </button>
                        </div>

                        <hr class="my-4">

                        <!-- 
                            <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
                                <button type="button" class="btn btn-outline-light" @click="enableServerEncryption()">
                                    <i class="fa fa-power-off"></i>
                                        Enable encryption of {{ accounts.length }} accounts
                                </button>
                            </div>

                            <hr class="my-4">

                        -->
                    </div>
                </div>
            </div>

            <div class="row sidebar-footer">
                <div class="col-xs-12 col-sm-12 col-12 col-md-12 col-lg-12">
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
    import Loader from '../Loader.vue'

    export default {
        props: {
            visible: {
                type: Boolean,
                default: false
            }
        },
        components: {
            Loader,
        },
        data() {
            return {
                isLoading: false,
                totpToken: '',
                isAutoLoginEnabled: false,
                isGeneratePasskeyBtnVisible: false
            }
        },
        async mounted() {
            this.isPasskeyCreationSupported(this.onPasskeySupported, this.onPasskeyUnsupported);

            this.isAutoLoginEnabled = await this.storeIsAutoLoginEnabled;
        },
        computed: {
            ...mapState(useUserStore, {
                user: 'user',
                storeIsAutoLoginEnabled: 'isAutoLoginEnabled'
            }),
            ...mapState(useAccountsStore, ['accounts']),
            ...mapState(useUiStore, [
                'SIDEBAR'
            ])
        },
        methods: {
            ...mapActions(useUserStore, [
                'update',
                'generatePasskey',
                'removePasskey',
                'setAutoLogin',
                'isPasskeyCreationSupported'
            ]),

            ...mapActions(useAlertStore, [
                'openAlert'
            ]),

            ...mapActions(useUiStore, [
                'closeSidebar',
            ]),

            ...mapActions(useAccountsStore, [
                'enableServerEncryption'
            ]),

            onPasskeySupported: function () {
                // Display button
                this.isGeneratePasskeyBtnVisible = true;
            },

            onPasskeyUnsupported: function () {
                this.isGeneratePasskeyBtnVisible = false;
            },

            onGeneratePasskey: async function () {
                const deviceName = prompt('Enter a device name', 'Device #1');
                if (deviceName) {
                    try {
                        await this.generatePasskey(deviceName);
                        
                        this.openAlert('Passkey added!', 'Save to confirm.');
                    }
                    catch(error) {
                        console.log(error);
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
                    await this.setAutoLogin(this.isAutoLoginEnabled);
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


<style scoped>
    .form-switch {
        /* Remove left padding of text of switch box */
        padding-left: 0;
    }
</style>
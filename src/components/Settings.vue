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
                        <button type="button" class="button--close" @click="closeSettings()">
                            <i class="fa fa-solid fa-close"></i>
                        </button>
                    </div>
                </div>
            </div>

            <div class="sidebar-body">
                <Loader v-show="isLoading" />

                <form class="card-text lead">
                    <div class="row">
                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
                            <label class="form-label" for="inputEmail"><i class="fa fa-id-badge" aria-hidden="true"></i> Username</label>
                            <input id="inputEmail" class="form-control" placeholder="Email address, phone number" type="email" v-model="user.email" disabled />
                        </div>

                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
                            <label class="form-label" for="inputAvatar"><i class="fa fa-circle-user" aria-hidden="true"></i> Avatar</label>
                            <input id="inputAvatar" class="form-control" type="text" laceholder="Avatar image URL" v-model="user.avatarUrl" />
                        </div>

                        <hr class="my-4">

                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
                            <label class="form-label" for="inputTotpSecret"><i class="fa fa-user-secret" aria-hidden="true"></i> TOTP Secret</label>
                            <input id="inputTotpSecret" class="form-control" type="text" placeholder="Loading" laceholder="MFA TOTP secret" v-model="user.totp_secret" disabled />
                        </div>

                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
                            <label class="form-label" for="inputEncryptionKey"><i class="fa fa-key" aria-hidden="true"></i> Public encryption key</label>
                            <input id="inputEncryptionKey" class="form-control" type="text" laceholder="Encryption key" v-model="user.public_encryption_key" disabled />
                        </div>

                         <!-- <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
                            <button type="button" class="btn btn-outline-light" @click="enableServerEncryption()">
                                <i class="fa fa-power-off"></i>
                                    Enable encryption of {{ accounts.length }} accounts
                            </button>
                        </div> -->

                        <hr class="my-4">

                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12 input-group-list">
                            <label class="form-label" for="passwordlesslogin_btn"><i class="fa fa-fingerprint" aria-hidden="true"></i> Password-less login</label>
                            <div class="input-group"
                                v-for="passkey in user.passkeys"
                                :key="passkey.passkey.id">
                                <input class="form-control" type="text" aria-describedby="addAccount_passwordHelp" placeholder="Loading" v-model="passkey.deviceName" disabled />
                                <button class="btn btn-outline-secondary hover-danger" type="button" @click="onRemovePasskey(passkey)"><i class="fa fa-trash"></i> Remove</button>
                            </div>
                            <button class="btn btn-danger btn-block" @click.prevent="onGeneratePasskey()" v-if="isGeneratePasskeyBtnVisible">
                                <i class="fa fa-plus"></i> Add a passkey
                            </button>
                        </div>

                        <hr class="my-4" v-if="user.passkeys">
                    </div>
                </form>
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

    export default {
        props: {
            visible: {
                type: Boolean,
                default: false
            }
        },
        components: {
            Loader
        },
        data() {
            return {
                totpToken: '',
                error: {
                    message: ''
                },
                remember: false,
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
        mounted() {
            // Availability of `window.PublicKeyCredential` means WebAuthn is usable.  
            // `isUserVerifyingPlatformAuthenticatorAvailable` means the feature detection is usable.  
            // `​​isConditionalMediationAvailable` means the feature detection is usable.  
            if (window.PublicKeyCredential &&  
                PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable &&  
                PublicKeyCredential.isConditionalMediationAvailable) {  
                // Check if user verifying platform authenticator is available.  
                Promise.all([  
                    PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable(),  
                    PublicKeyCredential.isConditionalMediationAvailable(),  
                ]).then(results => {  
                    if (results.every(r => r === true)) {  
                        this.isGeneratePasskeyBtnVisible = true;
                    }  
                });  
            }  
        },
        computed: {
            ...mapState(useUserStore, ['user']),
            ...mapState(useAccountsStore, ['accounts'])
        },
        methods: {
            ...mapActions(useUserStore, [
                'getAccountInformation',
                'signOut',
                'requestPasswordlessLogin',
                'generatePasskey',
                'removePasskey',
                'update'
            ]),

            ...mapActions(useAlertStore, [
                'openAlert'
            ]),

            ...mapActions(useUiStore, [
                'closeSettings'
            ]),

            ...mapActions(useAccountsStore, ['enableServerEncryption']),

            onSignOut: async function () {
                await this.signOut();

                this.$router.go('/');
            },

            onGeneratePasskey: async function () {
                const deviceName = prompt('Enter a device name', 'Device #1');
                if (deviceName) {
                    try {
                        // First request challenge to the server
                        await this.requestPasswordlessLogin();

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
                    await this.update();

                    this.isLoading = false;
                    this.openAlert('Saved!', '', 'success');
                }
                catch(error) {
                    this.isLoading = false;
                    this.error = error;
                }
            }
        }
    }
</script>

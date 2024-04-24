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
                            <input id="inputEmail" class="form-control" placeholder="Username, email address, phone number" type="email" v-model="user.email" disabled />
                        </div>

                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
                            <label class="form-label" for="inputAvatar"><i class="fa fa-circle-user" aria-hidden="true"></i> Avatar</label>
                            <input id="inputAvatar" class="form-control" type="text" laceholder="Avatar image URL" v-model="user.avatarUrl" />
                        </div>

                        <hr class="my-4">

                        <h2>Security</h2>

                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
                            <span class="form-label">Auto login</span>

                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" role="switch" id="autoLoginCheckbox" v-model="autoLoginEnabled">
                                <label class="form-check-label" for="autoLoginCheckbox">{{ autoLoginEnabled ? 'Enabled' : 'Disabled' }}</label>
                            </div>
                        </div>

                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
                            <label class="form-label" for="inputTotpSecret"><i class="fa fa-qrcode" aria-hidden="true"></i> TOTP Secret</label>
                            <input id="inputTotpSecret" class="form-control" type="text" placeholder="Loading" laceholder="MFA TOTP secret" v-model="user.totp_secret" disabled />
                        </div>

                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12 input-group-list">
                            <label class="form-label" for="passwordlesslogin_btn">
                                <i class="fa fa-fingerprint" aria-hidden="true"></i> Password-less login
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

                        <hr class="my-4" v-show="user.passkeys">

                        <div class="table-responsive mb-3 col-xs-12 col-md-12 col-lg-12" v-show="user.activities">
                            <h2>Recent activities</h2>

                            <div class="list-group">
                                <a
                                    href="#"
                                    class="list-group-item list-group-item-action"
                                    aria-current="true"
                                    v-for="(activity, i) in user.activities" :key="i"
                                    @click="activity.isExpanded = !activity.isExpanded">
                                    
                                    <div class="d-flex w-100 justify-content-between">
                                        <h5 class="mb-1">{{ capitalizeFirstLetter(activity.action) }}</h5>
                                        <span class="badge text-bg-primary rounded-pill">{{ toDaysAgo(activity.activity_date) }}</span>
                                    </div>
                                    <small v-show="activity.isExpanded">
                                        <b>User agent:</b> {{ activity.agent }}<br>
                                        <b>Referer:</b> {{ activity.referer }}<br>
                                        <b>IP:</b> {{ activity.ip }}<br>
                                        <b>Date:</b> {{ new Date(activity.activity_date) }}
                                    </small>
                                </a>
                            </div>
                        </div>

                        <hr class="my-4" v-show="user.activities">
                        

                        <!-- <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
                            <button type="button" class="btn btn-outline-light" @click="enableServerEncryption()">
                                <i class="fa fa-power-off"></i>
                                    Enable encryption of {{ accounts.length }} accounts
                            </button>
                        </div> -->
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
                autoLoginEnabled: false,
                error: {
                    message: ''
                },
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
            ...mapState(useAccountsStore, ['accounts'])
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
                'closeSettings'
            ]),

            ...mapActions(useAccountsStore, [
                'enableServerEncryption'
            ]),

            onSignOut: async function () {
                await this.signOut();

                this.$router.go('/');
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
                    await this.setAutoLogin(this.autoLoginEnabled);
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

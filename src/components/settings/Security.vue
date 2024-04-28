<template>
    <div class="row align-items-center">
        <div class="col">
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

            <!-- 
                <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
                    <button type="button" class="btn btn-outline-light" @click="enableServerEncryption()">
                        <i class="fa fa-power-off"></i>
                            Enable encryption of {{ accounts.length }} accounts
                    </button>
                </div>
            -->
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

    export default {
        data() {
            return {
                totpToken: '',
                autoLoginEnabled: false,
                isGeneratePasskeyBtnVisible: false
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
        },
        methods: {
            ...mapActions(useUserStore, [
                'generatePasskey',
                'removePasskey',
                'setAutoLogin'
            ]),

            ...mapActions(useAlertStore, [
                'openAlert'
            ]),

            ...mapActions(useUiStore, [
                'closeSidebar',
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
        }
    }
</script>

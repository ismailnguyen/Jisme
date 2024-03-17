<template>
    <div id="settings-sidebar-wrapper">
        <div class="settings-sidebar">
            <div class="sidebar-header">
                <div class="row">
                    <div class="form-group col-xs-3 col-sm-3 col-3 col-md-3 col-lg-3">
                        <img
                            class="rounded-circle mb-3 sidebar-icon"
                            :src="user && user.avatarUrl ? user.avatarUrl : 'images/touch/favicon64.png'"
                            alt="" width="72" height="72"
                            loading="lazy"
                            v-show="!isLoading">
                    </div>

                    <div class="form-group col-xs-6 col-sm-6 col-6 col-md-6 col-lg-6">
                        <h2 class="sidebar-title">Settings</h2>
                    </div>

                    <div class="form-group col-xs-3 col-sm-3 col-3 col-md-3 col-lg-3 justify-content-end">
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
                        <div class="form-group col-xs-12 col-md-12 col-lg-12">
                            <label for="inputEmail">Username</label>
                            <input id="inputEmail" class="form-control" placeholder="Email address, phone number" type="email" v-model="user.email" disabled />
                        </div>

                        <div class="form-group col-xs-12 col-md-12 col-lg-12">
                            <label for="inputAvatar">Avatar</label>
                            <input id="inputAvatar" class="form-control" type="text" laceholder="Avatar image URL" v-model="user.avatarUrl" />
                        </div>

                        <div class="form-group col-xs-12 col-md-12 col-lg-12">
                            <label for="inputTotpSecret">TOTP Secret</label>
                            <input id="inputTotpSecret" class="form-control" type="text" laceholder="MFA TOTP secret" v-model="user.totp_secret" disabled />
                        </div>

                        <div class="form-group col-xs-12 col-md-12 col-lg-12">
                            <label for="inputEncryptionKey">Public encryption key</label>
                            <input id="inputEncryptionKey" class="form-control" type="text" laceholder="Encryption key" v-model="user.public_encryption_key" disabled />
                        </div>

                        <div class="form-group col-xs-12 col-md-12 col-lg-12" v-if="user.passkeys">
                            <label for="passwordlesslogin_btn">Password-less login</label>
                            <button
                                class="btn btn-md btn-outline-danger btn-block"
                                v-for="passkey in user.passkeys"
                                :key="passkey.passkey.id"
                                @click.prevent="removePasskey(passkey)">
                                <i class="fa fa-trash"></i>
                                {{ passkey.deviceName }}
                            </button>
                        </div>

                        <div class="form-group col-xs-12 col-md-12 col-lg-12">
                            <label for="generatePasskey_btn">Passkey</label>
                            <button class="btn btn-lg btn-danger btn-block" @click.prevent="generatePasskey()" v-if="isGeneratePasskeyBtnVisible">
                                Generate a passkey
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <div class="row sidebar-footer">
                <div class="col-xs-6 col-sm-6 col-6 col-md-6 col-lg-6">
                    <button type="button" class="btn btn-outline-danger" @click="signOut()">
                        <i class="fa fa-power-off"></i>
                            Logout
                    </button>
                </div>
                <div class="col-xs-6 col-sm-6 col-6 col-md-6 col-lg-6">
                    <button type="button" class="btn" :class="isLoading ? 'btn-dark' : 'btn-primary'" @click="save()">
                        Save
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { onBeforeMount } from 'vue'
    import { storeToRefs } from 'pinia'
    import {
        useUiStore,
        useAlertStore,
        useUserStore
    } from '@/store'
    import Alert from '../models/Alert'
    import Loader from './Loader.vue'

    export default {
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
        setup() {
            const userStore = useUserStore()
            const { user } = storeToRefs(userStore)
            const { getAccountInformation } = userStore

            const { closeSettings } = useUiStore()

            const { openAlert } = useAlertStore()

            onBeforeMount(async () => {
                try {
                    await getAccountInformation()
                } catch (error) {
                    console.error(error)    
                }
            })

            return {
                user,
                userStore,

                closeSettings,

                openAlert
            }
        },
        components: {
            Loader
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
        methods: {
            signOut: async function () {
                await this.userStore.signOut();

                this.$router.go('/');
            },

            closeSettings: function () {
                this.closeSettings();
            },

            generatePasskey: async function () {
                const deviceName = prompt('Enter a device name', 'Device #1');
                if (deviceName) {
                    try {
                        await this.userStore.generatePasskey(deviceName);
                        
                        this.openAlert(new Alert('Passkey added!', 'Save to confirm.'));

                    }
                    catch(error) {
                        console.log(error);
                        this.openAlert(new Alert('Error!', error, 'danger'));
                    }
                }
            },

            removePasskey: function (passkeyToDelete) {
                //need to stringify and parse because Vuejs gives an observer instead of the object
                passkeyToDelete = JSON.parse(JSON.stringify(passkeyToDelete));
                if(confirm("Do you want to delete passkey for " + passkeyToDelete.deviceName + "?")) {
                    this.userStore.removePasskey(passkeyToDelete);
                    this.openAlert(new Alert('Passkey deleted!', 'Save to confirm.'));
                }
            },

            save: async function ()
            {
                this.isLoading = true;

                try {
                    await this.userStore.update();
                    this.isLoading = false;
                    this.openAlert(new Alert('Saved!', '', 'success'));
                }
                catch(error) {
                    this.isLoading = false;
                    this.error = error;
                }
            }
        }
    }
</script>

<style scoped>
    #settings-sidebar-wrapper {
        position: absolute;
        width: 0;
        right: 0;
        height: 100%;
        overflow-y: hidden;
        transition: all .5s;
        display: flex;
        align-items: center;
        z-index: 9999;
    }

    .settings-sidebar {
        transition: all .5s;
        overflow-y: auto;
        height: 100%;
        padding: 1rem;
        border-bottom: 1px solid #e9ecef;
        border-top-left-radius: 0.3rem;
        border-top-right-radius: 0.3rem;
        backdrop-filter: blur(18px) contrast(60%);
    }

    .button--close {
        cursor: pointer;
        width: 48px;
        height: 48px;
        border-radius: 15px;
        text-align: center;
        background-color: #fff;
        background: #fff;
        border: none;
        transition: all .3s;
        font-size: 2em;
    }

    .button--close i {
        color: #162056;
    }

    .sidebar-header .justify-content-end {
        display: flex;
    }

   .sidebar-header .close {
        font-size: 2.5rem;
    }

	@media (prefers-color-scheme: dark) {
		.sidebar-header .close {
			color: #e4e6eb;
		}
	}

    .settings-sidebar {
      border: none;
      background: #ffffff;
    }
	
	@media (prefers-color-scheme: dark) {
		.settings-sidebar {
			color: #e4e6eb;
			background: #242526;
		}
	}
	
	@media only screen and (min-width: 500px) {
        .settings-sidebar {
			background: #fff;
            border-top-left-radius: 15px;
            border-top-right-radius: 0;
            border-bottom-left-radius: 15px;
            border-bottom-right-radius: 0;
            box-shadow: 0 0 2rem rgba(0,0,255,.1);
        }
		
		@media (prefers-color-scheme: dark) {
			.settings-sidebar {
				background: #242526db;
			}
		}
    }

    .form-control {
        color: #343a40;
    }

    .form-control::placeholder {
        color: #ced4da70;
    }

    .text-muted, a {
      color: #99c9ff !important;
    }

    .sidebar-footer {
        padding: 1rem;
        position: fixed;
        bottom: 1rem;
        display: flex;
        width: 100%;
    }

    .sidebar-footer .btn {
        width:100%;
    }
	
    .btn-group .btn-check {
        display: none;
    }

    .btn-group label.btn:first-of-type{
        border-top-left-radius: 15px;
        border-bottom-left-radius: 15px;
    }

    .btn-group label.btn:last-of-type{
        border-top-right-radius: 15px;
        border-bottom-right-radius: 15px;
    }

    .btn-group label.btn {
        background: none;
        color: #2870ea;
        border-color: #2870ea;
    }

    .btn-group label.btn.active {
        background: linear-gradient(81.62deg,#2870ea 8.72%,#1b4aef 85.01%);
        color: #fff;
    }

    @media (prefers-color-scheme: dark) {
		.btn-group label.btn {
            color: #fff;
        }

        .btn-group label.btn.active {
            color: #fff;
        }
	}

    .sidebar.hasIcon .sidebar-title {
        margin-left: 2rem;
        transition: all .5s;
    }

    .sidebar-image-wrapper {
        position: absolute;
        top: -14px;
        left: -14px;
        border-radius: 15px;
        background: #f9f9f9;
        padding: 2px;
    }

    .sidebar-icon {
        border-radius: 15px;
        height: 48px;
        width: 48px;
    }
</style>
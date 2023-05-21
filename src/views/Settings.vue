<template>
    <div class="text-center">
        <a id="menu-toggle" class="floating-button floating-button--menu" @click="goBack()">
            <span class="close-svg-container">
                <svg width="21" height="21" class="as-svgicon as-svgicon-close as-svgicon-tiny as-svgicon-closetiny" role="img" aria-hidden="true">
                    <path fill="none" d="M0 0h21v21H0z"></path>
                    <path d="M12.12 10l4.07-4.06a1.5 1.5 0 10-2.11-2.12L10 7.88 5.94 3.81a1.5 1.5 0 10-2.12 2.12L7.88 10l-4.07 4.06a1.5 1.5 0 000 2.12 1.51 1.51 0 002.13 0L10 12.12l4.06 4.07a1.45 1.45 0 001.06.44 1.5 1.5 0 001.06-2.56z"></path>
                    </svg>
            </span>
        </a>
        
        <form class="form-signin">
            <img class="rounded-circle mb-3" :src="user && user.avatarUrl ? user.avatarUrl : 'images/touch/favicon64.png'" alt="" width="72" height="72" v-show="!isLoading">
            <p class="text-muted">{{ user.email }}</p>
            <Loader v-show="isLoading" />
            <h1 class="h3 mb-3 font-weight-normal">Settings</h1>

            <p class="text-danger">{{error.message}}</p>

            <input type="email" id="inputEmail" class="form-control" placeholder="Email address, phone number" v-model="user.email" disabled>

            <input type="text" id="inputAvatar" class="form-control" placeholder="Avatar image URL" v-model="user.avatarUrl">

            <input type="text" id="inputTotpSecret" class="form-control" placeholder="MFA TOTP secret" v-model="user.totp_secret" disabled>

            <br><br>
            <hr>
            <h1 class="h4 mb-4 font-weight-normal">Password-less login</h1>

             <button
                class="btn btn-md btn-outline-danger btn-block"
                v-for="passkey in user.passkeys"
                :key="passkey.passkey.id"
                @click.prevent="removePasskey(passkey)">
                <i class="fa fa-trash"></i>
                {{ passkey.deviceName }}
            </button>
           
            <button class="btn btn-lg btn-danger btn-block" @click.prevent="generatePasskey()" v-if="isGeneratePasskeyBtnVisible">
                Generate a passkey
            </button>
            <hr>
            
            <br><br><br>
            <span class="btn btn-lg btn-block" :class="isLoading ? 'btn-secondary' : 'btn-primary'" @click="save()">Save</span>

            <p class="mt-5 mb-3 text-danger">
                <a class="menu-actions-logout" @click="signOut()">
                    <i class="fa fa-power-off"></i>
                    Logout
                </a>
            </p>
        </form>
    </div>
</template>

<script>
    import { getUser } from '../utils/auth'
    import Alert from '../models/Alert'
    import UserService from '../services/UserService'
    import Loader from '../components/Loader.vue'
    import {
        create,
        parseCreationOptionsFromJSON,
    } from '@github/webauthn-json/browser-ponyfill';


    export default {
        data() {
            return {
                user: getUser(),
                totpToken: '',
                error: {
                    message: ''
                },
                remember: false,
                isLoading: false,
                isGeneratePasskeyBtnVisible: false
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
            signOut: function () {
                let userService = new UserService();

                userService.logout(() => {
                    this.$router.go('/');
                });
            },

            goBack: function () {
                this.$router.push({name: 'AccountList'});
                location.reload(); //quick fix because view doesn't want to load correctly
            },

            generatePasskey: function () {
                const deviceName = prompt('Enter a device name', 'Device #1');
                if (deviceName) {
                    create(
                        parseCreationOptionsFromJSON({
                            publicKey: {
                                challenge: this.user.uuid,
                                rp: {  
                                    name: "Jisme"
                                },  
                                user: {  
                                    id: this.user.uuid,
                                    name: this.user.email,  
                                    displayName: this.user.email,  
                                }, 
                                pubKeyCredParams: [],
                                excludeCredentials: [],
                                authenticatorSelection: {
                                    userVerification: "preferred",
                                    //requireResidentKey: true
                                },
                                extensions: {
                                    credProps: true,
                                }
                            }
                        })
                    )
                    .then((passkey) =>
                    {
                        this.registerPasskey(deviceName, passkey);
                    })
                    .catch(error => 
                    {
                        console.log(error);
                        this.$emit('showAlert', new Alert('Error!', error, 'danger'));
                    });
                }
            },

            removePasskey: function (passkeyToDelete) {
                //need to stringify and parse because Vuejs gives an observer instead of the object
                passkeyToDelete = JSON.parse(JSON.stringify(passkeyToDelete));
                if(confirm("Do you want to delete passkey for " + passkeyToDelete.deviceName + "?")) {
                    this.user.passkeys = this.user.passkeys.filter(passkey => passkey.passkey.id !== passkeyToDelete.passkey.id);
                    this.$emit('showAlert', new Alert('Passkey deleted!', 'Save to confirm.'));
                }
            },

            registerPasskey: function (deviceName, passkey)
            {
                this.user.passkeys = this.user.passkeys || [];
                this.user.passkeys.push({
                    deviceName: deviceName,
                    passkey: passkey
                });
                this.$emit('showAlert', new Alert('Passkey added!', 'Save to confirm.'));
            },

            save: function ()
            {
                this.isLoading = true;

                let userService = new UserService();

                userService.update(this.user)
                .then(response => {
                    this.isLoading = false;
                    this.$emit('showAlert', new Alert('Saved!', '', 'success'));
                })
                .catch(error => 
                {
                    this.isLoading = false;
                    this.error = error;
                });
            }
        }
    }
</script>

<style>
    html, body {
        height: 100%;
    }

    body {
        color: #162056;
        -ms-flex-align: center;
        align-items: center;
        padding-top: 40px;
        padding-bottom: 40px;
    }

    .form-control {
        color: #162056;
        border: none;
        border-radius: 15px;
        background-color: #ced4da70;
    }

    .form-control::placeholder {
      color: #162056;
      opacity: 1;
    }

    .form-signin {
        max-width: 90%;
        padding: 15px;
        margin: auto;
        color: #162056;
        background: #f8f9fa;
        border: none;
        border-radius: 15px;
    }

    @media (min-width: 767.98px) { 
        .form-signin {
            max-width: 50%;
        }
    }
    
    .form-signin .checkbox {
        font-weight: 400;
    }

    .form-signin .form-control {
        opacity: 0.9;
        position: relative;
        box-sizing: border-box;
        height: auto;
        padding: 10px;
        font-size: 16px;
    }
    
    .form-signin .form-control:focus {
        z-index: 2;
    }

    .form-signin input {
        border-radius: 0;
    }

    .form-signin input:first-of-type {
        margin-bottom: -1px;
        border-top-right-radius: 15px;
        border-top-left-radius: 15px;
    }

    .form-signin input:last-of-type {
        margin-bottom: 10px;
        border-bottom-left-radius: 15px;
        border-bottom-right-radius: 15px;
    }

    .form-signin .btn-outline-primary {
        color: #162056;
        border-color: #162056;
    }

    .form-signin .btn-outline-primary:hover {
        color: #f8f9fa;
        background-color: #162056;
    }

    .form-signin input[type="tel"] {
        margin-bottom: 10px;
    }

    .form-signin .btn-primary {
        color: #f8f9fa;
        background-color: #162056;
        border-color: #162056;
    }

    .menu-actions-logout {
        cursor: pointer;
    }
</style>
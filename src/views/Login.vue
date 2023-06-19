<template>
    <div class="text-center">
        <form class="form-signin" @submit.prevent>
            <img class="mb-4" src="images/touch/favicon64.png" alt="" width="72" height="72" v-show="!isLoading">
            <Loader v-show="isLoading" />

            <h1 class="h3 mb-3 font-weight-normal">Sign in</h1>

            <p class="text-danger">{{error.message}}</p>

            <label v-if="!isEmailFilled" for="inputEmail" class="sr-only">Email address, phone number</label>
            <input v-if="!isEmailFilled"
                type="text"
                id="inputEmail"
                name="username"
                autocomplete="username webauthn"
                class="form-control"
                placeholder="Email address, phone number"
                aria-describedby="emailHelp"
                v-model="email"
                @keyup.enter="submitEmail()"
                autofocus
                required>

            <label v-if="isEmailFilled" for="inputPassword" class="sr-only">Password</label>
            <input v-if="isEmailFilled" type="password" id="inputPassword" class="form-control" placeholder="Password" v-model="password" @keyup.enter="handleLogin()" required>

            <div v-if="!isEmailFilled" class="checkbox mb-3">
                <label>
                    <input type="checkbox" value="remember-me" v-model="remember"> Remember me
                </label>
            </div>

            <span class="btn btn-lg btn-block" :class="isLoading ? 'btn-outline-secondary' : 'btn-outline-primary'" @click="submitEmail()" v-if="!isEmailFilled">Next</span>
            <span class="btn btn-lg btn-block" :class="isLoading ? 'btn-outline-secondary' : 'btn-outline-primary'" @click="handleLogin()" v-if="isEmailFilled">Sign in</span>

            <span class="btn btn-lg btn-block" :class="isLoading ? 'btn-secondary' : 'btn-primary'" @click="handlePasswordlessLogin()" v-if="isPasswordlessLoginBtnVisible && !isEmailFilled">
                <i class="fa fa-lock"></i>
                One button sign-in
            </span>


            <p class="mt-5 mb-3 text-muted">Don't have account? <router-link to="/register">Sign up</router-link></p>
        </form>
    </div>
</template>

<script>
    import { getLastRememberedUsername } from '../utils/auth'
    import UserService from '../services/UserService'
    import Loader from '../components/Loader.vue'
    import {
        get,
        parseRequestOptionsFromJSON
    } from '@github/webauthn-json/browser-ponyfill'

    export default {
        data() {
            return {
                email: '',
                password: '',
                error: {
                    message: ''
                },
                isEmailFilled: false,
                remember: false,
                isLoading: false,
                isPasswordlessLoginBtnVisible: false
            }
        },
        components: {
            Loader
        },
        mounted() {
            const lastRememberedUsername = getLastRememberedUsername();
            if (lastRememberedUsername) {
                this.email = lastRememberedUsername;
            }

            // Availability of `window.PublicKeyCredential` means WebAuthn is usable.  
            if (window.PublicKeyCredential &&  
                PublicKeyCredential.isConditionalMediationAvailable) {  
                // Check if conditional mediation is available.  
                PublicKeyCredential.isConditionalMediationAvailable().then(isCMA => {
                    if (isCMA) {  
                        // Call WebAuthn authentication  
                        this.isPasswordlessLoginBtnVisible = true;
                    }  
                })
            }
        },
        methods: {
            submitEmail: function () {
                if (!this.isEmailFilled) {
                    this.isEmailFilled = true;
                }
            },

            handleLogin: function ()
            {
                if (!this.isEmailFilled) {
                    return;
                }

                this.isLoading = true;

                let userService = new UserService();

                userService.login({
                    email: this.email,
                    password: this.password,
                    remember: this.remember
                }, (isMFARequired) => {
                    if (isMFARequired) {
                        this.$router.push({name: 'VerifyMFA'});
                    }
                    else {
                        this.$router.push('/');
                        location.reload();
                    }
                })
                .catch(error => 
                {
                    this.isLoading = false;
                    this.error = error;
                });
            },

            handlePasswordlessLogin: function () {
                this.isLoading = true;

                get(
                    parseRequestOptionsFromJSON({
                        publicKey: {
                            challenge: '44e2059b66260ba010601c26d5cbd6e80f3d1232bdba2dc4d3e5c87cd1c87f8e',
                            allowCredentials: [],
                            userVerification: "preferred",
                        }
                    })
                ).then(passkey => {
                    let userService = new UserService();

                    userService.loginPasswordless(passkey)
                    .then(() => {
                        this.$router.push('/');
                        location.reload();
                    })
                    .catch(error => 
                    {
                        this.isLoading = false;
                        this.error = error;
                    });
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
        background-color: #f8f9fa;
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
        width: 100%;
        max-width: 330px;
        padding: 15px;
        margin: auto;
        color: #162056;
        background: #f8f9fa;
        border: none;
        border-radius: 15px;
        box-shadow: 0 10px 20px 0 rgba(208,214,222,.5);
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
        margin-bottom: 10px;
    }

    .form-signin .btn-outline-primary {
        color: #162056;
        border-color: #162056 !important;
    }

    .form-signin .btn-primary {
        color: #f8f9fa;
        background-color: #162056;
        border-color: #162056;
    }

    .form-signin .btn-outline-primary:hover,
    .form-signin .btn-outline-primary:active {
        color: #f8f9fa !important;
        background-color: #162056 !important;
    }
</style>
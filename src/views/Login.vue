<template>
    <div class="container col-xl-10 col-xxl-8 px-4 py-5">
        <div class="row align-items-center g-lg-5 py-5">
            <LoginHero :isLoading="isLoading" />

            <div class="col-xs-12 col-md-10 mx-auto col-lg-5">
                <form class="p-4 p-md-5 rounded-3 form-signin" v-show="!isUsernameFilled" @submit.prevent="submitUsername()">
                    <div class="d-block d-lg-none">
                        <img class="img-fluid rounded mb-4" loading="lazy" src="../assets/logo_medium.png" alt="Jisme" v-show="!isLoading">
                        <Loader v-show="isLoading" />
                    </div>

                    <h1 class="h3 mb-3 font-weight-normal">Log in to your account</h1>

                    <span class="w-100 btn btn-lg" :class="isLoading ? 'btn-secondary' : 'btn-primary'" @click="handlePasswordlessLogin()" v-if="isPasswordlessLoginBtnVisible" tabindex="4">
                        <i class="fa fa-user-lock" aria-hidden="true"></i>
                        Passkey
                    </span>

                    <div class="separator">
                        <small>Or with email and password</small>
                    </div>

                    <div class="form-floating mb-3">
                            <input
                                type="text"
                                id="inputUsername"
                                name="username"
                                autocomplete="username webauthn"
                                class="form-control"
                                placeholder="Email address, or phone number"
                                aria-describedby="emailHelp"
                                v-model="username"
                                @keyup.enter="submitUsername"
                                autofocus
                                tabindex="1"
                                required>
                        <label for="inputUsername">Email Address</label>
                    </div>
                    
                    <button
                        type="submit"
                        class="btn btn-lg"
                        :class="isLoading ? 'btn-outline-secondary' : 'btn-outline-primary'"
                        @keyup.enter="submitUsername"
                        @click="submitUsername"
                        :disabled="!username"
                        tabindex="3">
                        <i class="fa fa-right-to-bracket" aria-hidden="true"></i>
                        Next
                    </button>

                    <hr class="my-4">

                    <p class="mt-5 mb-3 text-muted" tabindex="5">Don't have an account? <router-link to="/register">Sign up</router-link></p>
                </form>

                <form class="p-4 p-md-5 rounded-3 form-signin" v-show="isUsernameFilled" @submit.prevent="handleLogin()">
                    <div class="d-block d-md-none">
                        <img class="img-fluid rounded mb-4" loading="lazy" src="../assets/logo_medium.png" alt="Jisme" v-show="!isLoading">
                        <Loader v-show="isLoading" />
                    </div>

                    <h1 class="h3 mb-3 font-weight-normal">Sign in</h1>

                    <div class="form-floating mb-3">
                        <input
                            type="text"
                            id="readonlyInputUsername"
                            name="username"
                            autocomplete="username"
                            class="form-control-plaintext"
                            v-model="username"
                            tabindex="1"
                            readonly>
                        <label for="readonlyInputUsername">Email address</label>
                    </div>

                    <div class="mb-3">
                         <label for="inputPassword" class="sr-only">Password</label>
                        <input type="password" ref="inputPassword" id="inputPassword" class="form-control" placeholder="Password" v-model="password" tabindex="6" autocomplete="current-password" required>
                    </div>
                    
                    <button 
                        type="submit"
                        class="btn btn-lg"
                        :class="isLoading ? 'btn-outline-secondary' : 'btn-outline-primary'"
                        :disabled="!password"
                        @keyup.enter="handleLogin"
                        tabindex="7">
                        <i class="fa fa-right-to-bracket" aria-hidden="true"></i>
                        Sign in
                    </button>

                    <hr class="my-4">

                    <p class="mt-5 mb-3 text-muted" tabindex="5">
                        <a @click="isUsernameFilled=false">
                            <i class="fa-solid fa-arrow-left"></i>
                            Go back
                        </a>
                    </p>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
    import '../assets/auth.css'

    import { 
        mapWritableState,
        mapActions
    } from 'pinia'
    import {
        useAlertStore,
        useUserStore
    } from '@/store'
    import Loader from '../components/Loader.vue'
    import LoginHero from '../components/LoginHero.vue'

    export default {
        data() {
            return {
                username: '',
                password: '',
                isUsernameFilled: false,
                isLoading: false,
                isPasswordlessLoginBtnVisible: false
            }
        },
        components: {
            Loader,
            LoginHero
        },
        computed: {
            ...mapWritableState(useUserStore, [
                'user',
                'isLoggedIn',
                'lastRememberedUsername'
            ]),
        },
        async mounted() {
            this.username = await this.lastRememberedUsername;

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
        updated() {
            if (this.isUsernameFilled) {
                this.$refs.inputPassword.focus();
            }
        },
        methods: {
            ...mapActions(useAlertStore, [
                'openAlert'
            ]),

            ...mapActions(useUserStore, [
                'requestPasswordlessLogin',
                'loginPasswordless',
                'login'
            ]),

            submitUsername: function () {
                if (!this.username) {
                    this.openAlert('Error', 'Please fill username!', 'danger');

                    return;
                }

                if (!this.isUsernameFilled) {
                    this.isUsernameFilled = true;
                }
            },

            handleLogin: async function () {
                if (!this.isUsernameFilled) {
                    return;
                }

                this.isLoading = true;

                try {
                    const loginResult = await this.login({
                        username: this.username,
                        password: this.password
                    });

                    if (loginResult.isMFARequired) {
                        this.$router.push({name: 'VerifyMFA', query: { token: loginResult.token }});
                    }
                    else {
                        this.$router.push({ name: 'Home' });
                    }
                }
                catch (error) {
                    this.isLoading = false;
                    this.openAlert(error.reason ? error.message : 'Error', error.reason || error.message, 'danger');
                }
            },

            handlePasswordlessLogin: async function () {
                this.isLoading = true;

                try {
                    // First request challenge to the server
                    await this.requestPasswordlessLogin();
                    // Then sign the challenge to be allowed to login without password
                    await this.loginPasswordless();
                }
                catch (error) {
                    this.isLoading = false;
                    this.openAlert(error.reason ? error.message : 'Error', error.reason || error.message, 'danger');
                }
            }
        }
    }
</script>

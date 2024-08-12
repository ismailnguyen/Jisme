<template>
    <div class="container py-5">
        <div class="row align-items-center g-lg-5 py-5">
            <LoginHero :isLoading="isLoading" />

            <div class="col-xs-12 col-md-5 col-lg-5">
                <form class="p-4 p-md-5 form-signin" @submit.prevent="onRequestLogin()">
                    <h1 class="h3 mb-3 font-weight-normal">Sign in</h1>

                    <LoginReadonlyEmailInput
                        v-if="rememberedUser"
                        :user="rememberedUser"
                        @usernameChanged="onChangeUsername" />

                    <div class="form-floating mt-5 mb-3" v-else>
                        <input
                            type="text"
                            id="inputUsername"
                            name="username"
                            autocomplete="username webauthn"
                            class="form-control"
                            :class="hasError ? 'shake' : ''"
                            placeholder="Username, email, or phone number"
                            aria-describedby="emailHelp"
                            v-model="username"
                            @keyup.enter="onRequestLogin"
                            autofocus
                            tabindex="1"
                            required>
                        <label for="inputUsername">Username</label>
                    </div>

                    <div class="form-check mb-3">
                        <input class="form-check-input" type="checkbox" id="rememberMeCheckbox" v-model="remember" tabindex="2" @change="focusOtpInput">
                        <label class="form-check-label" for="rememberMeCheckbox">
                            Remember me
                        </label>
                    </div>
                    
                    <button
                        type="button"
                        class="btn btn-lg"
                        :class="isLoading ? 'btn-outline-secondary' : 'btn-primary'"
                        @click="onRequestLogin()"
                        :disabled="!username"
                        tabindex="2">
                        {{ isLoading ? 'Authenticating...' : 'Continue' }}
                    </button>

                    <hr class="my-4 mt-5 mb-3 ">

                    <p class="text-muted" tabindex="3">Don't have an account? <router-link to="/register">Sign up</router-link></p>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
    import '../../assets/auth.css'

    import { 
        mapState,
        mapActions
    } from 'pinia'
    import {
        useAlertStore,
        useUserStore
    } from '@/store'
    import LoginHero from '../../components/LoginHero.vue'
    import LoginReadonlyEmailInput from '../../components/LoginReadonlyEmailInput.vue'

    export default {
        data() {
            return {
                username: '',
                rememberedUser: null,
                remember: false,
                isAutoLogin: false,
                isLoading: false,
                hasError: false
            }
        },
        components: {
            LoginHero,
            LoginReadonlyEmailInput
        },
        computed: {
            ...mapState(useUserStore, [
                'lastRememberedUsername',
                'isAutoLoginEnabled'
            ]),
        },
        async mounted() {
            this.username = await this.lastRememberedUsername;

            // If user was remembered, use the readonly username field to display username
            if (this.username) {
                this.remember = true;

                this.rememberedUser = {
                    email: this.username
                }
            }

            this.isAutoLogin = await this.isAutoLoginEnabled && this.username;
            if (this.isAutoLogin) {
                this.onRequestLogin();
            }
        },
        methods: {
            ...mapActions(useAlertStore, [
                'openAlert'
            ]),

            ...mapActions(useUserStore, [
                'requestLogin',
                'setAutoLogin'
            ]),

            onChangeUsername: async function () {
                // Disable auto login to allow user to change username from login page
                await this.setAutoLogin(false);
                
                this.rememberedUser = null;
            },

            onRequestLogin: async function () {
                if (!this.username) {
                    this.hasError = true;
                    setTimeout(() => {
                        this.hasError = false;
                    }
                    , 500);
                    
                    this.openAlert('Error', 'Please fill username!', 'danger');

                    return;
                }

                this.isLoading = true;

                try {
                    const { next } = await this.requestLogin({
                        username: this.username,
                        extendSession: this.remember
                    });

                    if (next.step === 'verify_passkey') {
                        this.$router.push({ name: 'VerifyPasskey' });
                    }
                    else if (next.step === 'verify_password') {
                        this.$router.push({ name: 'VerifyPassword' });
                    }
                    else if (next.step === 'verify_otp') {
                        this.$router.push({ name: 'VerifyOTP' });
                    }
                    else {
                        this.$router.push({ name: 'Home' });
                    }
                }
                catch (error) {
                    this.isLoading = false;
                    this.openAlert(error.reason ? error.reason : 'Error', error.message || error.reason, 'danger');
                }
            }
        }
    }
</script>

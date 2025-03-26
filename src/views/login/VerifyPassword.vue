<template>
    <div class="container py-5" v-if="user && user.email && this.user.token">
        <div class="row align-items-center g-lg-5 py-5">
            <LoginHero :isLoading="isLoading" />

            <div class="col-xs-12 col-md-5 col-lg-5">
                <form class="p-4 p-md-5 form-signin" @submit.prevent="onVerifyPassword()">
                    <h1 class="h3 mb-3 font-weight-normal">Sign in with password</h1>

                    <LoginReadonlyEmailInput
                        :user="user"
                        @usernameChanged="onChangeUsername" />

                    <div class="input-group mb-3">
                        <input
                            :type="isPasswordRevealed ? 'text' : 'password'"
                            ref="inputPassword"
                            id="inputPassword"
                            class="input form-control"
                            :class="hasError ? 'shake' : ''"
                            placeholder="Password"
                            v-model="password"
                            @keyup.enter="onVerifyPassword"
                            autofocus
                            tabindex="2"
                            autocomplete="current-password"
                            required>

                        <div class="input-group-append">
                            <span class="input-group-text" @click="togglePasswordInput()">
                                <i class="fas" :class="isPasswordRevealed ? 'fa-eye-slash': 'fa-eye'"></i>
                            </span>
                        </div>
                    </div>
                    
                    <button 
                        type="button"
                        class="btn btn-lg"
                        :class="isLoading ? 'btn-outline-secondary' : 'btn-primary'"
                        :disabled="!password"
                        @click="onVerifyPassword"
                        tabindex="3">
                        {{ isLoading ? 'Signing in...' : 'Sign in' }}
                    </button>

                    <hr class="my-4 mt-5 mb-3">

                    <p class="text-muted" tabindex="3">
                        <a class="link" @click="goBack()">
                            <i class="fa fa-arrow-left"></i>
                            Go back
                        </a>
                    </p>
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
                password: '',
                isPasswordRevealed: false,
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
                'user'
            ]),
        },
        mounted () {
            if (!this.user || !this.user.email || !this.user.token) {
                this.$router.push({ name: 'Login' });

                return;
            }
        
            this.$refs.inputPassword.focus();
        },
        methods: {
            ...mapActions(useAlertStore, [
                'openAlert'
            ]),

            ...mapActions(useUserStore, [
                'verifyPassword',
                'setAutoLogin'
            ]),

            goBack: function () {
                this.$router.push({ name: 'Login' });
            },

            togglePasswordInput: function () {
                this.isPasswordRevealed = !this.isPasswordRevealed;
                this.$refs.inputPassword.focus(); // After reveal, unreveal, focus back to input

                // if password was revelead, hide it after 2 seconds
                if (this.isPasswordRevealed) {
                    setTimeout(() => {
                        this.isPasswordRevealed = false;
                    }, 2000);
                }
            },

            onChangeUsername: async function () {
                // Disable auto login to allow user to change username from login page
                await this.setAutoLogin(false);
                
                this.$router.push({ name: 'Login' });
            },

            onVerifyPassword: async function () {
                this.isLoading = true;

                try {
                    const passwordVerification = await this.verifyPassword({
                        password: this.password
                    });

                    if (passwordVerification
                        && passwordVerification.next
                        && passwordVerification.next.step === 'verify_otp') {
                        this.$router.push({ name: 'VerifyOTP' });
                    }
                    else {
                        this.$router.push({ name: 'Home' });
                    }
                }
                catch (error) {
                    this.isLoading = false;
                    this.hasError = true;
                    setTimeout(() => {
                        this.hasError = false;
                    }
                    , 500);

                    this.openAlert(error.reason ? error.reason : 'Error', error.message || error.reason, 'danger');
                }
            }
        }
    }
</script>

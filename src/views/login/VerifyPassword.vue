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
                            aria-label="Password"
                            v-model="password"
                            autofocus
                            autocapitalize="off"
                            autocorrect="off"
                            spellcheck="false"
                            autocomplete="current-password"
                            required>

                        <button
                            type="button"
                            class="btn btn-light input-group-text"
                            :aria-label="isPasswordRevealed ? 'Hide password' : 'Show password'"
                            :aria-pressed="isPasswordRevealed ? 'true' : 'false'"
                            @click="togglePasswordInput()">
                            <i class="fas" :class="isPasswordRevealed ? 'fa-eye-slash': 'fa-eye'" aria-hidden="true"></i>
                        </button>
                    </div>
                    
                    <button
                        type="submit"
                        class="btn btn-lg"
                        :class="isLoading ? 'btn-outline-secondary' : 'btn-primary'"
                        :disabled="!password || isLoading">
                        {{ isLoading ? 'Unlocking…' : 'Unlock' }}
                    </button>

                    <hr class="my-4 mt-5 mb-3">

                    <p class="text-muted">
                        <button type="button" class="btn btn-link link" @click="goBack()">
                            <i class="fa fa-arrow-left" aria-hidden="true"></i>
                            Use a different account
                        </button>
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

                // A revealed password hides itself again after a while
                clearTimeout(this.revealTimer);
                if (this.isPasswordRevealed) {
                    this.revealTimer = setTimeout(() => {
                        this.isPasswordRevealed = false;
                    }, 15000);
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
                        this.$router.replace({ name: 'VerifyOTP' });
                    }
                    else {
                        this.$router.replace({ name: 'Home' });
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

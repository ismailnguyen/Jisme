<template>
    <div class="container py-5" v-if="user && user.email && user.token">
        <div class="row align-items-center g-lg-5 py-5">
            <LoginHero :isLoading="isLoading" />

            <div class="col-xs-12 col-md-5 col-lg-5">
                <form class="p-4 p-md-5 form-signin" @submit.prevent="onVerifyPassword()">
                    <h1 class="h3 mb-3 font-weight-normal">Sign in with password</h1>

                    <LoginReadonlyEmailInput
                        :user="user"
                        @usernameChanged="onChangeUsername" />

                    <!-- Passkey refused (403 re-enrollment): explain, then the password form takes over. -->
                    <div v-if="loginNotice" class="alert alert-warning" role="status">
                        <i class="fa fa-triangle-exclamation me-1" aria-hidden="true"></i>
                        <strong>{{ loginNotice }}</strong>
                        <div class="mt-1">
                            Please sign in with your password this time, then delete and re-add your passkey in
                            <router-link to="/settings/security" class="alert-link">Settings → Security</router-link>.
                        </div>
                    </div>

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

                    <button
                        v-if="canUsePasskeyLogin"
                        type="button"
                        class="w-100 mt-2 btn btn-lg btn-outline-primary"
                        :disabled="isLoading"
                        @click="onUsePasskey()">
                        <i class="fa fa-fingerprint" aria-hidden="true"></i>
                        Sign in with passkey
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
    import { errorText, isPasskeyReenrollmentRequired } from '../../utils/apiError'
    import { isWebAuthnSupported } from '../../utils/webauthn'

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
                'user',
                'loginNotice',
                'canUsePasskeyLogin'
            ]),
        },
        mounted () {
            if (!this.user || !this.user.email || !this.user.token) {
                this.$router.push({ name: 'Login' });

                return;
            }
        
            this.$refs.inputPassword.focus();

            // A verified passkey signs in without typing: start its ceremony right away. Not after a
            // refusal (loginNotice), nor when the passkey screen already tried ("Sign in another way"):
            // the user chose the password.
            if (this.canUsePasskeyLogin && !this.loginNotice && this.user.next?.step !== 'verify_passkey'
                && isWebAuthnSupported()) {
                this.onUsePasskey();
            }
        },
        methods: {
            ...mapActions(useAlertStore, [
                'openAlert'
            ]),

            ...mapActions(useUserStore, [
                'verifyPassword',
                'verifyPasskey',
                'setAutoLogin'
            ]),

            // Passkey ceremony in place: the password form stays as the fallback.
            onUsePasskey: async function () {
                this.isLoading = true;

                try {
                    await this.verifyPasskey();

                    this.$router.replace({ name: 'Home' });
                }
                catch (error) {
                    this.isLoading = false;

                    // 403 re-enrollment: the store set loginNotice, shown above the form.
                    // NotAllowedError: the user cancelled; stay silently on the password form.
                    if (isPasskeyReenrollmentRequired(error) || error?.name === 'NotAllowedError') return;

                    this.openAlert("Couldn't sign in with passkey", errorText(error, 'Please try again or use your password.'), 'danger');
                }
            },

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
                // After a passkey refusal, land where the passkey can be re-added.
                const reenroll = !!this.loginNotice;

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
                        this.$router.replace({ name: reenroll ? 'SettingsSecurity' : 'Home' });
                    }
                }
                catch (error) {
                    this.isLoading = false;
                    this.hasError = true;
                    setTimeout(() => {
                        this.hasError = false;
                    }
                    , 500);

                    this.openAlert("Couldn't sign in", errorText(error, 'Please try again.'), 'danger');
                }
            }
        }
    }
</script>

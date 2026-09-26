<template>
    <div class="container py-5" v-if="user && user.email && this.user.token">
        <div class="row align-items-center g-lg-5 py-5">
            <LoginHero :isLoading="isLoading" />

            <div class="col-xs-12 col-md-5 col-lg-5">
                <form class="p-4 p-md-5 form-signin" @submit.prevent="onVerifyOtp()">
                    <h1 class="h3 mb-3 font-weight-normal">Sign in with OTP</h1>
                    
                    <LoginReadonlyEmailInput
                        :user="user"
                        @usernameChanged="onChangeUsername" />

                    <label for="inputOtp" class="form-label otp-label">Enter the 6-digit code from your authenticator app</label>
                    <div class="otp-field" :class="hasError ? 'shake' : ''">
                        <input
                            id="inputOtp"
                            ref="otpInput"
                            class="otp-input"
                            type="text"
                            inputmode="numeric"
                            autocomplete="one-time-code"
                            pattern="[0-9]*"
                            maxlength="6"
                            required
                            aria-describedby="otpHelp"
                            :aria-invalid="hasError ? 'true' : 'false'"
                            :value="totpToken"
                            @input="onOtpInput"
                            @paste="onOtpPaste">
                        <div class="otp-slots" aria-hidden="true">
                            <span
                                v-for="index in 6"
                                :key="index"
                                class="otp-slot"
                                :class="{ 'is-filled': totpToken.length >= index, 'is-active': totpToken.length === index - 1 }">
                                {{ totpToken[index - 1] || '' }}
                            </span>
                        </div>
                    </div>
                    <p id="otpHelp" class="form-text">It refreshes every 30 seconds. Paste works too.</p>

                    <button
                        type="submit"
                        class="w-100 btn btn-lg"
                        :class="isLoading ? 'btn-secondary' : 'btn-primary'"
                        :disabled="!isOtpFilled || isLoading">
                        {{ isLoading ? 'Verifying…' : 'Verify' }}
                    </button>

                    <hr class="my-4 mt-5 mb-3">

                    <p class="text-muted">Having trouble? <button type="button" class="btn btn-link link" @click="goBack()">Sign in another way</button></p>
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
    import Loader from '../../components/Loader.vue'
    import LoginHero from '../../components/LoginHero.vue'
    import LoginReadonlyEmailInput from '../../components/LoginReadonlyEmailInput.vue'

    export default {
        data() {
            return {
                totpToken: '',
                error: {
                    message: ''
                },
                isLoading: false,
                hasError: false
            }
        },
        components: {
            Loader,
            LoginHero,
            LoginReadonlyEmailInput
        },
        mounted () {
            if (!this.user || !this.user.email || !this.user.token) {
                this.$router.push({ name: 'Login' });

                return;
            }

            // Put focus on first input
            this.focusOtpInput();
        },
        computed: {
            ...mapState(useUserStore, ['user']),

            isOtpFilled: function () {
                return /^\d{6}$/.test(this.totpToken);
            }
        },
        methods: {
            ...mapActions(useAlertStore, [
                'openAlert'
            ]),

            ...mapActions(useUserStore, [
                'verifyMFA',
                'setAutoLogin',
                'setLastRememberedUsername'
            ]),

            goBack: function () {
                // Save the current username so that going on previous page user doesn't need to fill it again
                this.setLastRememberedUsername(this.user.email);
                this.$router.push({ name: 'Login' });
            },

            focusOtpInput: function () {
                this.$refs.otpInput && this.$refs.otpInput.focus();
            },

            onChangeUsername: async function () {
                // Disable auto login to allow user to change username from login page
                await this.setAutoLogin(false);
                
                this.$router.push({ name: 'Login' });
            },

            setOtp: function (value) {
                // Keep digits only, so "123 456" or "123-456" paste cleanly
                this.totpToken = String(value || '').replace(/\D/g, '').slice(0, 6);

                if (this.$refs.otpInput && this.$refs.otpInput.value !== this.totpToken) {
                    this.$refs.otpInput.value = this.totpToken;
                }

                if (this.isOtpFilled && !this.isLoading) {
                    this.onVerifyOtp();
                }
            },

            onOtpInput: function (event) {
                this.setOtp(event.target.value);
            },

            onOtpPaste: function (event) {
                const pasted = event.clipboardData && event.clipboardData.getData('text');

                if (pasted) {
                    event.preventDefault();
                    this.setOtp(pasted);
                }
            },

            onVerifyOtp: async function () {
                this.isLoading = true;

                try {
                    await this.verifyMFA({
                        totpToken: this.totpToken
                    });

                    this.$router.replace({ name: 'Home' });
                }
                catch(error) {
                    this.isLoading = false;
                    this.hasError = true;
                    setTimeout(() => {
                        this.hasError = false;
                    }
                    , 500);

                    this.totpToken = '';
                    this.focusOtpInput();
                    this.openAlert("That code didn't work", error.message || 'Check the code in your authenticator app and try again.', 'danger');
                }
            }
        }
    }
</script>

<style scoped>
    .form-signin input[type="email"] {
        margin-bottom: -1px;
        border-bottom-right-radius: 0;
        border-bottom-left-radius: 0;
    }

    .form-signin input[type="password"] {
        margin-bottom: 10px;
        border-top-left-radius: 0;
        border-top-right-radius: 0;
    }

    .form-signin input[type="tel"] {
        margin-bottom: 10px;
    }

    .otp-field {
        position: relative;
        width: 100%;
        max-width: 22rem;
        margin: 1rem auto 0.5rem;
    }

    /* The real input sits on top, transparent, so native autofill, paste and IME all work */
    .otp-input {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        border: 0;
        font-size: 16px;
        z-index: 1;
    }

    .otp-slots {
        display: grid;
        grid-template-columns: repeat(6, minmax(0, 1fr));
        gap: 0.5rem;
    }

    .otp-slot {
        display: grid;
        place-items: center;
        height: 52px;
        border-radius: 10px;
        border: 1px solid var(--tint);
        background-color: var(--color-background);
        color: var(--color-text);
        font-size: 22px;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
    }

    .otp-input:focus-visible + .otp-slots .otp-slot.is-active {
        outline: 2px solid var(--ink);
        outline-offset: 2px;
    }
</style>
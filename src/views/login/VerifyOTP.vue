<template>
    <div class="container col-xl-10 col-xxl-8 px-4 py-5" v-if="user && user.email && this.user.token">
        <div class="row align-items-center g-lg-5 py-5">
            <LoginHero :isLoading="isLoading" />

            <div class="col-md-10 mx-auto col-lg-5">
                <form class="p-4 p-md-5 rounded-3 form-signin" @submit.prevent="onVerifyOtp()">
                    <img
                        v-show="user && user.avatarUrl"
                        class="rounded-circle mb-3"
                        loading="lazy"
                        :src="user.avatarUrl"
                        :alt="user.email"
                        :title="user.email"
                        width="72" height="72">
                    <img
                        v-show="!user || !user.avatarUrl"
                        class="img-fluid rounded mb-4"
                        loading="lazy"
                        src="../../assets/logo_medium.png"
                        alt="Jisme"
                        title="Jisme">

                    <h1 class="h3 mb-3 font-weight-normal">Sign in with OTP</h1>
                    
                    <LoginReadonlyEmailInput
                        :user="user"
                        @usernameChanged="onChangeUsername" />

                    <label for="inputOtp">Enter the code displayed in the authenticator app on your mobile device​​</label>
                    <div class="otp-input-container">
                        <input
                            v-for="(v, index) in totpToken"
                            :key="index"
                            :ref="'otpInput_' + index"
                            @input="onOtpInput(index)"
                            @keydown="onOtpKeydown(index, $event)"
                            required="required"
                            maxlength="1"
                            step="1"
                            min="0"
                            max="9"
                            autocomplete="no"
                            pattern="\d*"
                            type="text"
                            class="otp-input"
                            v-model="totpToken[index]">
                    </div>

                    <button 
                        type="button"
                        class="w-100 btn btn-lg"
                        :class="isLoading ? 'btn-secondary' : 'btn-primary'"
                        :disabled="!isOtpFilled"
                        @click="onVerifyOtp"
                        tabindex="7">
                        Verify
                        <i class="fa fa-arrow-right"></i>
                    </button>

                    <hr class="my-4">

                    

                    <p class="mt-5 mb-3 text-muted">Having trouble? <a class="link" @click="goBack()">Sign in another way</a></p>
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
                totpToken: ['','','','','',''],
                error: {
                    message: ''
                },
                isLoading: false
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
                return this.totpToken.filter(v => v).length == this.totpToken.length;
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
                this.$refs['otpInput_0'][0].focus();
            },

            onChangeUsername: async function () {
                // Disable auto login to allow user to change username from login page
                await this.setAutoLogin(false);
                
                this.$router.push({ name: 'Login' });
            },

            onOtpInput: function (index) {
                // handling normal input
                if (this.totpToken[index].length == 1 && index+1 < this.totpToken.length) {
                    this.$refs['otpInput_' + (index + 1)][0].focus();
                }

                // if a value is pasted, put each character to each of the next input
                if (this.totpToken[index].length > 1) {
                    // sanitise input
                    if (isNaN(this.totpToken[index])) {
                        this.totpToken[index] = "";
                        return;
                    }

                    // split characters to array
                    const chars = this.totpToken[index].split('');

                    for (let pos = 0; pos < chars.length; pos++) {
                        // if length exceeded the number of inputs, stop
                        if (pos + index >= this.totpToken.length) break;

                        // paste value
                        this.totpToken[pos + index] = chars[pos];
                    }

                    // focus the input next to the last pasted character
                    let focus_index = Math.min(this.totpToken.length - 1, index + chars.length);
                    this.$refs['otpInput_' + focus_index][0].focus();
                }

                // If all inputs are filled, verify
                if (this.isOtpFilled) {
                    this.onVerifyOtp();
                }
            },

            onOtpKeydown: function (index, event) {
                // backspace button
                if (event.keyCode == 8 && this.totpToken[index] == '' && index != 0) {
                    // shift next values towards the left
                    for (let pos = index; pos < this.totpToken.length - 1; pos++) {
                        this.totpToken[pos] = this.totpToken[pos + 1];
                    }

                    // clear previous box and focus on it
                    this.totpToken[index - 1] = '';
                    this.$refs['otpInput_' + (index - 1)][0].focus();
                    
                    return;
                }

                // delete button
                if (event.keyCode == 46 && index != this.totpToken.length - 1) {
                    // shift next values towards the left
                    for (let pos = index; pos < this.totpToken.length - 1; pos++) {
                        this.totpToken[pos] = this.totpToken[pos + 1];
                    }

                    // clear the last box
                    this.totpToken[this.totpToken.length - 1] = '';
                    this.$refs['otpInput_' + index][0].select();
                    event.preventDefault();
                    return;
                }

                // left button
                if (event.keyCode == 37) {
                    if (i > 0) {
                        event.preventDefault();
                        this.$refs['otpInput_' + (index - 1)][0].focus();
                        this.$refs['otpInput_' + (index - 1)][0].select();
                    }
                    return;
                }

                // right button
                if (event.keyCode == 39) {
                    if (i+1 < this.totpToken.length) {
                        event.preventDefault();
                        this.$refs['otpInput_' + (index + 1)][0].focus();
                        this.$refs['otpInput_' + (index + 1)][0].select();
                    }
                    return;
                }
            },

            onVerifyOtp: async function () {
                this.isLoading = true;

                try {
                    await this.verifyMFA({
                        totpToken: this.totpToken.join('')
                    });

                    this.$router.push({ name: 'Home' });
                }
                catch(error) {
                    this.isLoading = false;
                    this.openAlert('Error', error.message, 'danger');
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

    .otp-input-container {
        width: 100%;
        display: flex;
        flex-direction: row;
        gap: 10px;
        align-items: center;
        justify-content: center;
        padding: 2rem;
    }

    .otp-input {
        background-color: var(--color-background);
        border-color: var(--color-text);
        width: 40px;
        height: 48px;
        text-align: center;
        border-radius: 7px;
        caret-color: rgb(127, 129, 255);
        color: var(--color-text);
        outline: none;
        font-weight: 600;
    }

    .otp-input:focus,
    .otp-input:valid {
        background-color: rgba(127, 129, 255, 0.199);
        transition-duration: .3s;
    }
</style>
<template>
    <form class="form-signin text-center">
        <img class="rounded-circle mb-3" :src="user && user.avatarUrl ? user.avatarUrl : 'images/touch/favicon64.png'" alt="" width="72" height="72" v-show="!isLoading">
        <p class="text-muted" v-if="user">{{ user.email }}</p>
        <Loader v-show="isLoading" />
        <h1 class="h3 mb-3 font-weight-normal">Enter code</h1>

        <label for="inputOtp" class="">Enter the code displayed in the authenticator app on your mobile device​​</label>
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

        <span class="btn btn-lg btn-block" :class="isLoading ? 'btn-secondary' : 'btn-primary'" @click="verify()">Verify</span>

        <p class="mt-5 mb-3 text-muted">Having trouble? <router-link to="/login">Sign in another way</router-link></p>
    </form>
</template>

<script>
    import '../assets/auth.css'

    import Alert from '../models/Alert'
    import {
        useAlertStore,
        useUserStore
     } from '@/store'
    import { storeToRefs } from 'pinia'
    import Loader from '../components/Loader.vue'

    export default {
        data() {
            return {
                totpToken: ['','','','','',''],
                error: {
                    message: ''
                },
                remember: false,
                isLoading: false
            }
        },
        setup() {
            const userStore = useUserStore()

            const { user } = storeToRefs(userStore)
            const { verifyMFA } = userStore

            const { openAlert } = useAlertStore()

            return {
                user,
                verifyMFA,

                openAlert
            }
        },
        components: {
            Loader
        },
        mounted() {
            // Put focus on first input
            this.$refs['otpInput_0'][0].focus();
        },
        methods: {
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
                if (this.totpToken.filter(v => v).length == this.totpToken.length) {
                    this.verify();
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
            verify: async function () {
                this.isLoading = true;

                try {
                    await this.verifyMFA({
                        accessToken: this.$route.query.token, 
                        totpToken: this.totpToken.join('')
                    })

                    this.$router.push({ name: 'Home' });
                }
                catch(error) {
                    this.isLoading = false;
                    this.openAlert(new Alert('Error', error.message, 'danger'))
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
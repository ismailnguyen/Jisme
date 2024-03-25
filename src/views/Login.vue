<template>
    <form class="form-signin text-center" @submit.prevent>
        <img class="mb-4" src="images/touch/favicon64.png" alt="" width="72" height="72" v-show="!isLoading">
        <Loader v-show="isLoading" />

        <h1 class="h3 mb-3 font-weight-normal">Sign in</h1>

        <label v-if="!isUsernameFilled" for="inputUsername" class="sr-only">Email address, or phone number</label>
        <input v-if="!isUsernameFilled"
            type="text"
            id="inputUsername"
            name="username"
            autocomplete="username webauthn"
            class="form-control"
            placeholder="Email address, or phone number"
            aria-describedby="emailHelp"
            v-model="username"
            @keyup.enter="submitUsername()"
            autofocus
            tabindex="1"
            required>

        <label v-if="isUsernameFilled" for="inputPassword" class="sr-only">Password</label>
        <input v-if="isUsernameFilled" type="password" id="inputPassword" class="form-control" placeholder="Password" v-model="password" @keyup.enter="handleLogin()" tabindex="6" required>

        <div v-if="!isUsernameFilled" class="checkbox mb-3">
            <label>
                <input type="checkbox" value="remember-me" v-model="remember" tabindex="2"> Remember me
            </label>
        </div>

        <span class="btn btn-lg btn-block" :class="isLoading ? 'btn-outline-secondary' : 'btn-outline-primary'" @keyup.enter="submitUsername()" @click="submitUsername()" v-if="!isUsernameFilled" tabindex="3">Next</span>
        <span class="btn btn-lg btn-block" :class="isLoading ? 'btn-outline-secondary' : 'btn-outline-primary'" @keyup.enter="handleLogin()" @click="handleLogin()" tabindex="7" v-else>Sign in</span>

        <span class="btn btn-lg btn-block" :class="isLoading ? 'btn-secondary' : 'btn-primary'" @click="handlePasswordlessLogin()" v-if="isPasswordlessLoginBtnVisible && !isUsernameFilled" tabindex="4">
            <i class="fa fa-lock"></i>
            One button sign-in
        </span>

        <p v-if="!isUsernameFilled" class="mt-5 mb-3 text-muted" tabindex="5">Don't have account? <router-link to="/register">Sign up</router-link></p>
        <p v-else class="mt-5 mb-3 text-muted" tabindex="5"><a @click="isUsernameFilled=false">Go back</a></p>
    </form>
</template>

<script>
    import '../assets/auth.css'

    import Alert from '../models/Alert'
    import { storeToRefs } from 'pinia'
    import {
        useAlertStore,
        useUserStore
    } from '@/store'
    import Loader from '../components/Loader.vue'

    export default {
        data() {
            return {
                username: '',
                password: '',
                isUsernameFilled: false,
                remember: false,
                isLoading: false,
                isPasswordlessLoginBtnVisible: false
            }
        },
        setup() {
            const userStore = useUserStore()

            const { user, isLoggedIn, lastRememberedUsername } = storeToRefs(userStore)
            const { loginPasswordless, login } = userStore

            const { openAlert } = useAlertStore()

            return {
                user,
                isLoggedIn,
                lastRememberedUsername,
                login,
                loginPasswordless,

                openAlert
            }
        },
        components: {
            Loader
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
        methods: {
            submitUsername: function () {
                if (!this.isUsernameFilled) {
                    this.isUsernameFilled = true;
                }
            },

            handleLogin: async function ()
            {
                if (!this.isUsernameFilled) {
                    return;
                }

                this.isLoading = true;

                try {
                    const loginResult = await this.login({
                        username: this.username,
                        password: this.password
                    }, this.remember);

                    if (loginResult.isMFARequired) {
                        this.$router.push({name: 'VerifyMFA', query: { token: loginResult.token }});
                    }
                    else {
                        this.$router.push({ name: 'Home' });
                    }
                }
                catch (error) {
                    this.isLoading = false;
                    this.openAlert(new Alert('Error', error.message, 'danger'))
                }
            },

            handlePasswordlessLogin: async function () {
                this.isLoading = true;

                try {
                    await this.loginPasswordless();
                }
                catch (error) {
                    this.isLoading = false;
                    this.openAlert(new Alert('Error', error, 'danger'))
                }
            }
        }
    }
</script>

<style scoped>
    .form-signin input {
        margin-bottom: 10px;
    }
</style>
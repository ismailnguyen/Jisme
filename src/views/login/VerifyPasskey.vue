<template>
    <div class="container col-xl-10 col-xxl-8 px-4 py-5">
        <div class="row align-items-center g-lg-5 py-5">
            <LoginHero :isLoading="isLoading" />

            <div class="col-xs-12 col-md-10 mx-auto col-lg-5">
                <form class="p-4 p-md-5 rounded-3 form-signin" @submit.prevent="submitUsername()">
                    <div class="d-block d-lg-none">
                        <img class="img-fluid rounded mb-4" loading="lazy" src="../../assets/logo_medium.png" alt="Jisme" v-show="!isLoading">
                        <Loader v-show="isLoading" />
                    </div>

                    <h1 class="h3 mb-3 font-weight-normal">Authenticating</h1>

                     <div class="form-floating mb-3">
                        <input
                            type="text"
                            id="readonlyInputUsername"
                            name="username"
                            autocomplete="username"
                            class="form-control-plaintext"
                            v-model="user.email"
                            tabindex="1"
                            readonly>
                        <label for="readonlyInputUsername">Email address</label>
                    </div>

                    <hr class="my-4">

                    <p class="mt-5 mb-3 text-muted">Having trouble? <router-link to="/login/password">Sign in another way</router-link></p>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
    import '../../assets/auth.css'

    import { 
        mapWritableState,
        mapActions
    } from 'pinia'
    import {
        useAlertStore,
        useUserStore
    } from '@/store'
    import Loader from '../../components/Loader.vue'
    import LoginHero from '../../components/LoginHero.vue'

    export default {
        data() {
            return {
                isLoading: false
            }
        },
        components: {
            Loader,
            LoginHero
        },
        computed: {
            ...mapWritableState(useUserStore, [
                'user',
            ]),
        },
        created () {
            if (!this.user || !this.user.email || !this.user.token) {
                this.$router.push({ name: 'Login' });
            }
        },
        async mounted () {
            // Availability of `window.PublicKeyCredential` means WebAuthn is usable.
            if (window.PublicKeyCredential &&  
                PublicKeyCredential.isConditionalMediationAvailable) {  
                // Check if conditional mediation is available.  
                PublicKeyCredential.isConditionalMediationAvailable().then(isCMA => {
                    if (isCMA) {  
                        // Init challenge to act as a CSRF token
                        this.initPasswordlessLogin();

                        // Call WebAuthn authentication  
                        this.handlePasswordlessLogin();
                    }  
                })
            }
        },
        methods: {
            ...mapActions(useAlertStore, [
                'openAlert'
            ]),

            ...mapActions(useUserStore, [
                'requestPasswordlessLogin',
                'verifyPasskey',
            ]),

            initPasswordlessLogin: async function () {
                // First request challenge to the server, so that we keep the challenge active until the user signs it
                await this.requestPasswordlessLogin();
            },

            handlePasswordlessLogin: async function () {
                this.isLoading = true;

                try {
                    // Then sign the challenge to be allowed to login without password
                    await this.verifyPasskey();

                    this.$router.push({ name: 'Home' });
                }
                catch (error) {
                    this.isLoading = false;
                    this.openAlert(error.reason ? error.message : 'Error', error.reason || error.message, 'danger');
                }
            }
        }
    }
</script>

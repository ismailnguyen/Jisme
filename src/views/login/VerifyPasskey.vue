<template>
    <div class="container py-5" v-if="user && user.email && this.user.token">
        <div class="row align-items-center g-lg-5 py-5">
            <LoginHero :isLoading="isLoading" />

            <div class="col-xs-12 col-md-5 col-lg-5">
                <form class="p-4 p-md-5 form-signin" @submit.prevent="onVerifyPasskey()">
                    <h1 class="h3 mb-3 font-weight-normal">Sign in with a passkey</h1>

                    <LoginReadonlyEmailInput
                        v-if="user"
                        :user="user"
                        @usernameChanged="onChangeUsername" />

                    <button 
                        type="button"
                        class="w-100 btn btn-lg"
                        :class="isLoading ? 'btn-secondary' : 'btn-primary'"
                        @click="onVerifyPasskey"
                        tabindex="2"
                        v-show="isPasswordlessLoginBtnVisible">
                        <i class="fa fa-user-lock" aria-hidden="true"></i>
                        
                        {{ isLoading ? 'Loading passkeys...' : 'Choose a passkey' }}
                    </button>

                    <button
                        class="btn btn-danger btn-block"
                        v-show="!isPasswordlessLoginBtnVisible"
                        disabled>
                        <i class="fa fa-ban"></i> Passkey not supported in this device
                    </button>

                    <hr class="my-4 mt-5 mb-3">

                    <p class="text-muted">Having trouble? <router-link to="/login/password">Sign in another way</router-link></p>
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
                isPasswordlessLoginBtnVisible: false,
                isLoading: false
            }
        },
        components: {
            LoginHero,
            LoginReadonlyEmailInput
        },
        computed: {
            ...mapState(useUserStore, [
                'user',
            ]),
        },
        async mounted () {
            if (!this.user || !this.user.email || !this.user.token) {
                this.$router.push({ name: 'Login' });

                return;
            }
        
            this.isPasskeyLoginSupported(this.onPasskeySupported, this.onPasskeyUnsupported);
        },
        methods: {
            ...mapActions(useAlertStore, [
                'openAlert'
            ]),

            ...mapActions(useUserStore, [
                'verifyPasskey',
                'isPasskeyLoginSupported',
                'setAutoLogin'
            ]),

            onPasskeySupported: function () {
                // Display button
                this.isPasswordlessLoginBtnVisible = true;

                // Call WebAuthn authentication  
                this.onVerifyPasskey();
            },

            onPasskeyUnsupported: function () {
                this.isPasswordlessLoginBtnVisible = false;
            },
            
            onChangeUsername: async function () {
                // Disable auto login to allow user to change username from login page
                await this.setAutoLogin(false);
                
                this.$router.push({ name: 'Login' });
            },

            onVerifyPasskey: async function () {
                this.isLoading = true;

                try {
                    // Then sign the challenge to be allowed to login without password
                    await this.verifyPasskey();

                    this.$router.push({ name: 'Home' });
                }
                catch (error) {
                    this.isLoading = false;
                    
                    // NotAllowedError is thrown when user's request to cancel the passkey authentication
                    // So do not display any error message in that case
                    if (error.name !== 'NotAllowedError') {
                        this.openAlert(error.reason ? error.reason : 'Error', error.message || error.reason, 'danger');
                    }
                }
            }
        }
    }
</script>

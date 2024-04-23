<template>
    <div class="container col-xl-10 col-xxl-8 px-4 py-5">
        <div class="row align-items-center g-lg-5 py-5">
            <LoginHero :isLoading="isLoading" />

            <div class="col-xs-12 col-md-10 mx-auto col-lg-5">
                <form class="p-4 p-md-5 rounded-3 form-signin" @submit.prevent="onVerifyPassword()">
                    <div class="d-block d-md-none">
                        <img class="img-fluid rounded mb-4" loading="lazy" src="../../assets/logo_medium.png" alt="Jisme" v-show="!isLoading">
                        <Loader v-show="isLoading" />
                    </div>

                    <h1 class="h3 mb-3 font-weight-normal">Sign in</h1>

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

                    <div class="mb-3">
                         <label for="inputPassword" class="sr-only">Password</label>
                        <input
                            type="password"
                            ref="inputPassword"
                            id="inputPassword"
                            class="form-control"
                            placeholder="Password"
                            v-model="password"
                            autofocus
                            tabindex="2"
                            autocomplete="current-password"
                            required>
                    </div>
                    
                    <button 
                        type="submit"
                        class="btn btn-lg"
                        :class="isLoading ? 'btn-outline-secondary' : 'btn-outline-primary'"
                        :disabled="!password"
                        @keyup.enter="onVerifyPassword"
                        tabindex="3">
                        <i class="fa fa-right-to-bracket" aria-hidden="true"></i>
                        Sign in
                    </button>

                    <hr class="my-4">

                    <p class="mt-5 mb-3 text-muted" tabindex="3">
                        <a @click="goBack()">
                            <i class="fa-solid fa-arrow-left"></i>
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
                password: '',
                isLoading: false
            }
        },
        components: {
            Loader,
            LoginHero
        },
        computed: {
            ...mapWritableState(useUserStore, [
                'user'
            ]),
        },
        created () {
            if (!this.user || !this.user.email || !this.user.token) {
                this.$router.push({ name: 'Login' });
            }
        },
        mounted () {
            this.$refs.inputPassword.focus();
        },
        methods: {
            ...mapActions(useAlertStore, [
                'openAlert'
            ]),

            ...mapActions(useUserStore, [
                'verifyPassword'
            ]),

            goBack: function () {
                this.$router.push({ name: 'Login' });
            },

            onVerifyPassword: async function () {
                this.isLoading = true;

                try {
                    const { next } = await this.verifyPassword({
                        password: this.password
                    });

                    if (next.step === 'verify_otp') {
                        this.$router.push({ name: 'VerifyOTP' });
                    }
                    else {
                        this.$router.push({ name: 'Home' });
                    }
                }
                catch (error) {
                    this.isLoading = false;
                    this.openAlert(error.reason ? error.message : 'Error', error.reason || error.message, 'danger');
                }
            }
        }
    }
</script>
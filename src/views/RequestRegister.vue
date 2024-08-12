<template>
    <div class="container py-5">
        <div class="row align-items-center g-lg-5 py-5">
            <LoginHero :isLoading="isLoading" />

            <div class="col-xs-12 col-md-5 col-lg-5">
                <form class="p-4 p-md-5 form-signin" @submit.prevent="signUp()">
                    <h1 class="h3 mb-3 font-weight-normal">Sign Up</h1>

                    <!--
                    <div class="form-floating mb-3">
                        <input type="email" class="form-control" id="floatingInput" placeholder="name@example.com" @keyup.enter="signUp" required>
                        <label for="floatingInput">Username</label>
                    </div>
                    <div class="form-floating mb-3">
                        <input type="password" class="form-control" id="floatingPassword" placeholder="Password" @keyup.enter="signUp" required>
                        <label for="floatingPassword">Password</label>
                    </div>
                    
                    <button
                        type="button"
                        class="w-100 btn btn-lg"
                        :class="isLoading ? 'btn-secondary' : 'btn-primary'"
                        :disabled="!username || !password"
                        @click="signUp()"
                        tabindex="3">
                        Next
                    </button>
                    -->

                    <div class="mt-5 mb-3">
                        <label for="signUpButton">
                            If you want an account, please create an issue in our repository at <a href="https://github.com/ismailnguyen/jisme/issues" class="external-link" target="_blank">github/jisme/issues</a>.
                        </label>

                    </div>

                    <button
                        id="signUpButton"
                        type="button"
                        @click="signUp"
                        class="w-100 btn btn-lg btn-primary"
                        tabindex="3">
                        Request an access
                    </button>

                    <hr class="my-4 mt-5 mb-3">

                    <p class="text-muted">Already an user? <router-link to="/login">Sign in</router-link></p>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
    import '../assets/auth.css'

    import {
        mapActions
    } from 'pinia'
    import { useAlertStore } from '@/store'
    import LoginHero from '../components/LoginHero.vue'

    export default {
        components: {
            LoginHero
        },
        data() {
            return {
                email: '',
                password: '',
                isLoading: false
            }
        },
        methods: {
            ...mapActions(useAlertStore, [
                'openAlert'
            ]),

            signUp() {
                // open https://github.com/ismailnguyen/Jisme/issues/new in a new tab
                window.open('https://github.com/ismailnguyen/Jisme/issues/new');






                //this.openAlert('Error', 'Registration are closed. Please contact administrator for assistance.', 'danger');
            }
        }
    }
</script>

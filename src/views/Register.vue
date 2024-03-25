<template>
    <section class="py-3 py-md-5 py-xl-8">
        <div class="container">
            <div class="row gy-4 align-items-center">
                <div class="col-12 col-md-6 col-xl-7 d-none d-md-block">
                    <LoginHero :isLoading="isLoading" />
                </div>
                <div class="col-12 col-md-6 col-xl-5">
                    <form class="form-signin">
                        <div class="d-block d-md-none">
                            <img class="img-fluid rounded mb-4" loading="lazy" src="images/touch/favicon64.png" alt="Jisme" v-show="!isLoading">
                            <Loader v-show="isLoading" />
                        </div>

                        <h1 class="h3 mb-3 font-weight-normal">Sign Up</h1>

                        <label for="inputEmail" class="sr-only">Email address</label>
                        <input type="email" id="inputEmail" class="form-control" placeholder="Email address" aria-describedby="emailHelp" v-model="email" @keyup.enter="signUp" required>

                        <label for="inputPassword" class="sr-only">Password</label>
                        <input type="password" id="inputPassword" class="form-control" placeholder="Password" v-model="password" @keyup.enter="signUp" required>

                        <span class="btn btn-lg btn-block" :class="isLoading ? 'btn-secondary' : 'btn-primary'" @click="signUp()">Sign up</span>

                        <p class="mt-5 mb-3 text-muted">Already an user? <router-link to="/login">Sign in</router-link></p>
                    </form>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
    import '../assets/auth.css'
    import Alert from '../models/Alert'

    import { useAlertStore } from '@/store'
    import Loader from '../components/Loader.vue'
    import LoginHero from '../components/LoginHero.vue'

    export default {
        data() {
            return {
                email: '',
                password: '',
                isLoading: false
            }
        },
        setup() {
            const { openAlert } = useAlertStore()

            return {
                openAlert
            }
        },
        components: {
            Loader,
            LoginHero
        },
        methods: {
            signUp() {
                this.openAlert(new Alert('Error', 'Registration are closed. Please contact administrator for assistance.', 'danger'))
            }
        }
    }
</script>

<style scoped>
    .form-signin input:first-of-type {
        margin-bottom: -1px;
        border-bottom-right-radius: 0;
        border-bottom-left-radius: 0;
    }

    .form-signin input:last-of-type {
        margin-bottom: 10px;
        border-top-left-radius: 0;
        border-top-right-radius: 0;
    }

    .form-signin .btn-primary {
        color: #f8f9fa;
        background-color: #162056;
        border-color: var(--color-text);
    }
</style>
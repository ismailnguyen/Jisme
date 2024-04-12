<template>
    <div class="container col-xl-10 col-xxl-8 px-4 py-5">
        <div class="row align-items-center g-lg-5 py-5">
            <LoginHero :isLoading="isLoading" />

            <div class="col-md-10 mx-auto col-lg-5">
                <form class="p-4 p-md-5 rounded-3 form-signin">
                    <div class="d-block d-lg-none">
                        <img class="img-fluid rounded mb-4" loading="lazy" src="../assets/logo_medium.png" alt="Jisme" v-show="!isLoading">
                        <Loader v-show="isLoading" />
                    </div>

                    <h1 class="h3 mb-3 font-weight-normal">Sign Up</h1>

                   <div class="form-floating mb-3">
                        <input type="email" class="form-control" id="floatingInput" placeholder="name@example.com" @keyup.enter="signUp" required>
                        <label for="floatingInput">Email address</label>
                    </div>
                    <div class="form-floating mb-3">
                        <input type="password" class="form-control" id="floatingPassword" placeholder="Password" @keyup.enter="signUp" required>
                        <label for="floatingPassword">Password</label>
                    </div>

                    <button
                        type="submit"
                        class="w-100 btn btn-lg"
                        :class="isLoading ? 'btn-secondary' : 'btn-primary'"
                        @click="signUp()"
                        tabindex="3">
                        <i class="fa fa-right-to-bracket" aria-hidden="true"></i>
                        Next
                    </button>

                    <hr class="my-4">

                    <p class="mt-5 mb-3 text-muted">Already an user? <router-link to="/login">Sign in</router-link></p>
                </form>
            </div>
        </div>
    </div>
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
    .form-signin .btn-primary {
        color: #f8f9fa;
        background-color: #162056;
        border-color: var(--color-text);
    }
</style>
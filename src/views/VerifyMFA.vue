<template>
    <div class="text-center">
        <form class="form-signin">
            <img class="rounded-circle mb-3" :src="user && user.avatarUrl ? user.avatarUrl : 'images/touch/favicon64.png'" alt="" width="72" height="72" v-show="!isLoading">
            <p class="text-muted" v-if="user">{{ user.email }}</p>
            <Loader v-show="isLoading" />
            <h1 class="h3 mb-3 font-weight-normal">Enter code</h1>

            <label for="inputOtp" class="">Enter the code displayed in the authenticator app on your mobile device​​</label>
            <input type="tel" id="inputOtp" class="form-control" placeholder="XXX XXX" v-model="totpToken" @keyup.enter="verify()" required>

            <span class="btn btn-lg btn-block" :class="isLoading ? 'btn-secondary' : 'btn-primary'" @click="verify()">Verify</span>

            <p class="mt-5 mb-3 text-muted">Having trouble? <router-link to="/login">Sign in another way</router-link></p>
        </form>
    </div>
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
                totpToken: '',
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
        methods: {
            verify: async function ()
            {
                this.isLoading = true;

                try {
                    await this.verifyMFA({
                        accessToken: this.$route.query.token, 
                        totpToken: this.totpToken
                    })

                    this.$router.push({ name: 'Home' });
                }
                catch(error) {
                    this.isLoading = false;
                    this.openAlert(new Alert('Error', error.message, 'danger'))
                }
            }
        },
        watch: {
            totpToken: function (newValue, oldValue) {
                if (newValue && newValue.length >= 6) {
                    this.verify();
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
</style>
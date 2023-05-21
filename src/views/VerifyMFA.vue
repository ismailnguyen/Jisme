<template>
    <div class="text-center">
        <form class="form-signin">
            <img class="rounded-circle mb-3" :src="user && user.avatarUrl ? user.avatarUrl : 'images/touch/favicon64.png'" alt="" width="72" height="72" v-show="!isLoading">
            <p class="text-muted" v-if="user">{{ user.email }}</p>
            <Loader v-show="isLoading" />
            <h1 class="h3 mb-3 font-weight-normal">Enter code</h1>

            <p class="text-danger">{{error.message}}</p>

            <label for="inputOtp" class="">Enter the code displayed in the authenticator app on your mobile device​​</label>
            <input type="tel" id="inputOtp" class="form-control" placeholder="XXX XXX" v-model="totpToken" @keyup.enter="verify()" required>

            <span class="btn btn-lg btn-block" :class="isLoading ? 'btn-secondary' : 'btn-primary'" @click="verify()">Verify</span>

            <p class="mt-5 mb-3 text-muted">Having trouble? <router-link to="/login">Sign in another way</router-link></p>

        </form>
    </div>
</template>

<script>
    import { getUser } from '../utils/auth'
    import UserService from '../services/UserService'
    import Loader from '../components/Loader.vue'

    export default {
        data() {
            return {
                user: getUser(),
                totpToken: '',
                error: {
                    message: ''
                },
                remember: false,
                isLoading: false
            }
        },
        components: {
            Loader
        },
        methods: {
            verify: function ()
            {
                this.isLoading = true;

                let userService = new UserService();

                userService.verifyMFA({
                    accessToken: this.user.token, 
                    totpToken: this.totpToken
                    }, () => {
                        this.$router.push('/');
                        location.reload();
                    })
                .catch(error => 
                {
                    this.isLoading = false;
                    this.error = error;
                });
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

<style>
    html, body {
        height: 100%;
    }

    body {
        background-color: #f8f9fa;
        color: #162056;
        -ms-flex-align: center;
        align-items: center;
        padding-top: 40px;
        padding-bottom: 40px;
    }

    .form-control {
        color: #162056;
        border: none;
        border-radius: 15px;
        background-color: #ced4da70;
    }

    .form-control::placeholder {
      color: #162056;
      opacity: 1;
    }

    .form-signin {
        width: 100%;
        max-width: 330px;
        padding: 15px;
        margin: auto;
        color: #162056;
        background: #f8f9fa;
        border: none;
        border-radius: 15px;
        box-shadow: 0 10px 20px 0 rgba(208,214,222,.5);
    }
    
    .form-signin .checkbox {
        font-weight: 400;
    }

    .form-signin .form-control {
        opacity: 0.9;
        position: relative;
        box-sizing: border-box;
        height: auto;
        padding: 10px;
        font-size: 16px;
    }
    
    .form-signin .form-control:focus {
        z-index: 2;
    }

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

    .form-signin .btn-outline-primary {
        color: #162056;
        border-color: #162056;
    }

    .form-signin .btn-outline-primary:hover {
        color: #f8f9fa;
        background-color: #162056;
    }

    .form-signin input[type="tel"] {
        margin-bottom: 10px;
    }

    .form-signin .btn-primary {
        color: #f8f9fa;
        background-color: #162056;
        border-color: #162056;
    }
</style>
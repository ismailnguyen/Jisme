<template>
    <div class="text-center">
        <form class="form-signin">
            <img class="mb-4" :src="user && user.avatarUrl ? user.avatarUrl : 'images/touch/favicon64.png'" alt="" width="72" height="72" v-show="!isLoading">
            <Loader v-show="isLoading" />
            <h1 class="h3 mb-3 font-weight-normal">Validate OTP</h1>

            <p class="text-danger">{{error.message}}</p>

            <label for="inputOtp" class="sr-only">One Time Password</label>
            <input type="text" id="inputOtp" class="form-control" placeholder="XXX XXX" v-model="totpToken" @keyup.enter="verify()" required>

            <span class="btn btn-lg btn-outline-primary btn-block" @click="verify">Verify</span>
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
        border-radius: 0.75rem;
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
        border-radius: 1.55rem;
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
</style>
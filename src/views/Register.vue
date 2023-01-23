<template>
    <div class="text-center">
        <form class="form-signin">
            <img class="mb-4" src="images/touch/favicon64.png" alt="" width="72" height="72" v-show="!isLoading">
            <Loader v-show="isLoading" />

            <h1 class="h3 mb-3 font-weight-normal">Sign Up</h1>

            <p class="text-danger">{{error.message}}</p>

            <label for="inputEmail" class="sr-only">Email address</label>
            <input type="email" id="inputEmail" class="form-control" placeholder="Email address" aria-describedby="emailHelp" v-model="email" @keyup.enter="signUp" required>

            <label for="inputPassword" class="sr-only">Password</label>
            <input type="password" id="inputPassword" class="form-control" placeholder="Password" v-model="password" @keyup.enter="signUp" required>

            <button class="btn btn-lg btn-primary btn-block" @click="signUp">Sign Up</button>

            <p class="mt-5 mb-3 text-muted"><router-link to="/login">Already an user ? Sign in</router-link></p>
        </form>
    </div>
</template>

<script>
    import Loader from '../components/Loader.vue'

    export default {
        data() {
            return {
                email: '',
                password: '',
                error: {
                    message: ''
                },
                isLoading: false
            }
        },
        methods: {
            signUp() {
                this.isLoading = true;
                this.error.message = 'Error : Functionnality non available';
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
        border-radius: 18px;
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

    .form-signin .btn-primary {
        color: #f8f9fa;
        background-color: #162056;
        border-color: #162056;
    }
</style>
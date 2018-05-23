<template>
    <div class="text-center">
        <form class="form-signin">
            <img class="mb-4" src="images/touch/favicon64.png" alt="" width="72" height="72">

            <h1 class="h3 mb-3 font-weight-normal">Please sign in</h1>

            <p>{{error.message}}</p>

            <label for="inputEmail" class="sr-only">Email address</label>
            <input type="email" id="inputEmail" class="form-control" placeholder="Email address" aria-describedby="emailHelp" v-model="email" @keyup.enter="handleLogin" required autofocus>

            <label for="inputPassword" class="sr-only">Password</label>
            <input type="password" id="inputPassword" class="form-control" placeholder="Password" v-model="password" @keyup.enter="handleLogin" required>

            <div class="checkbox mb-3">
                <label>
                    <input type="checkbox" value="remember-me" v-model="remember"> Remember me
                </label>
            </div>

            <span class="btn btn-lg btn-outline-primary btn-block" @click="handleLogin">Sign in</span>

            <p class="mt-5 mb-3 text-muted"><router-link to="/register">Don't have account ? Sign up</router-link></p>
        </form>
    </div>
</template>

<script>
    import UserService from '../services/UserService'
    
    export default {
        data() {
            return {
                email: '',
                password: '',
                error: {
                    message: ''
                },
                remember: false
            }
        },
        methods: {
            handleLogin: function ()
            {
                let userService = new UserService();

                userService.login(this.email, this.password, this.remember)
                .catch(error => this.error = error);
            }
        }
    }
</script>

<style>
    html, body {
        height: 100%;
    }

    body {
        background-color: #f5f5f5;
        color: #000;
        -ms-flex-align: center;
        align-items: center;
        padding-top: 40px;
        padding-bottom: 40px;
    }

    .form-control {
        color: black;
        border: none;
        border-radius: 0.75rem;
        background-color: #ced4da70;
    }

    .form-control::placeholder {
      color: #fff;
      opacity: 1;
    }

    .form-signin {
        width: 100%;
        max-width: 330px;
        padding: 15px;
        margin: auto;
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
</style>
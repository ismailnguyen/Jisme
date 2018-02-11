<template>
    <div class="form-inline">
        <h3>Sign In</h3>

        <div class="form-group">
            <input type="text" placeholder="email" class="form-control" v-model="email">
            <input type="password" placeholder="password" class="form-control" v-model="password">
            <br/>
            <button class="ce pi" @click="handleLogin">Sign In</button>
        </div>
        <br/>
        <p>{{error.message}}</p>
        <br/>
        <router-link to="/register">Don't have account ? Sign up</router-link>
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
                }
            }
        },
        methods: {
            handleLogin: function ()
            {
                let userService = new UserService();

                userService.login(this.email, this.password)
                .catch(error => this.error = error);
            }
        }
    }
</script>
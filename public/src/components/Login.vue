<template>
    <div class="form-inline">
        <h3>Sign In</h3>

        <div class="form-group">
            <input type="text" placeholder="email" class="form-control" v-model="email">
            <input type="password" placeholder="password" class="form-control" v-model="password">
            <br/>
            <button class="btn btn-primary" @click="handleLogin">Sign In</button>
        </div>
        <br/>
        <p>{{error.message}}</p>
        <br/>
        <router-link to="/signup">Don't have account ? Sign up</router-link>
    </div>
</template>


<script>
    import { login } from '../utils/auth'
    
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
            handleLogin() {
                login(this.email, this.password);
            }
        }
    }
</script>
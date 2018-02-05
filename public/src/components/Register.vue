<template>
    <div class="form-inline">
        <h3>Sign Up</h3>

        <div class="form-group">
            <input type="text" placeholder="email" class="form-control" v-model="email">
            <input type="password" placeholder="password" class="form-control" v-model="password">
            <br/>
            <button class="btn btn-primary" @click="signUp">Sign Up</button>
        </div>
        <br/>
        <p>{{error.message}}</p>
        <br/>
        <router-link to="/signin">Already an user ? Sign in</router-link>
    </div>
</template>


<script>
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
            signUp() {
            }
        }
    }
</script>
<template>
    <nav class="navbar navbar-light fixed-top" v-if="isLoggedIn">
        <button class="navbar-toggler button-power-off" type="button" @click="signOut()">
            <i class="text-danger fa fa-power-off"></i>
        </button>
    </nav>
</template>

<script>
    import { isLoggedIn } from '../utils/auth'
    import UserService from '../services/UserService'

    export default {
        data () {
            return {
                isLoggedIn: isLoggedIn()
            }
        },
        methods: {
            signOut: function () {
                let userService = new UserService();

                userService.logout();
            }
        },
        computed: {
            currentTag: function ()
            {
                let tag = this.$route.params.tag;

                if (!tag) {
                    tag = 'All';
                }

                this.$store.state.currentTag = tag;

                return tag;
            },
        },
    }
</script>

<style scoped>
    .navbar {
        padding-left: 5px;
    }

    .navbar button {
        border-radius:100px;
        text-align:center;
        background-color:#E0E5EC;
        border: none;
        box-shadow: 9px 9px 16px rgb(163,177,198,0.6), -9px -9px 16px  rgba(255,255,255, 0.5);
    }
</style>
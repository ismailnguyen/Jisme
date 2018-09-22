<template>
    <nav class="navbar navbar-light bg-light navbar-expand-lg fixed-bottom" v-if="isLoggedIn">
        
        <a class="navbar-brand btn btn-outline-primary" href="/Tags">{{ currentTag }}</a>
        
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav mr-auto">
                <li class="nav-item ">
                    <a class="nav-link" href="#" @click="signOut()">Sign out</a>
                </li>
            </ul>
        </div>

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
    .alert {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 99999;
    }
</style>
<template>
    <nav class="navbar navbar-light fixed-top" v-if="isLoggedIn">
        <button class="navbar-toggler" type="button" @click="signOut()">
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

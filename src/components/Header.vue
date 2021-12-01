<template>
    <div class="header">
        <div class="logo" @click="logoClick()">
            <img src="images/touch/favicon32.png">
            Jisme
        </div>
        <div class="user-settings">
            <div class="dark-light">
                <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
            </div>
            <div class="user-menu" @click="signOut()">
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" viewBox="0 0 24 24">
                    <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <path d="M16 17l5-5l-5-5"/>
                        <path d="M21 12H9"/>
                    </g>
                </svg>
            </div>
            
            <img v-if="user.avatarUrl" class="user-profile" :src="user.avatarUrl" :alt="user.email" :title="user.email">
        </div>
    </div>
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
        props: ['user'],
        methods: {
            logoClick: function () {
                this.$router.push('/')
                this.$emit('logoClicked');
            },
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
    .header {
        display: flex;
        align-items: center;
        transition: box-shadow 0.3s;
        flex-shrink: 0;
        padding: 0 40px;
        white-space: nowrap;
        background-color: var(--header-bg-color);
        height: 60px;
        width: 100%;
        font-size: 14px;
        justify-content: space-between;
    }
    .header-menu a {
        text-decoration: none;
        color: var(--body-color);
        font-weight: 500;
    }
    .header-menu a:hover {
        color: var(--active-color);
    }
    .header-menu a:not(:first-child) {
        margin-left: 30px;
    }
    .header-menu a.active {
        color: var(--active-color);
    }

    .user-settings {
        display: flex;
        align-items: center;
        font-weight: 500;
    }
    .user-settings svg {
        width: 20px;
        color: #94949f;
    }

    .user-profile {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        -o-object-fit: cover;
            object-fit: cover;
        margin-right: 10px;
    }
</style>
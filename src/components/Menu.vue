<template>
    <div id="sidebar-wrapper">
        <ul class="sidebar-nav">
            <li class="first-item">
                <a @click="add()">
                    <i class="fa fa-plus"></i>
                    Add
                </a>
            </li>
            <li class="no-hover">
        
                {{ this.$route.query.tag }}
                <span
                    class="badge badge-pill"
                    @click="selectTag(tag)"
                    v-for="(tag, index) in getUniqueTags"
                    v-bind:key="index"
                    :class="isCurrentTag(tag) ? 'badge-danger' : 'badge-primary'"
                    >
                    {{ isCurrentTag(tag) ? 'X ' : '' }}{{  tag }}
                </span>
            </li>
            <li class="last-item">
                <a @click="signOut()">
                    <i class="text-danger fa fa-power-off"></i>
                    Logout
                </a>
            </li>
        </ul>
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
        methods: {
            add: function () {
                this.$emit('toggleAddAccountModal');
                this.$emit('toggleMenu');
            },

            selectTag: function (tag) {
                this.$router.push({name: 'AccountList', query: { tag: this.isCurrentTag(tag) ? '' : tag }});
                this.$emit('toggleMenu');
            },

            isCurrentTag: function (tag) {
                return this.$route.query.tag === tag;
            },

            signOut: function () {
                let userService = new UserService();

                userService.logout();
            }
        },
        computed: {
            getUniqueTags: function ()
            {
                let tags = [];

                this.$store.state.accounts.forEach(account =>
                {
                    account.tags.split(',').map(t => t.trim()).forEach(tag =>
                    {
                        if (tags.indexOf(tag) === -1) {
                            tags.push(tag);
                        }
                    });
                });

                return tags.sort();
            },
        },
    }
</script>

<style scoped>
    /* Sidebar */
    #sidebar-wrapper {
        position: absolute;
        width: 0;
        right: 0;
        height: 100%;
        overflow-y: hidden;
        background: #162056db;
        backdrop-filter: blur(8px);
        transition: all .5s;
        display: flex;
        align-items: center;
        z-index: 999;
    }

    /* Sidebar styling */
    .sidebar-nav {
        padding: 0;
        list-style: none; 
        transition: all .5s;
        width: 100%;
        text-align: center;
        overflow-y: auto;
        height: 100%;
        padding-top: 100px;
    }

    .sidebar-nav li {
        line-height: 40px;  
        width: 100%;
        transition: all .3s;
        padding: 10px;
    }

    .sidebar-nav li a {
        display: block;
        text-decoration: none;
        color: #fff;
        cursor: pointer;
    }

    .sidebar-nav li:hover {
        background: #007bff;
    }

    .sidebar-nav li.no-hover:hover {
        background: #162056db;
    }

    li .badge {
        cursor: pointer;
        margin: 5px;
    }

    li .badge:hover {
        color: #162056db;
    }

    li.first-item {
        border: 1px solid white;
    }

    li.last-item {
        position: fixed;
        bottom: 0;
        background: #162056;
    }

    li.last-item:hover {
        background-color: #fff;
    }

    li.last-item a {
        color: #dc3545;
    }
</style>
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
                <span
                    class="badge badge-pill"
                    @click="selectTag(tag)"
                    v-for="(tag, index) in getUniqueTags"
                    v-bind:key="index"
                    :class="isCurrentTag(tag) ? 'badge-danger' : 'badge-primary'"
                    >
                    <i class="fa fa-close" v-if="isCurrentTag(tag)"></i>
                    {{  tag }}
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
    import FilterService from '../services/FilterService'
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
                const tags = this.updateTags(tag);

                this.$router.push({name: 'AccountList', query: { tags: tags }});
                this.$emit('toggleMenu');
            },

            updateTags: function (tag) {
                if (this.isCurrentTag(tag)) {
                    return this.removeTag(tag);
                }

                return this.addTag(tag);
            },

            addTag: function (tag) {

                let newTags = this.$route.query.tags ? this.$route.query.tags.split(',').map(x => x.trim()) : [];
                newTags.push(tag);

                return newTags.join(',');
            },

            removeTag: function (tag) {
                let newTags = this.$route.query.tags ? this.$route.query.tags.split(',').map(x => x.trim()) : [];
                newTags.splice(newTags.indexOf(tag), 1);
                console.log('remove tag', tag, this.$route.query.tags, newTags);
                
                return newTags.join(',');
            },

            isCurrentTag: function (tag) {
                return this.$route.query.tags && this.$route.query.tags.split(',').includes(tag);
            },

            signOut: function () {
                let userService = new UserService();

                userService.logout();
            }
        },
        computed: {
            getUniqueTags: function () {
                let tags = [];

                this.accountsFilteredByQuery.forEach(account =>
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

            accountsFilteredByQuery: function () {
                const filterService = new FilterService(this.$store.state.accounts);
                filterService.filterByTags(this.$route.query.tags);
                filterService.filterByQuery(this.$route.query.search);

                return filterService.getAccounts();
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
        cursor: pointer;
    }

    li .badge {
        cursor: pointer;
        margin: 5px;
    }

    li .badge:hover {
        color: #162056db;
    }

    li.first-item a {
        color: #fff;
        background-color: #dc3545;
        border-radius: 50px;
    }

    li.first-item a:hover {
        background-color: #fff;
        color: #dc3545;
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
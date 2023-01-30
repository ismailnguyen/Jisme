<template>
    <div id="sidebar-wrapper">
        <ul class="sidebar-nav">
            <img :src="user.avatarUrl" class="rounded-circle mb-3" style="width: 150px;" alt="Avatar" />
            <p class="text-muted">{{ user.email }}</p>
            <li class="menu-actions">
                <a class="menu-actions-add" @click="add()">
                    <i class="fa fa-plus"></i>
                </a>

                <a class="menu-actions-logout" @click="signOut()">
                    <i class="fa fa-power-off"></i>
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
        </ul>
    </div>
</template>

<script>
    import FilterService from '../services/FilterService'
    import UserService from '../services/UserService'

    export default {
        props: ['user', 'searchQuery'],
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
                
                return newTags.join(',');
            },

            isCurrentTag: function (tag) {
                return this.$route.query.tags && this.$route.query.tags.split(',').includes(tag);
            },

            signOut: function () {
                let userService = new UserService();

                userService.logout(() => {
                            this.$router.go('/');
                        });
            }
        },
        computed: {
            getUniqueTags: function () {
                let tags = [];

                this.accountsFilteredByQuery.forEach(account => {
                    account.tags.split(',').map(t => t.trim()).forEach(tag => {
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
                filterService.filterByQuery(this.searchQuery);

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
        backdrop-filter: blur(18px) contrast(60%);
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

    .menu-actions {
        display: flex;
        justify-content: space-evenly;
    }

    .menu-actions a {
        border-radius: 15px;
        height: 48px;
        width: 48px;
        font-size: 2em;
        text-align: center;
        box-shadow: 9px 9px 16px rgb(163 177 198 / 60%), -9px -9px 16px rgb(255 255 255 / 50%);
    }

    .menu-actions i {
        margin-top: 9px;
    }

    @media (prefers-color-scheme: dark) {
		.menu-actions a {
			box-shadow: none;
		}
	}

    .menu-actions-add i {
        color: #fff;
    }

    .menu-actions a:active,
    .menu-actions a:hover {
        box-shadow: 2px 4px 16px rgb(0 0 0 / 16%);
        transform: scale3d(1.01,1.01,1.01);
    }

    .menu-actions-add {
        background-color: #dc3545;
    }

    .menu-actions-logout i {
        color: #dc3545;
    }

    .menu-actions-logout {
        background-color: #fff;
    }
</style>
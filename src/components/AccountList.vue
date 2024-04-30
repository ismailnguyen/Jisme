<template>
    <div id="page-content-wrapper" class="container-fluid">
        <header class="row header-search justify-content-center">
            <div class="col-xs-12 col-md-8 col-lg-6">
                <input class="form-control searchBar" v-model="searchQuery" ref="searchInput" name="search" type="search" placeholder="Search" autofocus :disabled="isLoading">
            </div>
        </header>

        <div class="main-container container-fluid" v-show="isSearching">
            <div class="row">
                <div class="mb-3 col-12 col-xs-12 col-sm-12 search-title placeholder-glow" v-if="isLoading">
                    <span class="placeholder col-2 me-3 mb-0"></span><br>
                    <span class="placeholder col-4"></span>
                </div>
                <div class="mb-3 col-12 col-xs-12 col-sm-12 search-title" v-else>
                    <h5 class="font-size-16 me-3 mb-0">Results for "{{ searchQuery }}"</h5>
                    <span class="category-title" >{{ filteredAccounts.length }} out of {{ accounts.length }}</span>
                </div>
            </div>

            <div class="row" v-show="selectedTags">
                <div class="mb-3 col-12 col-xs-12 col-sm-12 tags">
                    <span
                        class="badge rounded-pill badge-primary"
                        v-for="(tag, tagIndex) in selectedTags"
                        v-bind:key="tagIndex"
                        @click="removeTag(tag)">
                        {{ tag }}
                        <i class="fa fa-close"></i>
                    </span>
                </div>
            </div>

            <div class="row" v-if="isLoading">
                <LoadingAccountItem
                :size="accountsCardSize"
                v-for="index in 7"
                v-bind:key="index" />
            </div>
            <div class="row" v-else>
                <AccountItem
                    :size="accountsCardSize"
                    v-for="(account, accountIndex) in filteredAccounts"
                    v-bind:key="accountIndex"
                    :account="account" />
            </div>
        </div>

        <div class="main-container container-fluid" v-show="!isSearching">
            <div class="row">
                <div class="mb-3 col-12 col-xs-12 col-sm-12 search-title placeholder-glow" v-if="isLoading">
                    <span class="placeholder col-2 me-3 mb-0"></span><br>
                    <span class="placeholder col-4"></span>
                </div>
                <div class="mb-3 col-12 col-xs-12 col-sm-12 search-title" v-else>
                    <h5 class="font-size-16 me-3 mb-0">Recently viewed</h5>
                    <span class="category-title" >{{ recentAccounts.length }} out of {{ accounts.length }}</span>
                </div>
            </div>
            <div class="row stacked-cards" v-if="isLoading">
                <LoadingAccountItem
                    :size="accountsCardSize"
                    v-for="index in 7"
                    v-bind:key="index" />
            </div>
            <div class="row stacked-cards" v-else>
                <AccountItem
                    v-for="(account, index) in recentAccounts"
                    v-bind:key="index"
                    :account="account" />
            </div>
        </div>
    </div>
</template>

<script>
    import {
        mapState,
        mapActions,
        mapStores
    } from 'pinia'
    import {
        useAccountsStore,
        useAlertStore,
        useUiStore,
        useUserStore
     } from '@/store'
    import { SessionExpiredException } from '../utils/errors'
    import LoadingAccountItem from '../components/LoadingAccountItem.vue'
    import AccountItem from '../components/AccountItem.vue'

    const MIN_SEARCH_QUERY_LENGTH = 3;
    
    export default {
        components: {
            LoadingAccountItem,
            AccountItem,
        },
        data() {
            return {
                searchQuery: this.$route.query.search || '', // Default search query is looked up from query string
                isLoading: true,
                filteredAccounts: []
            }
        },
        async created() {
            await this.loadCache();

            this.accountsStore.$subscribe((mutation, state) => {
                this.isLoading = false;

                this.focusSearchInput();
            })

            this.$watch(
                'searchQuery',
                (newSearchQuery, oldSearchQuery) => {
                    this.searchQuery = newSearchQuery; // This line helps to speed the query update on the input field

                    if (this.$route.query.search != newSearchQuery) {
                        this.$router.push({name: 'Home', query: { search: newSearchQuery }});
                    }
                    
                    if (newSearchQuery.length >= MIN_SEARCH_QUERY_LENGTH) {
                        this.updateFilteredAccounts();
                    }
                    else {
                        this.filteredAccounts = [];
                    }
                },
                {
                    immediate: true
                });
        },
        async mounted() {
            await this.fetchLatestAccounts();
        },
        computed: {
            ...mapStores(useAccountsStore),
            ...mapState(useAccountsStore, ['recentAccounts', 'accounts']),
            ...mapState(useUiStore, [
                'isLeftSidebarOpened',
                'isRightSidebarOpened',
            ]),

            selectedTags: function () {
                return this.$route.query.tags ? this.$route.query.tags.split(',').map(x => x.trim()) : [];
            },

            isSearching: function () {
                return (this.searchQuery && this.searchQuery.length >= MIN_SEARCH_QUERY_LENGTH) || this.$route.query.tags;
            },

            accountsCardSize: function () {
                if (this.isLeftSidebarOpened && this.isRightSidebarOpened) {
                    return 'large';
                }
                else if (this.isLeftSidebarOpened) {
                    return 'small';
                }
                else if (this.isRightSidebarOpened) {
                    return 'medium';
                }

                return 'small';
            }
        },
        methods: {
            ...mapActions(useAccountsStore, [
                'loadCache',
                'fetchRecentAccounts',
                'fetchAccounts',
                'getAccountsFilteredByQuery'
            ]),

            ...mapActions(useUserStore, [
                'signOut'
            ]),

            ...mapActions(useAlertStore, [
                'openAlert'
            ]),

            focusSearchInput: function () {
                this.$refs.searchInput.focus();
            },

            updateFilteredAccounts: function () {
                this.filteredAccounts = this.getAccountsFilteredByQuery(this.searchQuery, this.$route.query.tags, true);
            },

            fetchLatestAccounts: async function () {
                try {
                    await this.fetchRecentAccounts();
                } catch (error) {
                    if (error instanceof SessionExpiredException) {
                        this.openAlert('Session expired', error.message, 'danger');
                        this.$router.go('/');
                    }
                    else {
                        this.openAlert(error.name || 'Error while loading accounts', error.message, 'danger');
                    }
                }

                try {
                    await this.fetchAccounts();
                } catch (error) {
                    if (error instanceof SessionExpiredException) {
                        this.openAlert('Session expired', error.message, 'danger');
                        this.$router.go('/');
                    }
                    else {
                        this.openAlert(error.name || 'Error while loading accounts', error.message, 'danger');
                    }
                }
            },

            removeTag: function (tag) {
                let newTags = this.$route.query.tags.split(',').map(x => x.trim());
                newTags.splice(newTags.indexOf(tag), 1);
                
                this.$router.push({ name: 'Home', query: { tags: newTags.join(',') } });
            },

            // Function for testing purpose
            getDuplicatesOnly: function (initalArray) {
                var sorted_arr = initalArray;
                var duplicateAccounts = [];

                for (var i = 0; i < sorted_arr.length - 1; i++) {
                    if (sorted_arr[i + 1].platform == sorted_arr[i].platform && sorted_arr[i + 1].login == sorted_arr[i].login) {
                        duplicateAccounts.push(sorted_arr[i]);
                    }
                }

                console.log('duplicateAccounts', duplicateAccounts.map(account => account.platform));

                return duplicateAccounts;
            },
        } 
    }
</script>

<style>
    /* Reduce search bar size when right sidebar is opened */
    .right-sidebar-opened .header-search {
        padding-right: 50%;
    }

    /* Reduce search bar size when left sidebar menu is opened */
    .left-sidebar-opened .header-search {
        padding-left: 250px;
    }

    .left-sidebar-opened.right-sidebar-opened .header-search{
        padding-right: 70%;
        padding-left: 10%;
    }

    .header-search {
        margin: auto;
    }
    
    @media (max-width: 767.98px) { 
        .header-search {
            position: fixed;
            bottom: 10px;
            left: 0;
            right: 0;
        }
    }
    
    .searchBar {
        border-radius: 15px;
        color: #818182;
        line-height: 2.5;
        box-shadow: 20px 20px 60px #d9d9d9, -20px -20px 60px #ffffff;
        backdrop-filter: blur(4px);
    }

	@media (prefers-color-scheme: dark) {
		.searchBar {
			box-shadow: none;
            background-color: #3D3D3D;
            color: rgb(162, 162, 162);
            border: 1px solid transparent;
		}
	}

    .searchBar::placeholder {
        color: #818182;
    }
	
	@media (prefers-color-scheme: dark) {	
		.searchBar::placeholder {
            color: rgb(162, 162, 162);
		}
	}

    .searchBar:hover,
    .searchBar:active,
    .searchBar:focus {
        background-color: #ced4da70;
		box-shadow: 2px 4px 16px rgb(0 0 0 / 16%);
        transform: scale3d(1.01,1.01,1.01);
	}

    @media (prefers-color-scheme: light) {
        .searchBar:hover,
		.searchBar:focus-within,
        .searchBar:active,
        .searchBar:focus {
            border: none !important;
        }
    }
	
	@media (prefers-color-scheme: dark) {
		.searchBar:hover,
		.searchBar:focus-within,
		.searchBar:active,
		.searchBar:focus {
            border-color: gray;
            color: rgb(162, 162, 162);
            background: #464646;
            transform: none;
		}
	}

    .load-more-button {
		width: 35%;
        border-radius: 15px;
		border: none;
        margin-left: auto;
        margin-right: auto;
        margin-top: 100px;
        margin-bottom: 20px;
        text-align: center;
        background-color: #f8f9fa;
        color: var(--color-text);
        box-shadow: 9px 9px 16px rgb(163,177,198,0.6), -9px -9px 16px  rgba(255,255,255, 0.5);
    }

    .load-more-button:hover {
		box-shadow: inset -4px -4px 10px rgba(255,255,255,0.5), inset 4px 4px 10px rgba(0,0,0,0.1);
	}
	
	@media (prefers-color-scheme: dark) {
		.load-more-button,
		.load-more-button:hover {
			color: #e4e6eb;
			background: #4b4c4f;
			box-shadow: none;
		}
	}
</style>
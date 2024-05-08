<template>
    <div id="page-content-wrapper" class="container-fluid">
        <header class="row header-search justify-content-center">
            <div class="col-xs-12 col-md-8 col-lg-6">
                <input
                    class="form-control searchBar"
                    v-model="searchQuery"
                    ref="searchInput"
                    name="search"
                    type="search"
                    placeholder="Search"
                    autofocus
                    :disabled="isLoading">
            </div>
        </header>

        <AccountTypesList
            v-if="!isSearching" />

        <RecentAccountList
            :accountsCardSize="accountsCardSize"
            :isLoading="isLoading"
            v-if="!isSearching" />

        <FilteredAccountList
            :searchQuery="searchQuery"
            :filteredAccounts="filteredAccounts"
            :accountsCardSize="accountsCardSize"
            :isLoading="isLoading"
            v-if="isSearching" />
        
    </div>
</template>

<script>
    import {
        mapState,
        mapWritableState,
        mapActions,
        mapStores
    } from 'pinia'
    import {
        useAccountsStore,
        useAlertStore,
        useUiStore,
     } from '@/store'
    import LoadingAccountItem from '../components/LoadingAccountItem.vue'
    import AccountItem from '../components/AccountItem.vue'
    import RecentAccountList from '../components/RecentAccountList.vue'
    import FilteredAccountList from '../components/FilteredAccountList.vue'
    import AccountTypesList from '../components/AccountTypesList.vue'

    const MIN_SEARCH_QUERY_LENGTH = 3;
    
    export default {
        components: {
            LoadingAccountItem,
            AccountItem,
            RecentAccountList,
            FilteredAccountList,
            AccountTypesList
        },
        data() {
            return {
                searchQuery: this.$route.query.search || '', // Default search query is looked up from query string,
                isLoading: true,
                filteredAccounts: []
            }
        },
        async created() {
            await this.loadCache();

            this.accountsStore.$subscribe(this.onAccountsLoaded);

            const urlQueryTags = this.$route.query.tags ? this.$route.query.tags.split(',').map(x => x.trim()) : [];
            this.applyFilters(this.searchQuery, urlQueryTags, true);

            this.$watch(
                'searchQuery',
                (newSearchQuery, oldSearchQuery) => {
                    this.searchQuery = newSearchQuery; // This line helps to speed the query update on the input field

                    if (this.$route.query.search != newSearchQuery) {
                        this.$router.push({name: 'Home', query: { 
                            search: newSearchQuery,
                            tags: this.$route.query.tags,
                            type: this.$route.query.type
                        }});
                    }
                    
                    this.updateFilteredAccounts(this.isSearching);
                },
                {
                    immediate: true
                }
            );

            this.$watch(
                '$route.query.tags',
                (newTags, oldTags) => {
                    this.selectedTags = newTags && newTags.length ? newTags.split(',').map(x => x.trim()) : [];

                    this.updateFilteredAccounts(this.isSearching);
                },
                {
                    immediate: true
                }
            );

            this.$watch(
                '$route.query.type',
                (newTypes, oldTypes) => {
                    this.selectedTypes = newTypes && newTypes.length ? newTypes.split(',').map(x => x.trim()) : [];

                    this.updateFilteredAccounts(this.isSearching);
                },
                {
                    immediate: true
                }
            );
        },
        async mounted() {
            this.focusSearchInput();
        },
        computed: {
            ...mapStores(useAccountsStore),
            ...mapWritableState(useAccountsStore, ['selectedTags', 'selectedTypes']),
            ...mapState(useUiStore, [
                'isLeftSidebarOpened',
                'isRightSidebarOpened',
            ]),

            isSearching: function () {
                return (this.searchQuery 
                        && this.searchQuery.length >= MIN_SEARCH_QUERY_LENGTH)
                            || this.selectedTags.length > 0
                            || this.selectedTypes.length > 0;
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
                'getAccountsFilteredByQuery',
                'applyFilters'
            ]),

            ...mapActions(useAlertStore, [
                'openAlert'
            ]),

            onAccountsLoaded: function () {
                this.isLoading = false;
            },

            focusSearchInput: function () {
                this.$refs.searchInput.focus();
            },

            updateFilteredAccounts: function (applyFilters = true) {
                this.filteredAccounts = applyFilters
                                        ? this.getAccountsFilteredByQuery(
                                            this.searchQuery,
                                            this.selectedTags,
                                            this.selectedTypes,
                                            true
                                        )
                                        : [];
            }
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
</style>
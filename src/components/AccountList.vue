<template>
    <div id="page-content-wrapper" class="container-fluid">
        <header class="row header-search justify-content-center">
            <div class="col-xs-12 col-md-8 col-lg-6">
                <input class="form-control searchBar" v-model="searchQuery" name="search" type="search" placeholder="Search" autofocus :disabled="isLoading">
            </div>
        </header>

        <FilteredAccountList
            v-show="hasFilter"
            :isLoading="isLoading" />

        <RecentAccountList
            v-show="!hasFilter"
            :isLoading="isLoading" />
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
        useUserStore
     } from '@/store'
    import LoadingAccountItem from '../components/LoadingAccountItem.vue'
    import AccountItem from '../components/AccountItem.vue'
    import RecentAccountList from '../components/RecentAccountList.vue'
    import FilteredAccountList from '../components/FilteredAccountList.vue'

    const MIN_SEARCH_QUERY_LENGTH = 3;
    
    export default {
        components: {
            LoadingAccountItem,
            AccountItem,
            RecentAccountList,
            FilteredAccountList
        },
        data() {
            return {
                isLoading: true,
                searchQuery: ''
            }
        },
        async created() {
            this.accountsStore.$subscribe((mutation, state) => {
                this.isLoading = false;
            })
            
            await this.loadCache();

            // Default search query is looked up from query string
            if (this.$route.query.search) {
                this.updateWordFilter(this.$route.query.search);
            }

            this.$watch(
                'searchQuery',
                (newSearchQuery, oldSearchQuery) => {
                    if (newSearchQuery.length >= MIN_SEARCH_QUERY_LENGTH) {
                        this.updateWordFilter(newSearchQuery);
                    }
                    else {
                        this.updateWordFilter('');
                    }

                    if (this.$route.query.search != newSearchQuery) {
                        this.$router.push({name: 'Home', query: { search: newSearchQuery }});
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
            ...mapState(useAccountsStore, ['wordFilter', 'hasFilter']),
        },
        methods: {
            ...mapActions(useAccountsStore, [
                'loadCache',
                'updateWordFilter',
            ]),
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
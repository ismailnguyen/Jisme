<template>
    <div id="page-content-wrapper" class="container-fluid">
        <header class="row header-search justify-content-center" v-if="!loading">
            <div class="col-xs-12 col-lg-6">
                <input class="form-control searchBar" :value="searchQuery" @input="updateSearchQuery" type="search" placeholder="Search" autofocus>
            </div>
        </header>

        <div class="main-container container-fluid" v-if="isSearching">
            <span class="category-title">{{accountsFilteredByQuery.length}} results out of {{accounts.length}}</span>
            <br><br>
            <span
                class="badge badge-pill badge-primary"
                v-for="(tag, tagIndex) in selectedTags"
                v-bind:key="tagIndex"
                @click="removeTag(tag)">
                {{ tag }}
                <i class="fa fa-close"></i>
            </span>
            <br><br>
            <div class="row" v-if="!loading">
                <AccountItem 
                    v-for="(account, accountIndex) in truncate(accountsFilteredByQuery)"
                    v-bind:key="accountIndex"
                    :account="account" />
            </div>
        </div>
        <div class="main-container container-fluid" v-else>
            <span class="category-title">Recently viewed</span>
            <br><br>

            <StackedAccountList :accounts="recentAccounts" />
        </div>

        <div class="row loadMore justify-content-center" v-if="accountsFilteredByQuery && accountsFilteredByQuery.length > truncate(accountsFilteredByQuery).length && !loading && searchQuery">
            <div class="col-xs-12 col-lg-6">
                <button id="loadMore" @click="loadMore()" type="button" class="btn btn-lg btn-light btn-block load-more-button">
                    More
                </button>
            </div>
        </div>

        <Loader v-show="loading" />
    </div>
</template>

<script>
    import { onBeforeMount } from 'vue'
    import { storeToRefs } from 'pinia'
    import {
        useAccountsStore,
        useAlertStore,
        useUserStore
     } from '@/store'
    import Account from '../models/Account'
    import Alert from '../models/Alert'
    import { SessionExpiredException } from '../utils/errors'
    import EditAccountModal from '../components/EditAccount.vue'
    import AccountItem from '../components/AccountItem.vue'
    import StackedAccountList from '../components/StackedAccountList.vue'
    import Loader from '../components/Loader.vue'
    
    export default {
        data() {
            return {
                searchQuery: this.$route.query.search || '', // Default search query is looked up from query string
                loading: true,
                pagination_offset: 0,
                editAccount: new Account(),
            }
        },
        components: {
            EditAccountModal,
            AccountItem,
            StackedAccountList,
            Loader,
        },
        setup() {
            const accountsStore = useAccountsStore()
            const { signOut } = useUserStore()
            const { openAlert } = useAlertStore()

            const { recentAccounts, accounts } = storeToRefs(accountsStore)
            const { loadCache, fetchRecentAccounts, fetchAccounts, getAccountsFilteredByQuery } = accountsStore

            onBeforeMount(async () => {
                await loadCache()
            })

            return {
                openAlert,
                fetchRecentAccounts,
                fetchAccounts,
                accountsStore,
                getAccountsFilteredByQuery,
                accounts,
                recentAccounts,
                signOut
            }
        },
        created() {
            this.accountsStore.$subscribe((mutation, state) => {
                this.loading = false;
            })
        },
        async mounted() {
            await this.fetchLatestAccounts();

            this.initPagination();
            this.loadMoreOnScrollToBottom();
        },
        methods: {
            fetchLatestAccounts: async function () {
                try {
                    await this.fetchRecentAccounts();
                } catch (error) {
                    if (error instanceof SessionExpiredException) {
                        this.openAlert(new Alert('Session expired', error.message, 'danger'));

                        this.signOut();
                        this.$router.go('/');
                    }
                    else {
                        this.openAlert(new Alert(error.name || 'Error while loading accounts', error.message, 'danger'));
                    }
                }

                try {
                    await this.fetchAccounts();
                } catch (error) {
                        console.log('acclist', error)

                    if (error instanceof SessionExpiredException) {
                        this.openAlert(new Alert('Session expired', error.message, 'danger'));

                        this.signOut();
                        this.$router.go('/');
                    }
                    else {
                        this.openAlert(new Alert(error.name || 'Error while loading accounts', error.message, 'danger'));
                    }
                }
            },

            removeTag: function (tag) {
                let newTags = this.$route.query.tags.split(',').map(x => x.trim());
                newTags.splice(newTags.indexOf(tag), 1);
                
                this.$router.push({name: 'Home', query: { tags: newTags.join(',') }});
            },

            updateSearchQuery: function (event)
            {
                this.searchQuery = event.target.value;
            },

            loadMore: function ()
            {
                this.pagination_offset += 1;
            },

            initPagination: function ()
            {
                this.pagination_offset = 20;
            },

            loadMoreOnScrollToBottom: function () {
                window.onscroll = () => {
                    let bottomOfWindow = (window.innerHeight + window.scrollY) >= document.body.offsetHeight;

                    if (bottomOfWindow) {
                        this.loadMore();
                    }
                };
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
			
            truncate: function (elements)
            {
                return elements//.slice(0, this.pagination_offset);
            }
        },
        computed: {
            accountsFilteredByQuery: function () {
                return this.getAccountsFilteredByQuery(this.searchQuery, this.$route.query.tags, true)
            },

            selectedTags: function () {
                return this.$route.query.tags ? this.$route.query.tags.split(',').map(x => x.trim()) : [];
            },

            isSearching: function () {
                return this.searchQuery || this.$route.query.tags;
            }
        }
    }
</script>

<style>
    /* Reduce search bar size when right sidebar is opened */
    .accountOpened .header-search,
    .settingsOpened .header-search {
        padding-right: 50%;
    }

    /* Reduce search bar size when left sidebar menu is opened */
    .menuDisplayed .header-search {
        padding-left: 250px;
    }

    .menuDisplayed.accountOpened .header-search,
    .menuDisplayed.settingsOpened .header-search{
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
        color: #162056;
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
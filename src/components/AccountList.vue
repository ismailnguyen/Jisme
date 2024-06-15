<template>
    <div
        class="progress"
        v-show="accountsFetchingProgression.isFetching"
        role="progressbar"
        aria-label="Fetching accounts..."
        :aria-valuenow="accountsFetchingProgression.totalFetched"
        aria-valuemin="0"
        :aria-valuemax="accountsFetchingProgression.total">
      <div class="progress-bar" :style="'width: ' + accountsFetchingProgression.progressionPercentage + '%'"></div>
    </div>

    <div id="page-content-wrapper" class="container-fluid">
        <header class="search-input-container">
            <div
            class="input-group mb-3"
            >
            <button
                class="btn search-left-btn"
                type="button"
                @click="onMenuOpened"
            >
                <i class="fa fa-solid fa-bars-staggered"></i>
            </button>
            <input
                class="form-control search-input" 
                type="search"
                ref="searchInput"
                v-model="searchQuery"
                autofocus
                placeholder="Search"
                :disabled="isLoading"
            />
            </div>
        </header>

        <AccountTypesList
            v-if="!isSearching" />

        <MostUsedTags
            v-if="!isSearching" />

        <RecentAccountList
            :isLoading="isLoading"
            v-if="!isSearching" />

        <FilteredAccountList
            :searchQuery="searchQuery"
            :filteredAccounts="filteredAccounts"
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
     } from '@/store'
    import LoadingAccountItem from '../components/LoadingAccountItem.vue'
    import AccountItem from '../components/AccountItem.vue'
    import RecentAccountList from '../components/RecentAccountList.vue'
    import FilteredAccountList from '../components/FilteredAccountList.vue'
    import AccountTypesList from '../components/AccountTypesList.vue'
    import MostUsedTags from '../components/MostUsedTags.vue'

    const MIN_SEARCH_QUERY_LENGTH = 3;
    
    export default {
        emits: ['menuOpened'],
        components: {
            LoadingAccountItem,
            AccountItem,
            RecentAccountList,
            FilteredAccountList,
            AccountTypesList,
            MostUsedTags
        },
        data() {
            return {
                searchQuery: this.$route.query.search || '', // Default search query is looked up from query string,
                isLoading: true,
                filteredAccounts: [],
                accountsFetchingProgression: {
                    isFetching: false,
                    totalFetched: 0,
                    total: 0
                },
                lastScrollTop: 0
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
            await this.fetchLatestAccounts();

            document.addEventListener('scroll', this.hideSearchBarOnScroll);
        },
        computed: {
            ...mapStores(useAccountsStore),
            ...mapWritableState(useAccountsStore, ['selectedTags', 'selectedTypes']),
            ...mapState(useAccountsStore, [
                'totalFetchedAccounts',
                'totalAccounts',
            ]),

            isSearching: function () {
                return (this.searchQuery 
                        && this.searchQuery.length >= MIN_SEARCH_QUERY_LENGTH)
                            || this.selectedTags.length > 0
                            || this.selectedTypes.length > 0;
            },
        },
        methods: {
            ...mapActions(useAccountsStore, [
                'loadCache',
                'getAccountsFilteredByQuery',
                'applyFilters',
                'fetchAccounts'
            ]),

            ...mapActions(useAlertStore, [
                'openAlert'
            ]),

            onMenuOpened: function () {
                this.$emit('menuOpened');
            },

            hideSearchBarOnScroll: function (event) {
                const scrollingElement = event.target.scrollingElement;

                var st = scrollingElement.scrollTop;

                var isScrollDown = st > this.lastScrollTop;

                // document.querySelector('.search-input-container').style.bottom = isScrollDown ? '-8rem' : '0.2rem';
                document.querySelector('.search-input-container').style.display = isScrollDown ? 'none' : 'block';

                this.lastScrollTop = st;
            },

            onAccountsLoaded: function (mutation, state) {
                this.isLoading = false;
                
                if (state.totalAccounts >= state.totalFetchedAccounts) {
                    this.displayProgress(state.totalFetchedAccounts, state.totalAccounts);

                    if (state.totalFetchedAccounts == state.totalAccounts) {
                        setTimeout(() => {
                            this.accountsFetchingProgression.isFetching = false;
                        }, 1000);
                    }
                }

                this.focusSearchInput();
            },

            displayProgress: function (current, total) {
                this.accountsFetchingProgression = {
                    isFetching: true,
                    totalFetched: current,
                    total: total,
                    progressionPercentage: Math.round((current / total) * 100)
                };
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
            },

            fetchLatestAccounts: async function () {
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
            }
        } 
    }
</script>

<style>
    .search-input-container {
            color: var(--color-text);
            padding: 20px 20px 20px 40px;
            z-index: 10;
            position: fixed;
            left: 0;
            right: 0;
            width: 60%;
            margin: auto;
            transition: all .5s;
        }

    @media (min-width: 767.98px) { 
        .search-input-container {
            top: 0.2rem;
        }
    }

    @media (max-width: 767.98px) { 
        .search-input-container {
            bottom: 0.2rem;
            width: 100%;
        }
    }

    .search-input-container .input-group {
        box-shadow: 2px 4px 12px rgb(0 0 0 / 20%);
        border-radius: var(--btn-border-radius);
    }

    .search-left-btn {
        color: #FFF;
        line-height: 2.5;
        background-color: var(--btn-color-background);
        background: linear-gradient(81.62deg, #2870ea 8.72%, #1b4aef 85.01%);
        backdrop-filter: blur(18px);
    }

    .search-left-btn:hover,
    .search-left-btn:active,
    .search-left-btn:focus {
        color: #FFF;
		box-shadow: 2px 4px 16px rgb(0 0 0 / 16%);
        transform: scale3d(1.01,1.01,1.01);
	}

    @media (prefers-color-scheme: dark) {
		.search-left-btn {
            background: RGBA(var(--bs-primary-rgb), var(--bs-bg-opacity, 1));
		}

        .search-left-btn:hover,
        .search-left-btn:active,
        .search-left-btn:focus {
            background: linear-gradient(81.62deg, #2870ea 8.72%, #1b4aef 85.01%);
        }
	}
    
    .search-input {
        border-radius: var(--btn-border-radius);
        color: #000;
        line-height: 2.5;
        background-color: var(--btn-color-background);
        backdrop-filter: blur(18px);
    }

	@media (prefers-color-scheme: dark) {
		.search-input {
			box-shadow: none;
            background-color: #3D3D3D;
            color: rgb(162, 162, 162);
            border: 1px solid transparent;
		}
	}

    .search-input::placeholder {
        color: #818182;
    }
	
	@media (prefers-color-scheme: dark) {	
		.search-input::placeholder {
            color: rgb(162, 162, 162);
		}
	}

    .search-input:hover,
    .search-input:active,
    .search-input:focus {
        background-color: var(--btn-color-background);
		box-shadow: 2px 4px 16px rgb(0 0 0 / 16%);
        transform: scale3d(1.01,1.01,1.01);
	}

    @media (prefers-color-scheme: light) {
        .search-input:hover,
		.search-input:focus-within,
        .search-input:active,
        .search-input:focus {
            border: none !important;
        }
    }
	
	@media (prefers-color-scheme: dark) {
		.search-input:hover,
		.search-input:focus-within,
		.search-input:active,
		.search-input:focus {
            border-color: gray;
            color: rgb(162, 162, 162);
            background: #464646;
            transform: none;
		}
	}
</style>
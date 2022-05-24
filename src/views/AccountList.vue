<template>
    <div id="page-content-wrapper" class="container-fluid">
        <EditAccountModal 
            :user="user" 
            :account="editAccount" 
            v-on:showAlert="onShowAlert"
            v-on:toggleEditAccountModal="onEditAccountModalToggled"
            v-if="showEditAccountModal" />

        <header class="row header-search justify-content-center" v-if="!loading">
            <div class="col-xs-12 col-lg-6">
                <input class="form-control searchBar" :value="searchQuery" @input="updateSearchQuery" type="search" placeholder="Search" autofocus>
            </div>
        </header>

        <div class="main-container container-fluid" v-if="isSearching">
            <span
                class="badge badge-pill badge-secondary"
                v-for="(tag, index) in selectedTags"
                v-bind:key="index"
                @click="removeTag(tag)">
                <i class="fa fa-close"></i> {{ tag }}
            </span>

            <div class="row" v-if="!loading">
                <AccountItem 
                    v-for="(account, index) in truncate(accountsFilteredByQuery)"
                    v-bind:key="index"
                    v-on:toggleEditAccountModal="onEditAccountModalToggled"
                    :account="account" />
            </div>
        </div>

        <MiniAccountList
            :accounts="mostAndLastOpened"
            title="Frequently used"
            v-on:toggleEditAccountModal="onEditAccountModalToggled"
            v-if="!isSearching && !loading" />

        <div class="row loadMore justify-content-center" v-if="accountsFilteredByQuery.length > truncate(accountsFilteredByQuery).length && !loading && searchQuery">
            <div class="col-xs-12 col-lg-6">
                <button id="loadMore" @click="loadMore()" type="button" class="btn btn-lg btn-light btn-block load-more-button">
                    More
                </button>
            </div>
        </div>

        <Loader v-if="loading" :isVisible="loading" />
    </div>
</template>

<script>
    import Account from '../models/Account'
    import FilterService from '../services/FilterService'
    import EditAccountModal from '../components/EditAccount.vue'
    import AccountItem from '../components/AccountItem.vue'
    import MiniAccountList from '../components/MiniAccountList.vue'
    import Loader from '../components/Loader.vue'
    
    export default {
        props: {
            user: Object
        },
        data() {
            return {
                searchQuery: this.$route.query.search || '', // Default search query is looked up from query string
                loading: true,
                pagination_offset: 0,
                editAccount: new Account(),
                showEditAccountModal: false
            }
        },
        components: {
            EditAccountModal,
            AccountItem,
            Loader,
            MiniAccountList
        },
        created() {
            this.$store.watch((state) => state.accounts, () => {
                this.loading = false;
            });
        },
        mounted() {
            this.initPagination();
            this.loadMoreOnScrollToBottom();
        },
		watch: {
			showEditAccountModal: function () {
				this.triggerModalOpened(this.showEditAccountModal);
			}
		},
        methods: {
            removeTag: function (tag) {
                let newTags = this.$route.query.tags.split(',').map(x => x.trim());
                newTags.splice(newTags.indexOf(tag), 1);
                
                this.$router.push({name: 'AccountList', query: { tags: newTags.join(',') }});
            },

            updateSearchQuery: function (event)
            {
                this.searchQuery = event.target.value;
                this.$emit('searchQueryUpdated', this.searchQuery)
            },

            loadMore: function ()
            {
                this.pagination_offset += 1;
            },

            initPagination: function ()
            {
                this.pagination_offset = 20;
            },

            onEditAccountModalToggled: function (account)
            {
                this.editAccount = this.showEditAccountModal ? new Account() : account;

                this.showEditAccountModal = !this.showEditAccountModal;
            },

            onShowAlert: function (alertDetails)
            {
                this.$emit('showAlert', alertDetails);
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
			
			triggerModalOpened: function (isModalOpened) {
				if (isModalOpened) {
					document.body.classList.add('modal-open');
				}
				else {
					document.body.classList.remove('modal-open');
				}
			},

            truncate: function (elements)
            {
                return elements.slice(0, this.pagination_offset);
            }
        },
        computed: {
            accountsFilteredByQuery: function () {
                const filterService = new FilterService(this.$store.state.accounts);
                filterService.filterByTags(this.$route.query.tags);
                filterService.filterByQuery(this.searchQuery);
                filterService.sortByLastOpened();

                return filterService.getAccounts();
            },

            lastOpenedAccounts: function () {
                const filterService = new FilterService(this.$store.state.accounts);
                filterService.sortByLastOpened();

                return filterService.getAccounts();
            },

            mostAndLastOpened: function () {
                let mostAndLastOpened = this.mostOpenedAccounts.slice(0, 4);
                const lastOpenedAccounts = this.lastOpenedAccounts;
                const MAX_ACCOUNTS_TO_SHOW = 8;

                lastOpenedAccounts.forEach(account => {
                    if (mostAndLastOpened.map(a => a._id).indexOf(account._id) == -1 && mostAndLastOpened.length < MAX_ACCOUNTS_TO_SHOW) {
                        mostAndLastOpened.push(account);
                    } 
                });          
                
                return mostAndLastOpened;
            },

            mostOpenedAccounts: function () {
                const filterService = new FilterService(this.$store.state.accounts);
                filterService.sortByOpenedCount();

                return filterService.getAccounts();
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
    .modal {
        z-index: 1;
        background: inherit;
        overflow: hidden;
        display: block;
        z-index: 10500;
        backdrop-filter: blur(10px);
        box-shadow: 0 0 1rem 0 rgba(0, 0, 0, .2);   
    }

    .modal:before {
        content: "";
        position: absolute;
        background: inherit;
        z-index: -1;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        box-shadow: inset 0 0 2000px rgba(255, 255, 255, .5);
        filter: blur(10px);
        margin: -20px;
    }

    .modal-header {
        padding-bottom: 0;
        border: none;
    }

    .modal-dialog {
        width: 100%;
        height: 100%;
        padding: 0;
    }

    .modal-content {
        border-radius: 0;
        color: #162056;
        background: #f8f9fa;
        height: auto;
        box-shadow: 0 0 2rem rgba(0,0,255,.1);
    }

    .modal-content, .modal-footer {
      border: none;
    }
	
	@media (min-width: 576px) {
		.modal-dialog {
			max-width: 80%;
		}
	}

    @media(min-width:768px) {
        .modal-content {
            border-radius: 1.55rem;
            min-height: 90%;
        }
    }
 
    @media (max-width: 767.98px) { 
      .modal-dialog {
        margin: 0;
      }

      .modal-content {
            border-radius: 0;
            min-height: 100%;
        }
    } 
        
    .pop-enter-active,
    .pop-leave-active {
        transition: transform 0.3s cubic-bezier(0.5, 0, 0.5, 1), opacity 0.3s linear;
    }

    .pop-enter,
    .pop-leave-to {
        opacity: 0;
        transform: scale(0.3) translateY(-50%);
    }

    /* Reduce search bar size when sidebar menu is opened */
    .menuDisplayed .header-search {
        padding-right: 250px;
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
		}
	}

    .searchBar::placeholder {
        color: #818182;
    }
	
	@media (prefers-color-scheme: dark) {	
		.searchBar::placeholder {
			color: #e4e6eb;
		}
	}

    .searchBar:hover,
    .searchBar:active,
    .searchBar:focus {
        border: none !important;
        background-color: #ced4da70;
		box-shadow: inset -4px -4px 10px rgba(255,255,255,0.5), inset 4px 4px 10px rgba(0,0,0,0.1);
	}
	
	@media (prefers-color-scheme: dark) {
		.searchBar:hover,
		.searchBar:active,
		.searchBar:focus {
			color: #fff;
			box-shadow: none;
		}
	}

    .load-more-button {
		width: 35%;
        border-radius: 100px;
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
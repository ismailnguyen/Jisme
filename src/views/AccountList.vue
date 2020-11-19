<template>
    <div class="container-fluid">
        <AddAccountModal 
            :user="user" 
            v-on:showAlert="onShowAlert"
            v-on:toggleAddAccountModal="onAddAccountModalToggled"
            v-if="showAddAccountModal" />

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

        <div class="main-container container-fluid">
            <div class="row" v-if="!loading">
                <AccountItem 
                    v-for="(account, index) in truncatedAccounts"
                    v-bind:key="index"
                    v-on:toggleEditAccountModal="onEditAccountModalToggled"
                     :user="user" 
                    :account="account" />
            </div>

            <div class="row loadMore justify-content-center" v-if="sortedAccounts.length > truncatedAccounts.length && !loading">
                <div class="col-xs-12 col-lg-6">
                    <button @click="loadMore()" type="button" class="btn btn-lg btn-light btn-block load-more-button">
                        More
                    </button>
                </div>
            </div>

            <Loader :isVisible="loading" />
        </div>

        <a class="floating-button" @click="showAddAccountModal = !showAddAccountModal" v-if="!loading"><i class="fa fa-plus float-plus"></i></a>
    </div>
</template>

<script>
    import { getUser } from '../utils/auth'
    import Account from '../models/Account'
    import UserService from '../services/UserService'
    import AccountsService from '../services/AccountsService'
    import FilterService from '../services/FilterService'
    import AddAccountModal from '../components/AddAccount.vue'
    import EditAccountModal from '../components/EditAccount.vue'
    import AccountItem from '../components/AccountItem.vue'
    import Loader from '../components/Loader.vue'
    import Alert from '../models/Alert'
    
    export default {
        data()
        {
            return {
                user: getUser(),
                searchQuery: '',
                currentTag: this.$store.state.currentTag,
                loading: true,
                pagination_offset: 0,
                editAccount: new Account(),
                filterService: {},
                showAddAccountModal: false,
                showEditAccountModal: false
            }
        },
        components: {
            AddAccountModal,
            EditAccountModal,
            AccountItem,
            Loader
        },
        created() {
            this.$store.watch((state) => state.accounts, () => {
                this.loading = false;
            });
        },
        mounted() {
            this.initPagination();

            this.fetchAccounts();

            this.loadMoreOnScrollToBottom();
        },
		watch: {
			showAddAccountModal: function () {
				this.triggerModalOpened(this.showAddAccountModal);
			},
			showEditAccountModal: function () {
				this.triggerModalOpened(this.showEditAccountModal);
			}
		},
        methods: {
            fetchAccounts: function ()
            {
                let accountsService = new AccountsService(this.user, this.$store);

                accountsService.get();
            },

            updateSearchQuery: function (event)
            {
                this.searchQuery = event.target.value;
            },

            loadMore: function ()
            {
                this.pagination_offset += 10;
            },

            initPagination: function ()
            {
                this.pagination_offset = 10;
            },

            onAddAccountModalToggled: function () {
                this.showAddAccountModal = !this.showAddAccountModal;
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
                    let bottomOfWindow = document.documentElement.scrollTop + window.innerHeight === document.documentElement.offsetHeight;

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
			}
        },
        computed: {
            truncatedAccounts: function ()
            {
                return this.sortedAccounts.slice(0, this.pagination_offset);
            },
            sortedAccounts: function ()
            {
                this.filterService = new FilterService(this.$store.state.accounts);

                this.filterService.filterByTag(this.currentTag);
                this.filterService.filterByQuery(this.searchQuery);
                this.filterService.sortByName();

                return this.filterService.getAccounts();
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

    .header-search {
        margin: auto;
    }
    
    .searchBar {
        border-radius: 2rem;
        color: #818182;
        line-height: 2.5;
        box-shadow: 20px 20px 60px #d9d9d9, -20px -20px 60px #ffffff;
        backdrop-filter: blur(4px);
    }

    .searchBar::placeholder {
        color: #818182;
    }

    .searchBar:hover,
    .searchBar:active,
    .searchBar:focus {
        border: none !important;
        background-color: #ced4da70;
		box-shadow: inset -4px -4px 10px rgba(255,255,255,0.5), inset 4px 4px 10px rgba(0,0,0,0.1);
	}

    .load-more-button {
        border-radius: 100px;
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

    .floating-button {
        position:fixed;
        cursor: pointer;
        width: 48px;
        height: 48px;
        bottom: 15px;
        right: 15px;
        border-radius: 100px;
        margin-left: auto;
        margin-right: auto;
        margin-top: 100px;
        text-align: center;
        background-color: #fff;
        box-shadow: 9px 9px 16px rgb(163,177,198,0.6), -9px -9px 16px  rgba(255,255,255, 0.5);
    }

    .floating-button:hover {
		box-shadow: inset -4px -4px 10px rgba(255,255,255,0.5), inset 4px 4px 10px rgba(0,0,0,0.1);
	}

    .float-plus {
        color: #162056;
        margin-top:17px;
    }
</style>
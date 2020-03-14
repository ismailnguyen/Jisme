<template>
    <div class="container-fluid">
        <AddAccountModal :user="user" v-on:showAlert="onShowAlert" />
        <EditAccountModal :user="user" :account="editAccount" v-on:showAlert="onShowAlert" />

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

            <Loader :isVisible="loading" />
        </div>

        <a href="#" class="floating-button" data-toggle="modal" data-target="#addAccountModal" v-if="!loading"><i class="fa fa-plus float-plus"></i></a>
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
                filterService: {}
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

            if (navigator.onLine)
            {
                this.fetchAccounts();
            }

            $('#addAccountModal').on('shown.bs.modal', function () 
            {
                $('#platform_input').trigger('focus')
            });

            this.loadMoreOnScrollToBottom();
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

            onEditAccountModalToggled: function (account)
            {
                this.editAccount = account;

                $('#editAccountModal').modal();
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
    body.modal-open .main-container {
      -webkit-filter: blur(2.5px);
      -moz-filter: blur(2.5px);
      -o-filter: blur(2.5px);
      -ms-filter: blur(2.5px);
      filter: blur(2.5px);
    }

    .modal {
        z-index: 10500;
    }

    .modal-dialog {
        width: 100%;
        height: 100%;
        padding: 0;
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
            border-radius: 1.55rem;
            min-height: 100%;
        }
    }

    .modal-content {
        border-radius: 0;
    }

    .modal-content {
        color: #007bff;
        background: #fff;
        height: auto;
        box-shadow: 0 0 2rem rgba(0,0,255,.1);
    }

    .modal-content, .modal-footer {
      border: none;
    }

    .header-search {
        margin: auto;
    }
    
    .searchBar {
        border-radius: 2rem;
        color: #818182;
        line-height: 2.5;
        box-shadow: 20px 20px 60px #d9d9d9, -20px -20px 60px #ffffff;
    }

    .searchBar::placeholder {
        color: #818182;
    }

    .searchBar:active,
    .searchBar:focus {
        border: none !important;
        background-color: #ced4da70;
        box-shadow:  20px 20px 60px #a3a3a3, 
             -20px -20px 60px #dddddd;
    }

    .floating-button {
        position:fixed;
        width:60px;
        height:60px;
        bottom:15px;
        right:15px;
        border-radius:100px;
        margin-left: auto;
        margin-right: auto;
        margin-top:100px;
        text-align:center;
        background-color:#E0E5EC;
        box-shadow: 9px 9px 16px rgb(163,177,198,0.6), -9px -9px 16px  rgba(255,255,255, 0.5);
    }

    .float-plus {
        color: #007bff;
        margin-top:22px;
    }
</style>
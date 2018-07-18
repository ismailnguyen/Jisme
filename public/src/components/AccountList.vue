<template>
    <div id="page-content-wrapper">
        <header class="header-search row justify-content-center">
            <div class="col-xs-12 col-lg-6">
                <input class="form-control searchBar" v-model="search" type="search" placeholder="Search" autofocus>
            </div>
        </header>

        <div class="main-container container-fluid">
            <div class="row accountsList">
                <AccountItem v-for="(account, index) in truncedAccounts" v-bind:key="index" :account="account" :user="user" />
            </div>

            <div class="row loadMore" v-if="sortedAccounts.length > truncedAccounts.length">
                <div class="col-12">
                    <button @click="loadMore" type="button" class="btn btn-lg btn-light btn-block btnLoadMore">More </button>
                </div>
            </div>

            <div class="progress" v-if="loading">
                <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" style="width: 75%"></div>
            </div>
        </div>

        <a href="#" class="floating-button" data-toggle="modal" data-target="#AddModal"><i class="fa fa-plus float-plus"></i></a>
    </div>
</template>

<script>
    import { getUser } from '../utils/auth'
    import { sortByName } from '../utils/sort'
    import UserService from '../services/UserService'
    import AccountsService from '../services/AccountsService'
    import AccountItem from './AccountItem.vue'
    import Datepicker from 'vuejs-datepicker'
    
    export default {
        data()
        {
            return {
                user: getUser(),
                search: '',
                currentTag: this.$store.state.currentTag,
                currentDate: new Date(),
                loading: true,
                pagination_offset: 0,
                accounts: []
            }
        },
        components: {
            AccountItem,
            Datepicker
        },
        methods: {
            fetchAccounts: function ()
            {
                let accountsService = new AccountsService(this.user, this.$store);

                accountsService.get()
                .then(this.setOldestDate);
            },

            setOldestDate: function (accounts)
            {
                accounts.forEach(account =>
                {
                    let createdDate = new Date(account.created_date);
                    if (createdDate < this.currentDate)
                    {
                        this.currentDate = createdDate;
                    }
                });

                this.accounts = this.$store.state.accounts.slice(0, this.pagination_offset);

                this.loading = false
            },

            filterByTag: function (account, tag)
            {
                this.initPagination();

                if (!tag || tag === 'All')
                {
                    return true;
                }

                if (account.tags.includes(tag))
                {
                    return true;
                }

                return false;
            },

            filterByQuery: function (account, query)
            {
                this.initPagination();

                if (!query) {
                    return true;
                }

                query = query.toLowerCase();

                let platform = account.platform.toLowerCase();
                let displayPlatform = account.displayPlatform.toLowerCase();
                let login = account.login.toLowerCase();
                let password = account.password.toLowerCase();
                let tags = account.tags.toLowerCase();

                if (platform.includes(query))
                {
                    return true;
                }

                if (displayPlatform.includes(query))
                {
                    return true;
                }

                if (login.includes(query))
                {
                    return true;
                }

                if (password.includes(query))
                {
                    return true;
                }

                if (tags.includes(query))
                {
                    return true;
                }

                return false;
            },

            filterByDate: function (account, date)
            {
                this.initPagination();

                let currentDate = new Date(date);
                let createdDate = new Date(account.created_date);

                return createdDate >= currentDate;
            },

            loadMore: function ()
            {
                this.pagination_offset += 10;
            },

            initPagination: function ()
            {
                this.pagination_offset = 10;
            }
        },
        mounted() {
            if (navigator.onLine)
            {
                this.fetchAccounts();
            }            
    
            this.$store.watch((state) => state.accounts, () => {
                this.setOldestDate(this.$store.state.accounts);
            })

            this.initPagination();
        },
        computed: {
            truncedAccounts: function ()
            {
                let accounts = this.sortedAccounts;

                return accounts.slice(0, this.pagination_offset);
            },
            sortedAccounts: function ()
            {
                let accounts = this.$store.state.accounts;

                accounts = accounts.sort((account1, account2) => 
                    sortByName(account1.displayPlatform, account2.displayPlatform)
                );

                accounts = accounts.filter(account => this.filterByTag(account, this.currentTag));
                accounts = accounts.filter(account => this.filterByQuery(account, this.search));
                accounts = accounts.filter(account => this.filterByDate(account, this.currentDate));

                return accounts;
            },
            formattedDate: function ()
            {
                var year = this.currentDate.getFullYear();

                var month = this.currentDate.getMonth() + 1;
                if (month < 10)
                {
                    month = '0' + month;
                }

                var day = this.currentDate.getDate();
                if (day < 10)
                {
                    day = '0' + day;
                }

                return year + '-' + month + '-' + day;
            }
        },
        watch:
        {
            currentDate: function (newValue)
            {
                this.currentDate = newValue;
            }
        }
    }
</script>

<style>
    .accountsList {
        margin-bottom: 40px
    }

    .loadMore {
        bottom: 0;
        width: 100%;
        padding-bottom: 70px;
        margin: auto;
    }

    .btnLoadMore {
        background: #ced4da70;
        border: none;
    }

    .floating-button{
        position:fixed;
        width:60px;
        height:60px;
        bottom:65px;
        right:30px;
        background-color:#007bff;
        color:#FFF;
        border-radius:50px;
        text-align:center;
        box-shadow: 2px 2px 3px #999;
    }

    .float-plus{
        color: #FFF;
        margin-top:22px;
    }
</style>
<template>
<div id="wrapper">
    <div class="modal fade" id="AddModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
      <div class="modal-dialog">
          <AddAccount :user="user" />
      </div>
    </div>

    <div id="sidebar-wrapper">
        <ul class="sidebar-nav">
            <li class="sidebar-brand container">
                <div class="row">
                    <div class="col-xs-4"><img class="brandLogo" src="/images/touch/favicon64.png"></div>
                    <div class="col-xs-8 brand"><h1>Jisme</h1></div>
                </div>
                <div class="row">
                    <div class="col-xs-12 username">{{user.email}}</div>
                </div>
            </li>
            <li><hr /></li>
            <li>
                <h4 class="display-5" data-toggle="collapse" data-target="#collapseTags" aria-expanded="false" aria-controls="collapseTags" @click="showTags = !showTags">
                    {{ showTags ? '&lt;' : '&gt;' }} Tags
                </h4>
            </li>
            <li id="collapseTags" class="collapse">
                <h6>
                    <router-link :to="{ name: 'Dashboard' }" class="menu-toggle" v-bind:class="{ 'active': currentTag == 'All' }">
                        All <span class="badge badge-light">{{ sortedAccounts.length }}</span>
                    </router-link>
                </h6>

                <h6 v-for="(tag, index) in sortedTags" v-bind:key="index">
                    <router-link :to="{ name: 'Tag', params: { tag: tag } }" class="menu-toggle" v-bind:class="{ 'active': currentTag == tag }">
                        {{ tag }} <span class="badge badge-light">{{ sortedAccounts.filter(account=> account.tags.includes(tag)).length }}</span>
                    </router-link>
                </h6>
            </li>
            <li><hr /></li>
            <li><a href="/" @click="signOut()"><span class="btn btn-outline-danger">Sign out</span></a></li>
        </ul>
    </div>

    <div id="page-content-wrapper">
        <header>
            <div class="row">
                <div class="col-xs-1 header-logo justify-content-center">
                    <a href="#" class="menu-toggle">
                        <img src="/images/menu.png" alt="Menu" title="Menu" />
                    </a>
                </div>

                <div class="col-xs-10">
                    <div class="col-12 header-date">
                        <input type="date" max="3000-12-31" :value="formattedDate" :min="formattedDate" class="form-control datepicker">
                    </div> 

                    <div class="col-12 header-tag">
                        <h1>{{ currentTag }}</h1>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-11 header-search">
                    <input class="form-control searchBar" v-model="search" type="search" placeholder="Search" autofocus>
                </div>
                <div class="col-1 header-addButton row justify-content-center">
                    <button class="btn btn-outline-primary" data-toggle="modal" data-target="#AddModal">+</button>
                </div>
            </div>
        </header>

        <div class="main-container container-fluid">
            <div class="row accountsList">
                <Account v-for="(account, index) in truncedAccounts" v-bind:key="index" :account="account" :user="user" />
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
    </div>

    <div id="alert" class="alert alert-success alert-dismissible fade" role="alert">
        <p id="alert-content"></p>
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    </div>

    <div class="overlay"></div>
</div> 
     
</template>

<script>
    import { getUser } from '../utils/auth'
    import { sortByName } from '../utils/sort'
    import UserService from '../services/UserService'
    import AccountsService from '../services/AccountsService'
    import AddAccount from './AddAccount.vue'
    import Account from './Account.vue'
    import Datepicker from 'vuejs-datepicker'
    
    export default {
        data()
        {
            return {
                user: getUser(),
                search: '',
                currentDate: new Date(),
                loading: true,
                pagination_offset: 0,
                accounts: [],
                showTags: false
            }
        },
        methods: {
            signOut: function () {
                let userService = new UserService();

                userService.logout();
            },

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
        components: {
            AddAccount,
            Account,
            Datepicker
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

            $(".menu-toggle").click(function(e)
            {
                e.preventDefault();
                $("#wrapper").toggleClass("toggled");
            });

            $(window).scroll(function()
            {
                if ($(document).scrollTop() > 50) {
                    $('.header-date').hide();
                    $('.header-logo').hide();
                    $('.header-tag').hide();
                    $('.header-addButton').hide();
                    
                    $('.header-search').addClass('col-12');
                    $('.header-search').removeClass('col-11');
                    
                } else {
                    $('.header-date').show();
                    $('.header-logo').show();
                    $('.header-tag').show();
                    $('.header-addButton').show();
                    
                    $('.header-search').addClass('col-11');
                    $('.header-search').removeClass('col-12');
                }
            });
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
        
            sortedTags: function ()
            {
                var tags = [];
		
                this.$store.state.accounts.forEach(function(account)
                {
                    let listTags = account.tags.split(',');

                    listTags.forEach(function(tag)
                    {
                        tag = tag.trim();
                        
                        if (tags.indexOf(tag) == -1)
                        {
                            tags.push(tag);
                        }
                    });
                });
                
                return tags.sort(sortByName);
            },

            currentTag: function ()
            {
                let tag = this.$route.params.tag;

                if (!tag) {
                    tag = 'All';
                }

                return tag;
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
    * {
        margin: 0;
        position: relative;
    }

    body {
      color: black;
      background: #f5f5f5;
    }

    .main-container {
        padding-top: 176px;
    }
	  
    header {
        width: 100%;
        position: fixed;
        color: #007bff;
        padding: 20px;
        z-index: 999;
    }

    header::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        background: #fff;
        opacity:.75;
        z-index: -1;
        box-shadow: 0 0 2rem rgba(0, 0, 255, .1);
    }
	
    .sidebar-brand .brand, .header-tag, .header-date, .header-search, .header-addButton {
        margin: auto;
    }

    .username {
        color: #6c757d;
        font-weight: lighter;
    }

    .header-tag, .header-date, .header-search, .header-addButton {
        -webkit-transition: all 0.4s ease;
        transition: all 0.4s ease;
    }

    .header-date .text-muted {
      color: #000 !important;
    }

    .accountsList {
        margin-bottom: 40px
    }

    .loadMore {
        bottom: 0;
        width: 100%;
    }

    .btnLoadMore {
        background: #ced4da70;
        border: none;
    }

    .alert {
        position: fixed;
        bottom: 20px;
        right: 20px;
    }

    #wrapper.toggled .main-container, body.modal-open .main-container {
      -webkit-filter: blur(2.5px);
      -moz-filter: blur(2.5px);
      -o-filter: blur(2.5px);
      -ms-filter: blur(2.5px);
      filter: blur(2.5px);
    }

    .brandLogo {
      border: 1px solid #8181821f;
      background: #ffffff61;
      border-radius: 50px;
    }

    .modal-dialog {
      width: 100%;
      height: 100%;
      padding: 0;
    }

    @media(min-width:768px) {
        .modal-content {
            border-radius: 1.55rem;
        }
    }
 
    @media (max-width: 767.98px) { 
      .modal-dialog {
        margin: 0;
      }
    }

    .modal-content {
        border-radius: 0;
    }

    .modal-content, #sidebar-wrapper {
        color: #007bff;
        background: #fff;
        height: auto;
        min-height: 100%;
        box-shadow: 0 0 2rem rgba(0,0,255,.1);
    }

    .modal-content, .modal-footer {
      border: none;
    }

    .form-control {
        color: #fff;
        border: none;
        border-radius: 0.75rem;
        background-color: #ced4da70;
    }

    .form-control::placeholder {
        color: #fff;
        opacity: 1;
    }

    .datepicker {
        background: none;
        color: #6c757d;
    }

    .searchBar::placeholder {
        color: #818182;
    }

    #wrapper {
        padding-left: 0;
        -webkit-transition: all 0.5s ease;
        -moz-transition: all 0.5s ease;
        -o-transition: all 0.5s ease;
        transition: all 0.5s ease;
    }

    #wrapper.toggled {
        padding-left: 300px;
    }

    #sidebar-wrapper {
        z-index: 1000;
        position: fixed;
        left: 300px;
        width: 0;
        height: 100%;
        margin-left: -300px;
        overflow-y: auto;
        -webkit-transition: all 0.5s ease;
        -moz-transition: all 0.5s ease;
        -o-transition: all 0.5s ease;
        transition: all 0.5s ease;
    }

    #wrapper.toggled #sidebar-wrapper {
        width: 300px;
    }

    #page-content-wrapper {
        width: 100%;
        position: absolute;
    }

    #wrapper.toggled #page-content-wrapper {
        position: absolute;
        margin-right: -300px;
    }

    .sidebar-nav {
        position: absolute;
        top: 0;
        width: 300px;
        margin: 0;
        padding: 0;
        list-style: none;
    }

    .sidebar-nav li {
        text-indent: 20px;
        line-height: 40px;
    }

    .sidebar-nav li a {
        display: block;
        text-decoration: none;
        color: #999999;
    }

    .sidebar-nav li a:hover, .sidebar-nav li .active {
        text-decoration: none;
        color: #fff;
        background: rgba(255, 255, 255, 0.2);
    }

    .sidebar-nav li a:active, .sidebar-nav li a:focus {
        text-decoration: none;
    }

    .sidebar-nav>.sidebar-brand {
        font-size: 18px;
        line-height: 60px;
        padding-top: 15px;
    }

    .sidebar-nav>.sidebar-brand a {
        color: #999999;
    }

    .sidebar-nav>.sidebar-brand a:hover {
        color: #fff;
        background: none;
    }

    .sidebar hr {
        border-top: 1px solid rgba(255, 255, 255, 0.3);
    }

    @media(min-width:768px) {
        #wrapper {
            padding-left: 0;
        }
        #wrapper.toggled {
            padding-left: 300px;
        }
        #sidebar-wrapper {
            width: 0;
        }
        #wrapper.toggled #sidebar-wrapper {
            width: 300px;
        }
        #page-content-wrapper {
            position: relative;
        }
        #wrapper.toggled #page-content-wrapper {
            position: relative;
            margin-right: 0;
        }
    }
</style>
<template>
    <div class="di">   
        <div class="em brh">
            <nav class="bro">
                <div class="bri">
                    <button class="bqe bqg brj" type="button" data-toggle="collapse" data-target="#nav-collapse">
                        <span class="aep">Toggle nav</span>
                    </button>
                    <a class="brk bsi" href="./">
                        <span class="bv brl"><img src="/images/touch/favicon64.png"/></span>
                        <span class="bv brl">Jisme</span>
                    </a>
                </div>

                <form class="brm">
                    <input class="form-control" type="text" v-model="search" id="search" placeholder="Search..." autofocus />
                    <button class="po">
                        <span class="bv bje"></span>
                    </button>
                </form>

                <div class="collapse bql" id="nav-collapse">
                    <ul class="nav qq nav-stacked xx">
                        <li class="ayx">Tags</li>

                        <li class="qp">
                            <router-link :to="{ name: 'Dashboard' }" class="qn" v-bind:class="{ 'active': currentTag == 'All' }">All</router-link>                            
                        </li>
                        
                        <li class="qp" v-for="(tag, index) in sortedTags" v-bind:key="index">
                            <router-link :to="{ name: 'Tag', params: { tag: tag } }" class="qn" v-bind:class="{ 'active': currentTag == tag }">{{ tag }}</router-link>
                        </li>

                        <li class="ayx">
                            <hr class="bsj afx">
                        </li>
                        
                        <li class="qp">
                            <button class="ce tb" @click="signOut">Sign out</button>
                        </li>
                    </ul>
                </div>
            </nav>
        </div>
        
        <div class="es bsk" v-show="user">

            <button @click="addAccount" v-show="!showAddAccountForm" class="ce pb ahr floating-btn">New</button>
            <button @click="cancelAddAccount" v-show="showAddAccountForm" class="ce tb ahr floating-btn">Cancel</button>

            <div class="brv">
                <div class="brw">
                    <h6 class="bry">{{ user.email }}</h6>
                    <h2 class="brx">{{ currentTag }}</h2>
                </div>

                <div class="qb brz">
                    <div class="ayt brg">
                        <datepicker id="date" v-model="currentDate"></datepicker>
                        <span class="bv bck"></span>
                    </div>
                </div>
            </div>

            <div class="nu">

                <table class="ck">
                    
                    <AddAccount v-show="showAddAccountForm" :user="user" @isFinished="onAccountAdd" />
                
                    <tr>
                        <th>Platform</th>
                        <th>Login</th>
                        <th>Action</th>
                    </tr>

                    <Account v-for="(account, index) in sortedAccounts" v-bind:key="index" :account="account" :tag="currentTag" :date="currentDate" :query="search" :user="user" />
                    
                </table>

                <hr class="bsj afx">
                
                &copy; 2018 Jisme
            
            </div>
        </div>
    </div>
    <!-- <div>
        <h2 class="mdc-typography--display2">Jisme</h2>
        
        <div class="mdc-text-field" data-mdc-auto-init="MDCTextField">
            <input type="text" class="mdc-text-field__input" id="search-input" v-model="search" />
            <label for="search-input" class="mdc-text-field__label">Search...</label>
        </div>
    </div> -->
</template>

<script>
    import { getUser } from '../utils/auth'
    import { sortByName } from '../utils/sort'
    import UserService from '../services/UserService'
    import AccountsService from '../services/AccountsService'
    import AddAccount from './AddAccount.vue'
    import Account from './Account.vue'
    import Datepicker from 'vuejs-datepicker';
    
    export default {
        data()
        {
            return {
                user: getUser(),
                search: '',
                currentDate: new Date(),
                showAddAccountForm: false
            }
        },
        methods: {
            signOut: function () {
                let userService = new UserService();

                userService.logout();
            },
            cancelAddAccount: function () {
                this.showAddAccountForm = false;
            },
            addAccount: function () {
                this.showAddAccountForm = true;
            },
            onAccountAdd: function (isFinished) {
                this.showAddAccountForm = !isFinished;
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
            }
        },
        components: {
            AddAccount,
            Account,
            Datepicker
        },
        mounted() {
            //mdc.autoInit()

            if (navigator.onLine)
            {
                this.fetchAccounts();
            }            
    
            this.$store.watch((state) => state.accounts, () => {
                this.setOldestDate(this.$store.state.accounts);
            })
        },
        computed: {
            sortedAccounts: function () {
                let accounts = this.$store.state.accounts;

                return accounts.sort((account1, account2) => 
                    sortByName(account1.displayPlatform, account2.displayPlatform)
                );
            },
        
            sortedTags: function () {
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

            currentTag: function () {
                let tag = this.$route.params.tag;

                if (!tag) {
                    tag = 'All';
                }

                return tag;
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
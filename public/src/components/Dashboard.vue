<template>
    <div>
        <h3>Jisme</h3>

        <input type="text" v-model="search" />
        <button class="btn btn-danger btn-sm signout-btn" @click="signOut">Sign Out</button>

        <hr>
        <AddAccount />
        <hr>

        <div class="col-md-12">
            <Account v-for="(account, index) in filteredAccounts" v-bind:key="index" :account="account" :query="query" />
        </div>

    </div>
</template>

<script>
    import { logout, getUser } from '../utils/auth'
    import AccountsService from '../services/AccountsService'
    import AddAccount from './AddAccount.vue'
    import Account from './Account.vue'
    
    export default {
        data()
        {
            return {
                accounts: [],
                search: ''
            }
        },
        methods: {
            signOut() {
                logout();
            },
            getDecryptedAccount(account, token)
            {
                var encryptedAccount = JSON.parse(JSON.stringify(account)); // Clone object without reference
            
                encryptedAccount['platform'] = decrypt(account.platform, token);
                encryptedAccount['login'] = decrypt(account.login, token);
                encryptedAccount['password'] = decrypt(account.password, token);
                encryptedAccount['tags'] = decrypt(account.tags, token);
            
                return encryptedAccount;
            }
        },
        components: {
            AddAccount,
            Account
        },
        mounted() {
            let accountsService = new AccountsService();
            accountsService.get(getUser())
            .then(response => {
                response.forEach(account =>
                {
                    this.accounts.push(this.getDecryptedAccount(account, getUser().token));       
                });
            });
        },
        computed: {
            filteredAccounts: function() {
				return this.accounts.filter((account) => {
				  return account.platform.toLowerCase().includes(this.search.toLowerCase());
				});
			  }
        }
    }
</script>
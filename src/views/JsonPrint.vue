<template>
    <pre id="data">
		{{ jsonAccounts | pretty }}
	</pre>
</template>

<script>
    import { getUser } from '../utils/auth'
    import AccountsService from '../services/AccountsService'

    export default {
        data()
        {
            return {
                user: getUser(),
            }
        },
        mounted() {
            this.fetchAccounts();
        },
        methods: {
            fetchAccounts: function ()
            {
                let accountsService = new AccountsService(this.user, this.$store);

                accountsService.get();
            }
        },
        computed: {
            jsonAccounts: function ()
            {
                return this.$store.state.accounts;
            }
        },
		filters: {
			pretty: function(value) {
                return JSON.stringify(value, null, 2);
			}
		}
    }
</script>

<style>
	@media (prefers-color-scheme: dark) {
		pre {
			color: #eee;
		}
	}
</style>

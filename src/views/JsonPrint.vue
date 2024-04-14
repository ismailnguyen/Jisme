<template>
    <pre>{{ prettifiedJson }}</pre>
</template>

<script>
    import {
        mapState,
        mapActions
    } from 'pinia'
    import {
        useAccountsStore,
        useAlertStore,
     } from '@/store'
    import Alert from '../models/Alert'

    export default {
        async created() {
            try {
                await fetchAccounts()
            } catch (error) {
                openAlert(new Alert('Error while loading accounts', error.message, 'danger'));
            }
        },
        computed: {
            ...mapState(useAccountsStore, ['accounts']),

			prettifiedJson: function() {
                if (!this.accounts || this.accounts.length === 0) {
                    return 'Loading, please wait...'
                }

                return JSON.stringify(this.accounts, null, 2);
			}
		},
        methods: {
            ...mapActions(useAlertStore, [
                'openAlert'
            ]),

            ...mapActions(useAccountsStore, [
                'fetchAccounts'
            ]),
        }
    }
</script>

<style scoped>
	@media (prefers-color-scheme: dark) {
		pre {
			color: #eee;
		}
	}
</style>

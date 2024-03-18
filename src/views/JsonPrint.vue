<template>
    <pre>{{ prettifiedJson }}</pre>
</template>

<script>
    import { onBeforeMount } from 'vue'
    import { storeToRefs } from 'pinia'
    import {
        useAccountsStore,
        useAlertStore,
     } from '@/store'
    import Alert from '../models/Alert'

    export default {
        setup() {
            const accountsStore = useAccountsStore()
            const { accounts } = storeToRefs(accountsStore)
            const { fetchAccounts } = accountsStore
            const { openAlert } = useAlertStore()

            onBeforeMount(async () => {
                try {
                    await fetchAccounts()
                } catch (error) {
                    openAlert(new Alert('Error while loading accounts', error.message, 'danger'));
                }
            })

            return {
                accounts
            }
        },
        computed: {
			prettifiedJson: function() {
                if (!this.accounts || this.accounts.length === 0) {
                    return 'Loading, please wait...'
                }

                return JSON.stringify(this.accounts, null, 2);
			}
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

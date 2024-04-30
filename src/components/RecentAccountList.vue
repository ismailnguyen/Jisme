<template>
    <div class="main-container container-fluid">
        <div class="row">
            <div class="mb-3 col-12 col-xs-12 col-sm-12 search-title placeholder-glow" v-if="isLoading">
                <span class="placeholder col-2 me-3 mb-0"></span><br>
            </div>
            <div class="mb-3 col-12 col-xs-12 col-sm-12 search-title" v-else>
                <h5 class="font-size-16 me-3 mb-0">Recently viewed</h5>
            </div>
        </div>

        <div class="row stacked-cards" v-if="isLoading">
            <LoadingAccountItem
                v-for="index in 3"
                v-bind:key="index" />
        </div>  
        <div class="row stacked-cards" v-else>
            <AccountItem
                v-for="(account, index) in recentAccounts"
                v-bind:key="index"
                :account="account" />
        </div>
    </div>
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
    import LoadingAccountItem from './LoadingAccountItem.vue'
    import AccountItem from './AccountItem.vue'
    
    export default {
        props: {
            isLoading: {
                type: Boolean,
                default: true
            },
        },
        components: {
            LoadingAccountItem,
            AccountItem,
        },
        computed: {
            ...mapState(useAccountsStore, ['recentAccounts']),
        },
         async mounted() {
            await this.fetchLatestAccounts();
        },
        methods: {
            ...mapActions(useAccountsStore, [
                'fetchRecentAccounts',
            ]),

            ...mapActions(useAlertStore, [
                'openAlert'
            ]),

            fetchLatestAccounts: async function () {
                try {
                    await this.fetchRecentAccounts();
                } catch (error) {
                    if (error instanceof SessionExpiredException) {
                        this.openAlert('Session expired', error.message, 'danger');
                        this.$router.go('/');
                    }
                    else {
                        this.openAlert(error.name || 'Error while loading accounts', error.message, 'danger');
                    }
                }
            },
        } 
    }
</script>

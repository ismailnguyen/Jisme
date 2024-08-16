<template>
    <div class="main-container container-fluid">
        <div class="row">
            <div class="mb-3 col-12 col-xs-12 col-sm-6 placeholder-glow" v-show="isLoading">
                <span class="placeholder col-4 me-3 mb-0"></span><br>
            </div>
            <div class="mb-3 col-12 col-xs-12 col-sm-6" v-show="!isLoading">
                <h5 class="font-size-16 font-weight-light é me-3 mb-0">Recently viewed</h5>
            </div>

            <div class="mb-3 col-6 col-xs-6 col-sm-6 d-none d-sm-block placeholder-glow" v-if="isLoading">
                <span class="placeholder col-4 float-end"></span>
            </div>
            <div class="mb-3 col-6 col-xs-6 col-sm-6 d-none d-sm-block" v-else>
                <span class="category-title float-end">{{ recentAccounts.length }} out of {{ accounts.length }}</span>
            </div>
        </div>
        <div class="row stacked-cards" v-if="isLoading">
            <LoadingAccountItem
                :size="accountsCardSize"
                v-for="index in 3"
                v-bind:key="index" />
        </div>
        <div class="row stacked-cards" v-else>
            <AccountItem
                :size="accountsCardSize"
                v-for="(account, index) in recentAccounts"
                v-bind:key="index"
                :account="account" />
        </div>
    </div>
</template>

<script>
    import {
        mapState,
        mapActions,
    } from 'pinia'
    import {
        useAccountsStore,
        useAlertStore,
     } from '@/store'
    import { SessionExpiredException } from '../utils/errors'
    import LoadingAccountItem from '../components/LoadingAccountItem.vue'
    import AccountItem from '../components/AccountItem.vue'
    
    export default {
        props: {
            accountsCardSize: {
                type: String,
                default: 'small'
            },
            isLoading: {
                type: Boolean,
                default: true
            }
        },
        components: {
            LoadingAccountItem,
            AccountItem,
        },
        async mounted() {
            await this.fetchLatestAccounts();
        },
        computed: {
            ...mapState(useAccountsStore, ['recentAccounts', 'accounts']),
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

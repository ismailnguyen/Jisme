<template>
    <section class="recent-accounts-list" aria-labelledby="recent-title">
        <div class="section-hd">
            <h2 id="recent-title">Recently opened</h2>
            <span v-if="recentAccounts.length && accounts.length">{{ recentAccounts.length }} of {{ accounts.length }}</span>
        </div>
        <div class="ios-list" v-if="isLoading">
            <LoadingAccountItem v-for="index in 4" v-bind:key="index" />
        </div>
        <div class="ios-list" v-else-if="recentAccounts.length">
            <AccountItem
                v-for="(account, index) in recentAccounts"
                v-bind:key="index"
                :account="account" />
        </div>
        <p class="list-empty" v-else>Items you open show up here. Search above to find one.</p>
    </section>
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
    import '../assets/accounts_pane.css'
    import { SessionExpiredException } from '../utils/errors'
    import LoadingAccountItem from '../components/LoadingAccountItem.vue'
    import AccountItem from '../components/AccountItem.vue'
    
    export default {
        props: {
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
                        this.openAlert(error.name || "Couldn't load recent items", error.message, 'danger');
                    }
                }
            },
        } 
    }
</script>


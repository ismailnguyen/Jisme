<template>
    <section class="filtered-account-list" aria-labelledby="results-title" aria-live="polite">
        <div class="section-hd">
            <h2 id="results-title">
                <template v-if="searchQuery">Results for “{{ searchQuery }}”</template>
                <template v-else>Filtered items</template>
            </h2>
            <span v-if="!isLoading">{{ filteredAccounts.length }} of {{ accounts.length }}</span>
        </div>

        <div class="ios-list" v-if="isLoading">
            <LoadingAccountItem v-for="index in 6" v-bind:key="index" />
        </div>
        <template v-else-if="!filteredAccounts.length">
            <p class="list-empty">Nothing matches. Try fewer words, or save it as a new item.</p>
            <div class="ios-list">
                <NewAccountItem />
            </div>
        </template>
        <div class="ios-list" v-else>
            <AccountItem
                v-for="(account, accountIndex) in filteredAccounts"
                v-bind:key="accountIndex"
                :account="account" />
        </div>
    </section>
</template>

<script>
    import '../assets/accounts_pane.css'
    import {
        mapState,
        mapActions,
    } from 'pinia'
    import {
        useAccountsStore,
        useAlertStore,
     } from '@/store'
    import LoadingAccountItem from '../components/LoadingAccountItem.vue'
    import AccountItem from '../components/AccountItem.vue'
    import NewAccountItem from '../components/NewAccountItem.vue'
    
    export default {
        props: {
            searchQuery: {
                type: String,
                default: ''
            },
            filteredAccounts: {
                type: Array,
                default: []
            },
            isLoading: {
                type: Boolean,
                default: true
            }
        },
        components: {
            LoadingAccountItem,
            AccountItem,
            NewAccountItem
        },
        computed: {
            ...mapState(useAccountsStore, ['accounts']),
        },
        methods: {
            ...mapActions(useAlertStore, [
                'openAlert'
            ]),
        } 
    }
</script>

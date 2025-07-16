<template>
    <div class="filtered-account-list main-container container-fluid">
        <div class="row">
            <div class="mb-3 col-6 col-xs-6 col-sm-6 placeholder-glow" v-show="isLoading">
                <span class="placeholder col-2 me-3 mb-0"></span><br>
            </div>

            <div class="mb-3 col-6 col-xs-6 col-sm-6 tags" v-show="!isLoading">
                <h5 class="font-size-16 me-3 mb-0 " v-show="searchQuery">
                    Results for <span class="fw-bold">{{ searchQuery }}</span>
                </h5>
            </div>

            <div class="mb-3 col-6 col-xs-6 col-sm-6 placeholder-glow" v-if="isLoading">
                <span class="placeholder col-4 float-end"></span>
            </div>
            <div class="mb-3 col-6 col-xs-6 col-sm-6" v-else>
                <span class="category-title float-end">{{ filteredAccounts.length }} out of {{ accounts.length }}</span>
            </div>
        </div>

        <div class="row" v-if="isLoading">
            <LoadingAccountItem
            v-for="index in 7"
            v-bind:key="index" />
        </div>
        <div class="row" v-else-if="!filteredAccounts.length">
            <p>No account yet for this query, woudld you like to create one?</p>
            
            <NewAccountItem  />
        </div>
        <div class="row" v-else>
            <AccountItem
                v-for="(account, accountIndex) in filteredAccounts"
                v-bind:key="accountIndex"
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

<style scoped>
@media (max-width: 767px) {
    .filtered-account-list {
        padding-top: 10rem;
    }
}
</style>
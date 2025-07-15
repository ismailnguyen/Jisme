<template>
    <div class="main-container container-fluid">
        <div class="row">
            <div class="mb-3 col-12 col-xs-12 col-sm-6 placeholder-glow" v-show="isLoading">
                <span class="placeholder col-4 me-3 mb-0"></span><br>
            </div>
            <div class="mb-3 col-12 col-xs-12 col-sm-6" v-show="!isLoading">
                <h5 class="font-size-16 font-weight-light é me-3 mb-0">
                    Favorites
                </h5>
            </div>

            <div class="mb-3 col-6 col-xs-6 col-sm-6 d-none d-sm-block placeholder-glow" v-if="isLoading">
                <span class="placeholder col-4 float-end"></span>
            </div>
            <div class="mb-3 col-6 col-xs-6 col-sm-6 d-none d-sm-block" v-if="favoriteAccounts.length">
                <span class="category-title float-end">{{ favoriteAccounts.length }} out of {{ accounts.length }}</span>
            </div>
        </div>
        <div class="row" v-if="isLoading">
            <LoadingAccountItem
                v-for="index in 3"
                v-bind:key="index" />
        </div>
        <div class="row " v-if="favoriteAccounts.length">
            <LightAccountItem
                v-for="(account, index) in favoriteAccounts"
                v-bind:key="index"
                :account="account" />
        </div>
        <div class="rows" v-if="!isLoading && !favoriteAccounts.length">
            <div class="col-12">
                <p class="text-left">Pin your favorite accounts to see them here.</p>
            </div>
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
    import LoadingAccountItem from './LoadingAccountItem.vue'
    import LightAccountItem from './LightAccountItem.vue'
    
    export default {
        props: {
            isLoading: {
                type: Boolean,
                default: true
            }
        },
        components: {
            LoadingAccountItem,
            LightAccountItem,
        },
        computed: {
            ...mapState(useAccountsStore, ['favoriteAccounts', 'accounts']),
        },
        methods: {
            ...mapActions(useAlertStore, [
                'openAlert'
            ]),
        } 
    }
</script>

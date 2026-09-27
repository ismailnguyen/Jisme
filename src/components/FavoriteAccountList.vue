<template>
    <section class="favorite-accounts-list" aria-labelledby="favorites-title">
        <div class="section-hd">
            <h2 id="favorites-title">Favorites</h2>
            <span v-if="favoriteAccounts.length">{{ favoriteAccounts.length }}</span>
        </div>
        <div class="mini-grid" v-if="isLoading" aria-hidden="true">
            <div class="mini-env placeholder-glow" v-for="index in 4" :key="index"><span class="placeholder mini-logo"></span><span class="placeholder col-8"></span></div>
        </div>
        <div class="mini-grid" v-else-if="favoriteAccounts.length">
            <LightAccountItem
                v-for="(account, index) in favoriteAccounts"
                v-bind:key="index"
                :account="account" />
        </div>
        <p class="list-empty" v-else>Open an item and choose <b>Add to favorites</b> to keep it here.</p>
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
    import LightAccountItem from './LightAccountItem.vue'
    
    export default {
        props: {
            isLoading: {
                type: Boolean,
                default: true
            }
        },
        components: {
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


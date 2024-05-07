<template>
    <div class="main-container container-fluid">
        <div class="row">
            <div class="mb-3 col-6 col-xs-6 col-sm-6 search-title placeholder-glow" v-show="isLoading">
                <span class="placeholder col-2 me-3 mb-0"></span><br>
            </div>

            <div class="mb-3 col-6 col-xs-6 col-sm-6 search-title tags" v-show="!isLoading">
                <h5 class="font-size-16 me-3 mb-0" v-show="searchQuery">Results for "{{ searchQuery }}"</h5>

                <span
                    class="badge rounded-pill badge-primary"
                    v-for="(tag, tagIndex) in selectedTags"
                    v-bind:key="tagIndex"
                    @click="removeTag(tag)">
                    {{ tag }}
                    <i class="fa fa-close"></i>
                </span>

                <span
                    class="badge rounded-pill badge-secondary"
                    v-for="(type, typeIndex) in selectedTypes"
                    v-bind:key="typeIndex"
                    @click="removeType(type)">

                    <i class="fa fa-globe" aria-hidden="true" v-if="type == 'account'"></i>
                    <i class="fa fa-credit-card" aria-hidden="true" v-if="type == 'card'"></i>
                    <i class="fa fa-qrcode" aria-hidden="true" v-if="type == '2fa'"></i>

                    {{ type }}
                    <i class="fa fa-close"></i>
                </span>
            </div>

            <div class="mb-3 col-6 col-xs-6 col-sm-6 search-title placeholder-glow" v-if="isLoading">
                <span class="placeholder col-4 float-end"></span>
            </div>
            <div class="mb-3 col-6 col-xs-6 col-sm-6 search-title" v-else>
                <span class="category-title float-end">{{ filteredAccounts.length }} out of {{ accounts.length }}</span>
            </div>
        </div>

        <div class="row" v-if="isLoading">
            <LoadingAccountItem
            :size="accountsCardSize"
            v-for="index in 7"
            v-bind:key="index" />
        </div>
        <div class="row" v-else>
            <AccountItem
                :size="accountsCardSize"
                v-for="(account, accountIndex) in filteredAccounts"
                v-bind:key="accountIndex"
                :account="account" />
        </div>
    </div>
</template>

<script>
    import {
        mapState,
        mapWritableState,
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
            searchQuery: {
                type: String,
                default: ''
            },
            filteredAccounts: {
                type: Array,
                default: []
            },
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
            ...mapWritableState(useAccountsStore, ['selectedTags', 'selectedTypes']),
            ...mapState(useAccountsStore, ['accounts']),
        },
        methods: {
            ...mapActions(useAccountsStore, [
                'fetchAccounts',
            ]),

            ...mapActions(useAlertStore, [
                'openAlert'
            ]),

            fetchLatestAccounts: async function () {
                try {
                    await this.fetchAccounts();
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

            removeTag: function (tag) {
                let newTags = this.$route.query.tags.split(',').map(x => x.trim());
                newTags.splice(newTags.indexOf(tag), 1);
                
                this.$router.push({ name: 'Home', query: { 
                    tags: newTags.join(','),
                    search: this.$route.query.search,
                    type: this.$route.query.type
                } });
            },

            removeType: function (type) {
                let newTypes = this.$route.query.type.split(',').map(x => x.trim());
                newTypes.splice(newTypes.indexOf(type), 1);
                
                this.$router.push({ name: 'Home', query: { 
                    type: newTypes.join(','),
                    search: this.$route.query.search,
                    tags: this.$route.query.tags
                } });
            },
        } 
    }
</script>

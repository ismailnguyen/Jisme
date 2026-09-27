<template>
    <section class="all-accounts-list" aria-labelledby="all-title">
        <div class="section-hd">
            <h2 id="all-title">All items</h2>
            <span v-if="!isLoading && sortedAccounts.length">{{ sortedAccounts.length }}</span>
        </div>
        <div class="env-stack is-grid" v-if="isLoading">
            <LoadingAccountItem v-for="index in 9" v-bind:key="index" />
        </div>
        <template v-else-if="sortedAccounts.length">
            <div class="env-stack is-grid">
                <AccountItem
                    v-for="account in visibleAccounts"
                    v-bind:key="account._id"
                    :account="account" />
            </div>
            <button
                v-if="sortedAccounts.length > limit"
                type="button"
                class="btn btn-outline-secondary list-more"
                @click="limit += PAGE_SIZE">
                Show more
                <span class="list-more-count">{{ sortedAccounts.length - limit }} left</span>
            </button>
        </template>
    </section>
</template>

<script>
    import { mapState } from 'pinia'
    import { useAccountsStore } from '@/store'
    import '../assets/accounts_pane.css'
    import LoadingAccountItem from '../components/LoadingAccountItem.vue'
    import AccountItem from '../components/AccountItem.vue'

    const PAGE_SIZE = 60;

    // Desktop only: the wide desk lays the whole vault out A to Z,
    // so a person can scan it instead of searching for every item
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
        data() {
            return {
                PAGE_SIZE,
                limit: PAGE_SIZE,
            };
        },
        computed: {
            ...mapState(useAccountsStore, ['accounts']),

            sortedAccounts: function () {
                const name = a => (a.label || a.displayPlatform || '').toLocaleLowerCase();

                return [...this.accounts].sort((a, b) => name(a).localeCompare(name(b)));
            },

            visibleAccounts: function () {
                return this.sortedAccounts.slice(0, this.limit);
            },
        },
    }
</script>

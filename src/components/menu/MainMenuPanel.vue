<template>
    <div class="row">
        <div v-if="!userStore.isDemo && (accountsStore.hasLegacyPending || accountsStore.outbox.length)" class="mb-3" aria-label="Pending local changes">
            <p v-if="accountsStore.hasLegacyPending" role="alert">Older local changes may exist on this device. They have no verified owner and are not sent automatically, displayed, overwritten or deleted. Do not clear browser storage. Keep this browser profile for owner-verified recovery; automatic recovery is not available yet. Close older Jisme tabs, which may still use the previous storage behavior.</p>
            <div v-if="accountsStore.outbox.length" role="alert">
                <p>Unsaved edits are in memory only. They will not sync automatically. Retry saving online before locking, signing out or closing this page; those actions discard them. Automatic lock also discards these edits.</p>
                <button v-for="(item, index) in accountsStore.outbox" :key="index" type="button" class="btn btn-sm btn-outline-secondary me-2" :disabled="item.inFlight" @click="uiStore.restorePendingEdit(index)">Reopen unsaved {{ item.type }} #{{ index + 1 }}</button>
            </div>
        </div>
        <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
            <button class="btn btn-action btn-light" type="button" @click="onOpenTagsList()">
                <i class="fa fa-tags" aria-hidden="true"></i>
                Tags
            </button>
        </div>

        <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
            <button class="btn btn-action btn-light" type="button" @click="onOpenSettings()">
                <i class="fa fa-gear" aria-hidden="true"></i>
                Settings
            </button>
        </div>

        <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
            <button type="button" class="btn btn-action btn-cta" @click="onAddAccount()">
                <i class="fa fa-plus" aria-hidden="true"></i>
                New item
            </button>
        </div>
    </div>
</template>

<script>
    import {
        mapStores,
        mapState,
        mapActions
    } from 'pinia'
    import {
        useUiStore,
        useAccountsStore,
        useUserStore,
    } from '@/store'

    export default {
        emits: ['panelChanged'],
        computed: {
            ...mapStores(useAccountsStore, useUserStore, useUiStore),
            ...mapState(useUiStore, [
                'SIDEBAR'
            ])
        },
        methods: {
            ...mapActions(useUiStore, [
                'openSidebar',
                'closeSidebar',
            ]),

            onOpenTagsList: function () {
                this.$emit('panelChanged', 'tags-list');
            },

            onOpenSettings: function () {
                this.$emit('panelChanged', 'settings');
            },

            onAddAccount: function () {
                // first close the menu before opening the add account sidebar
                // otherwise body scroll will be enabled when the menu is closed
                this.closeSidebar(this.SIDEBAR.MENU);
                this.openSidebar(this.SIDEBAR.ADD_ACCOUNT);
            },
        }
    }
</script>

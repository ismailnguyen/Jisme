<template>
    <div class="mini-env" :id="account._id">
        <button type="button" class="win" :aria-label="'Open ' + title" @click="onCardClick()">
            <img v-if="hasIcon" class="mini-icon" :src="displayIcon(account.icon)" loading="lazy" alt="" @error="isIconBroken = true">
            <span v-else class="initial" aria-hidden="true">{{ initial }}</span>
            <b>{{ title }}</b>
        </button>
    </div>
</template>

<script>
    import '../assets/card.css';

    import { mapState, mapActions } from 'pinia'
    import { useUiStore, useAlertStore, useAccountsStore } from '@/store'
    import Account from '../models/Account'
    import { displayIcon } from '../utils/icon.js'

    export default {
        props: {
            account: Account,
        },
        data() {
            return {
                isIconBroken: false,
            };
        },
        computed: {
            ...mapState(useUiStore, ['SIDEBAR']),

            title: function () {
                return this.account.label || this.account.displayPlatform || 'Untitled';
            },

            initial: function () {
                return (this.title.trim()[0] || '?').toUpperCase();
            },

            hasIcon: function () {
                return !!this.account.icon && !this.isIconBroken;
            },
        },
        methods: {
            displayIcon,
            ...mapActions(useUiStore, ['openSidebar', 'setCurrentEditingAccount']),
            ...mapActions(useAlertStore, ['openAlert']),
            ...mapActions(useAccountsStore, ['findAccountById']),

            onCardClick: async function() {
                const accountToEdit = this.findAccountById(this.account._id);

                if (!accountToEdit) {
                    this.openAlert("Couldn't open this item", 'Refresh the page and try again.', 'danger');
                    return;
                }

                this.setCurrentEditingAccount(accountToEdit);
                this.openSidebar(this.SIDEBAR.EDIT_ACCOUNT);
            },
        }
    }
</script>

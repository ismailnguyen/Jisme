<template>
    <div class="mini-env" :id="account._id">
        <button type="button" class="mini-btn" :aria-label="'Open ' + title + (holder ? ', ' + holder : '')" @click="onCardClick()">
            <span class="logo-sq mini-logo" aria-hidden="true">
                <img v-if="hasIcon" :src="displayIcon(account.icon)" loading="lazy" alt="" @error="isIconBroken = true">
                <span v-else class="initial">{{ initial }}</span>
            </span>
            <span class="mini-text" aria-hidden="true">
                <b>{{ title }}</b>
                <small v-if="holder">{{ holder }}</small>
            </span>
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

            // Whose document or card it is, so family members' items tell apart
            holder: function () {
                const a = this.account;
                if (a.type === 'document' || a.type === 'card') return a.card_name || '';
                if (a.type === 'bank') return a.login || '';
                return '';
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

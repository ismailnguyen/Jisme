<template>
    <article class="env" :id="account._id" :aria-label="title">
        <button
            type="button"
            class="env-window win"
            :aria-label="'Open ' + title"
            @click="onCardClick()">
            <span class="logo-sq" aria-hidden="true">
                <img v-if="hasIcon" :src="displayIcon(account.icon)" loading="lazy" alt="" @error="isIconBroken = true">
                <span v-else class="initial">{{ initial }}</span>
            </span>
            <span class="env-text">
                <b>
                    <span class="env-title">{{ title }}</span>
                    <span v-if="account.totp_secret" class="code-tag"><i class="fa-solid fa-clock-rotate-left" aria-hidden="true"></i>Code</span>
                </b>
                <small class="carbon" v-if="subtitle">{{ subtitle }}</small>
            </span>
        </button>

        <div class="env-seal" :class="quickCopy ? 'tint' : 'is-plain'">
            <button
                v-if="quickCopy"
                type="button"
                class="ibtn"
                :class="{ 'is-done': justCopied }"
                :aria-label="`Copy ${ quickCopy.name.toLowerCase() } for ${ title }`"
                @click="copySecret()">
                <i class="fa-solid" :class="justCopied ? 'fa-check' : 'fa-copy'" aria-hidden="true"></i>
            </button>
            <button
                v-else
                type="button"
                class="ibtn is-quiet"
                :aria-label="hasBarcode ? 'Show barcode for ' + title : 'Open ' + title"
                @click="onCardClick()">
                <i class="fa-solid" :class="hasBarcode ? 'fa-barcode' : 'fa-chevron-right'" aria-hidden="true"></i>
            </button>
        </div>
    </article>
</template>

<script>
    import '../assets/card.css';

    import {
        mapState,
        mapActions
    } from 'pinia'
    import {
        useUiStore,
        useAlertStore,
        useAccountsStore
    } from '@/store'
    import Account from '../models/Account'
    import { maskSecret } from '../utils/secrets'
    import { copyText } from '../utils/clipboard'
    import { displayIcon } from '../utils/icon.js'

    export default {
        props: {
            account: Account,
        },
        data() {
            return {
                isIconBroken: false,
                justCopied: false,
            };
        },
        beforeUnmount() {
            clearTimeout(this.copiedTimer);
        },
        computed: {
            ...mapState(useUiStore, [
                'SIDEBAR'
            ]),

            title: function () {
                return this.account.label || this.account.displayPlatform || 'Untitled';
            },

            initial: function () {
                return (this.title.trim()[0] || '?').toUpperCase();
            },

            hasIcon: function () {
                return !!this.account.icon && !this.isIconBroken;
            },

            hasBarcode: function () {
                return this.account.type === 'card' && ['loyalty', 'gift'].includes(this.account.subtype) && !!this.account.card_number;
            },

            // What the seal copies without opening the envelope
            quickCopy: function () {
                const { type, subtype, password } = this.account;

                if (type !== 'account' || !password) {
                    return null;
                }

                if (subtype === 'wifi') return { name: 'Wi-Fi password', value: password };
                if (subtype === 'secret_key') return { name: 'Key', value: password };
                if (subtype === 'login' && !this.account.is_password_less) return { name: 'Password', value: password };

                return null;
            },

            subtitle: function () {
                const a = this.account;

                if (a.type === 'account') {
                    if (a.subtype === 'wifi') return a.login ? 'SSID ' + a.login : 'Wi-Fi';
                    if (a.subtype === 'secret_key') return a.login || 'Secret key';
                    return a.login || a.social_login || '';
                }

                // The holder leads: a family keeps one passport (or card) per person,
                // so whose it is decides which envelope to open
                const withHolder = (holder, rest) => [holder, rest].filter(x => x).join(' · ');

                if (a.type === 'card') {
                    if (a.subtype === 'payment') return withHolder(a.card_name, a.card_number ? maskSecret(a.card_number, 4) : '') || 'Payment card';
                    return a.card_name || (a.subtype === 'gift' ? 'Gift card' : 'Loyalty card');
                }

                if (a.type === 'bank') return withHolder(a.login, a.password ? maskSecret(a.password, 4) : '') || 'Bank account';
                if (a.type === 'document') return withHolder(a.card_name, a.card_number ? maskSecret(a.card_number, 3) : '') || 'Document';

                return a.description || '';
            },
        },
        methods: {
            displayIcon,

            ...mapActions(useUiStore, [
                'openSidebar',
                'setCurrentEditingAccount'
            ]),
            ...mapActions(useAlertStore, ['openAlert']),
            ...mapActions(useAccountsStore, ['findAccountById']),

            edit: async function() {
                const accountToEdit = this.findAccountById(this.account._id);

                if (accountToEdit) {
                    this.setCurrentEditingAccount(accountToEdit);
                } else {
                    this.openAlert("Couldn't open this item", 'Refresh the page and try again.', 'danger');
                    return;
                }

                this.openSidebar(this.SIDEBAR.EDIT_ACCOUNT);
            },

            onCardClick: async function() {
                await this.edit();
            },

            copySecret: async function () {
                const { name, value } = this.quickCopy;
                const isCopied = await copyText(value);

                if (!isCopied) {
                    this.openAlert(`Couldn't copy ${ name.toLowerCase() }`, 'Open the item and reveal it instead.', 'danger');
                    return;
                }

                // Never echo the secret: the toast is visible to anyone nearby
                this.openAlert(`${ name } copied`, this.title, 'info', this.hasIcon ? this.account.icon : null);

                this.justCopied = true;
                clearTimeout(this.copiedTimer);
                this.copiedTimer = setTimeout(() => { this.justCopied = false; }, 1600);
            },
        }
    }
</script>

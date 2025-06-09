<template>
    <div class="card-wrapper col-12 col-xs-12 col-sm-12 col-md-6 col-lg-6 col-xl-4">
        <div class="card clickable" :style="'background-image: url('+account.icon+');'" :id="account._id" >
            <div class="card-body" @click.prevent="onCardClick()">
                <div class="row">
                    <div class="col-8 align-self-center">
                        <h2 class=" card-title">
                            {{ account.label }}
                        </h2>
                    </div>
                </div>

                <div class="row" v-if="account.type == 'account'">
                    <div class="col-12" v-if="account.subtype == 'login' && account.login">
                        <span class="small">
                            <i class="fa fa-user" aria-hidden="true" ></i>
                            {{ account.login }}
                        </span>
                    </div>
                    <div class="col-12" v-if="account.subtype == 'wifi' && account.login">
                        <span class="small">
                            <i class="fa fa-wifi" aria-hidden="true" ></i>
                            {{ account.login }}
                        </span>
                    </div>
                    <div class="col-12" v-if="account.subtype == 'secret_key' && account.login">
                        <span class="small">
                            <i class="fa fa-hashtag" aria-hidden="true" ></i>
                            {{ account.login }}
                        </span>
                    </div>
                </div>

                <div class="row" v-if="account.type == 'card'">
                    <div class="col-12" v-if="account.subtype == 'payment' && account.card_number">
                        <span class="small">
                            <i class="fa fa-barcode" aria-hidden="true" ></i>
                            {{ maskedCardNumber }}
                        </span>
                    </div>
                    <div class="col-12" v-if="(account.subtype == 'loyalty' || account.subtype == 'gift') && account.card_pin">
                        <span class="small">
                            <i class="fa fa-lock" aria-hidden="true" ></i>
                            {{ account.card_pin }}
                        </span>
                    </div>
                    <div class="col-12" v-if="account.card_name">
                        <span class="small">
                            <i class="fa fa-user" aria-hidden="true" ></i>
                            {{ account.card_name }}
                        </span>
                    </div>
                </div>

                <div class="row" v-if="account.type == 'bank'">
                    <div class="col-12" v-if="account.password">
                        <span class="small">
                            <i class="fa fa-barcode" aria-hidden="true" ></i>
                            {{ account.password }}
                        </span>
                    </div>
                </div>

                <div class="row" v-if="account.type == 'document'">
                   <div class="col-12" v-if="account.card_name">
                        <span class="small">
                            <i class="fa fa-user" aria-hidden="true" ></i>
                            {{ account.card_name }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import '../assets/card.css';
  
    import { generateInitialIcon } from "../utils/icon.js";

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
    import { truncateString } from '../utils/textFormat'

    export default {
        props: {
            account: Account,
        },
        mounted() {
            if (!this.account.icon) {
                this.account.icon = generateInitialIcon(this.account.label);
            }
        },
        computed: {
            ...mapState(useUiStore, [
                'SIDEBAR'
            ]),

            maskedCardNumber: function () {
                if (this.account.card_number && this.account.card_number.length > 4) {
                    return '**** **** **** ' + this.account.card_number.slice(-4);
                }

                return this.account.card_number;
            }
        },
        methods: {
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
                    this.openAlert('Account not found', 'Please refresh or retry.', 'danger');
                }

                this.openSidebar(this.SIDEBAR.EDIT_ACCOUNT);
            },

            onCardClick: async function() {
                await this.edit();
            },

            onImageLoadingError() {
                this.account.icon = '';
            }
        }
    }
</script>

<style scoped>
.card {
    background-repeat: no-repeat;
    background-size: cover;
}

.card-body {
    backdrop-filter: blur(2px);
}
</style>
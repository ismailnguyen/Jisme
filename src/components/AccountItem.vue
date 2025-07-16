<template>
    <div class="card-wrapper col-12 col-xs-12 col-sm-12 col-md-12 col-lg-6 col-xl-4">
        <div class="card clickable" :id="account._id" >
            <div class="card-body" @click.prevent="onCardClick()">
                <div class="row">
                    <div class="col-12 tags">
                        <div
                            class="badge rounded-pill"
                            v-for="tag in account.tags.split(',')"
                            @click.stop="selectTag(tag)"
                            v-bind:key="tag">
                            {{tag}}
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-8 align-self-center">
                        <h2 class=" card-title">
                            {{ account.label || account.displayPlatform }}
                        </h2>
                    </div>

                    <div class="col-4 align-self-center">
                        <img
                            :src="account.icon"
                            loading="lazy"
                            :alt="account.label"
                            :title="account.label"
                            @error="onImageLoadingError()"
                            class="card-icon float-end" />
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
                    <div class="col-12" v-if="account.description">
                        <span class="small description">
                            {{ shortDescription }}
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
                    <div class="col-12" v-if="(account.subtype == 'loyalty' || account.subtype == 'gift') && account.card_number">
                        <span class="small">
                            <i class="fa fa-barcode" aria-hidden="true" ></i>
                            {{ account.card_number }}
                        </span>
                    </div>
                    <div class="col-12" v-if="account.subtype == 'payment' && account.card_expiracy">
                        <span class="small">
                            <i class="fa fa-calendar" aria-hidden="true" ></i>
                            {{ account.card_expiracy }}
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
                    <div class="col-12" v-if="account.platform">
                        <span class="small">
                            <i class="fa fa-building-columns" aria-hidden="true" ></i>
                            {{ account.platform }}
                        </span>
                    </div>
                    <div class="col-12" v-if="account.description">
                        <span class="small description">
                            {{ shortDescription }}
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
                    <div class="col-12" v-if="account.platform">
                        <span class="small">
                            <i class="fa fa-building-columns" aria-hidden="true" ></i>
                            {{ account.platform }}
                        </span>
                    </div>
                    <div class="col-12" v-if="account.login">
                        <span class="small">
                            <i class="fa fa-user" aria-hidden="true" ></i>
                            {{ account.login }}
                        </span>
                    </div>
                    <div class="col-12" v-if="account.description">
                        <span class="small description">
                            {{ shortDescription }}
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
                     <div class="col-12" v-if="account.card_number">
                        <span class="small">
                            <i class="fa fa-barcode" aria-hidden="true" ></i>
                            {{ account.card_number }}
                        </span>
                    </div>
                    <div class="col-12" v-if="account.card">>
                        <span class="small">
                            <i class="fa fa-calendar" aria-hidden="true" ></i>
                            {{ account.card_expiracy }}
                        </span>
                    </div>
                    <div class="col-12" v-if="account.description">
                        <span class="small description">
                            {{ shortDescription }}
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

            shortDescription: function () {
                if (this.account.description && this.account.description.length > 30) {
                    return truncateString(this.account.description, 30)
                }

                return this.account.description;
            },

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

            selectTag: function (tag) {
                // Don't add the tag if it is already selected
                if (this.$route.query.tags && this.$route.query.tags.split(',').map(x => x.trim()).includes(tag.trim())) {
                    return;
                }

                const tags = this.addTag(tag);

                this.$router.push({name: 'Home', query: {
                    tags: tags,
                    search: this.$route.query.search,
                    type: this.$route.query.type
                }});
            },

            addTag: function (tag) {
                let newTags = this.$route.query.tags ? this.$route.query.tags.split(',').map(x => x.trim()) : [];
                newTags.push(tag.trim());

                return newTags.join(',');
            },

            onImageLoadingError() {
                this.account.icon = '';
            }
        }
    }
</script>

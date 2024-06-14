<template>
    <div class="card-wrapper col-12 col-xs-12 col-sm-12" :class="layoutAdjustmentCss">
        <div class="card clickable" :id="account._id">
            <div class="card-image-wrapper col-xs-3">
                <img
                    :src="getIcon"
                    loading="lazy"
                    :alt="account.displayPlatform"
                    :title="account.displayPlatform"
                    @error="onImageLoadingError()"
                    class="card-icon" />
            </div>

            <div class="card-header tags">
                <div
                    class="badge rounded-pill text-bg-primary"
                    v-for="tag in account.tags.split(',')"
                    @click="selectTag(tag)"
                    v-bind:key="tag">
                    {{tag}}
                </div>
            </div>

            <div class="card-body" @click.prevent="onCardClick()">
                <h2 class="card-title">
                    {{ account.displayPlatform }}
                </h2>

                <div class="row" v-if="(account.type == 'account' || account.type == '2fa') && account.login">
                    <div class="col-sm-12">
                        <span class="small">
                            {{ account.login }}
                        </span>
                    </div>
                </div>

                <div class="row" v-if="account.type == 'card' && account.card_name">
                    <div class="col-sm-12">
                        <span class="small">
                            <i class="fa fa-user" aria-hidden="true" ></i>
                            {{ account.card_name }}
                        </span>
                    </div>
                </div>

                <div class="row" v-if="account.description">
                    <div class="col-sm-12">
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

    const cardSizeMapping= {
        small: 'col-md-4 col-lg-3',
        medium: 'col-md-6 col-lg-6 col-xl-6',
        large: 'col-lg-12 col-xl-12',
    }
    
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
            size: {
                type: String,
                default: 'small'
            }
        },
        mounted() {
            if (!this.account.icon) {
                console.log('Generating icon for account', this.account.displayPlatform);
                this.account.icon = generateInitialIcon(this.account.displayPlatform);
            }
        },
        computed: {
            ...mapState(useUiStore, [
                'isRightSidebarOpened',
                'SIDEBAR'
            ]),

            layoutAdjustmentCss: function () {
                return cardSizeMapping[this.size] || cardSizeMapping['small'];
            },

            getIcon: function () {
                if (this.account && this.account.icon) {
                    return this.account.icon;
                }

                //return generateInitialIcon(this.account.displayPlatform);
            },

            shortDescription: function () {
                if (this.account.description && this.account.description.length > 30) {
                    return truncateString(this.account.description, 30)
                }

                return this.account.description;
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
                    this.openAlert('Account no more available', 'danger');
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

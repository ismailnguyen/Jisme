<template>
    <div class="card-wrapper col-12 col-xs-12 col-sm-12" :class="layoutAdjustmentCss">
        <div class="card clickable" :id="account._id">
            <div class="card-image-wrapper col-xs-3">
                <img
                    :src="getIcon"
                    loading="lazy"
                    :alt="account.displayPlatform"
                    :title="account.displayPlatform"
                    @error="onImageLoadingError(account)"
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
                            <i class="fa fa-id-badge" aria-hidden="true" v-show="isExpanded"></i>
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

                <div class="row" v-show="isExpanded" v-if="(account.type == 'account' || account.type == '2fa') && (account.password || account.password_clue)">
                    <div class="col-sm-12">
                        <span class="small">
                            <i class="fa fa-lock" aria-hidden="true"></i>
                            {{ account.password || account.password_clue }}
                        </span>
                    </div>
                </div>

                <div class="row" v-show="isExpanded" v-if="account.social_login">
                    <div class="col-sm-12">
                        <span class="small">
                            <i class="fa fa-mobile-screen" aria-hidden="true"></i>
                            &nbsp;
                            <div
                                class="badge rounded-pill text-bg-danger"
                                v-for="socialLogin in account.social_login.split(',')"
                                v-show="account.social_login"
                                v-bind:key="socialLogin">
                                {{ socialLogin }}
                            </div>
                        </span>
                    </div>
                </div>

                <div class="row" v-show="isExpanded" v-if="account.type == 'card' && account.card_number">
                    <div class="col-sm-12">
                        <span class="small">
                            <i class="fa fa-barcode" aria-hidden="true"></i>
                            {{ account.card_number }}
                        </span>
                    </div>
                </div>

                <div class="row" v-show="isExpanded" v-if="account.totp_secret">
                    <div class="col-sm-12">
                        <span class="small">
                            <i class="fa fa-qrcode" aria-hidden="true"></i>
                            {{ totpToken }}
                        </span>
                    </div>
                </div>

                <div class="row" v-if="account.description">
                    <div class="col-sm-12">
                        <span class="small description" v-show="!isExpanded">
                            {{ shortDescription }}
                        </span>

                        <span class="small description" v-show="isExpanded">
                            <i class="fa fa-message" aria-hidden="true"></i>
                            {{ account.description }}
                        </span>
                    </div>
                </div>
            </div>

            <div class="card-footer" v-show="isExpanded">
                <a class="btn btn-outline-primary float-end" @click.prevent="edit()">
                    Open
                    <i class="fa fa-arrow-right"></i>
                </a>
            </div>
        </div>
    </div>
</template>

<script>
    import '../assets/card.css'

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
    } from '@/store'
    import Account from '../models/Account'
    import { truncateString } from '../utils/textFormat'
    import totpGenerator from 'totp-generator'

    export default {
        props: {
            account: Account,
            size: {
                type: String,
                default: 'small'
            }
        },
        data() {
            return {
                isExpanded: false,
                totpToken: ''
            }
        },
        computed: {
            ...mapState(useUiStore, [
                'isLeftSidebarOpened',
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

                return this.generateInitialIcon();
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

            edit: async function() {
                this.openSidebar(this.SIDEBAR.EDIT_ACCOUNT);
                await this.setCurrentEditingAccount(this.account);
            },

            onCardClick: function() {
                // Expand or collapse the card on click on it
                this.isExpanded = !this.isExpanded;

                // Regenerate totp token if the card is expanded
                if (this.isExpanded && this.account.totp_secret) {
                    this.generateTotpToken();
                }
            },

            generateTotpToken: function () {
                if (this.account.totp_secret) {
                     // Remove all spaces because spaces are forbidden for TOTP generation
                     // And some websites give the secret with spaces for better human readability
                    this.totpToken = totpGenerator(this.account.totp_secret.replace(/ /g,''));
                }
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

            generateRandomColor: function () {
                const color = [
                    "#5050ff",
                    "#50ff50",
                    "#ff5050",
                    "#ff5000",
                    "#ff0050",
                    "#0050ff",
                    "#00ff50",
                    "#50ff00",
                    "#5000ff"
                ];

                let random = Math.floor(Math.random() * color.length);

                return color[random];
            },

            generateInitialIcon: function () {
                let avatar, ctx, color;

                //creating canvas
                avatar = document.createElement("canvas");
                avatar.width = avatar.height = "48";
                ctx = avatar.getContext("2d");
                ctx.font = `${avatar.width / 2}px Arial`;
                ctx.textAlign = "center";

                var initials = this.account.displayPlatform.split(' ').map(s => s[0].toUpperCase()).join('');

                //generating color
                color = this.generateRandomColor();

                //function to create avatar
                //clear canvas
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, avatar.width, avatar.height);

                //add background
                ctx.fillStyle = `${color}60`;
                ctx.fillRect(0, 0, avatar.width, avatar.height);

                //add text
                ctx.fillStyle = color;
                ctx.fillText(initials, avatar.width / 2, (65 / 100) * avatar.height);

                //generate as Image
                return avatar.toDataURL();
            },

            onImageLoadingError(account) {
                account.icon = '';
            }
        }
    }
</script>

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
                <div
                    class="badge rounded-pill text-bg-danger"
                    v-for="socialLogin in account.social_login.split(',')"
                    v-show="account.social_login"
                    v-bind:key="socialLogin">
                    {{ socialLogin }}
                </div>
            </div>

            <div class="card-body" @click.prevent="edit()">
                <h2 class="card-title">
                    {{ account.displayPlatform }}
                </h2>

                <div class="row">
                    <div class="col-sm-12">
                        <span class="small" v-if="account.type == 'account' || account.type == '2fa'">{{account.login}}</span>
                        <span class="small" v-if="account.type == 'card'">{{account.card_name}}</span>
                    </div>
                </div>

                <div class="row" v-if="account.description">
                    <div class="col-sm-12">
                        <span class="small description">{{account.description}}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import '../assets/card.css'
    
    import { 
        mapState,
        mapActions
    } from 'pinia'
    import {
        useUiStore,
        useAccountsStore
    } from '@/store'
    import Account from '../models/Account'

    export default {
        props: {
            account: Account,
        },
        computed: {
            ...mapState(useUiStore, ['isMenuOpened', 'isAccountOpened', 'isSettingsOpened']),

            layoutAdjustmentCss: function () {
                let cssClass = 'col-md-4 col-lg-3'

                if (this.isMenuOpened) {
                    cssClass = 'col-lg-4 col-xl-4'

                    if (this.isAccountOpened || this.isSettingsOpened) {
                        cssClass = 'col-lg-12 col-xl-12'
                    }
                }
                else if (this.isAccountOpened || this.isSettingsOpened) {
                    cssClass = 'col-md-6 col-lg-6 col-xl-6'
                }

                return cssClass
            },

            getIcon: function () {
                if (this.account && this.account.icon) {
                    return this.account.icon;
                }

                return this.generateInitialIcon();
            }
        },
        methods: {
            ...mapActions(useUiStore, [
                'openEditAccountModal'
            ]),

            ...mapActions(useAccountsStore, [
                'updateAccount'
            ]),

            edit: async function() {
                try {
                    await this.updateAccount(this.account);
                }
                catch (error) {
                    this.showAlert('Error', error.toString(), 'danger');
                }                

                this.openEditAccountModal(this.account)
            },

            selectTag: function (tag) {
                // Don't add the tag if it is already selected
                if (this.$route.query.tags && this.$route.query.tags.split(',').map(x => x.trim()).includes(tag.trim())) {
                    return;
                }

                const tags = this.addTag(tag);

                this.$router.push({name: 'Home', query: { tags: tags }});
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

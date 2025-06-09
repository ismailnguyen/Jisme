<template>
    <div class="card-wrapper col-12 col-xs-12 col-sm-12 col-md-6 col-lg-6 col-xl-4">
        <div class="card card-new clickable" :id="account._id" >
            <div class="card-body" @click.prevent="onCardClick()">
                <div class="row">
                    <div class="col-12 tags">
                        <div
                            class="badge rounded-pill"
                            v-for="tag in account.tags.split(',')"
                            v-bind:key="tag">
                            {{tag}}
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-8 align-self-center">
                        <h2 class=" card-title">
                            {{ account.label }}
                        </h2>
                    </div>

                    <div class="col-4 align-self-center">
                        <img
                            :src="account.icon"
                            loading="lazy"
                            :alt="account.label"
                            :title="account.label"
                            class="card-icon float-end" />
                    </div>
                </div>

                <div class="row">
                    <div class="col-12">
                        <span class="small description">
                            Click to her to create a new account with this label
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
        mapActions,
        mapWritableState
    } from 'pinia'
    import {
        useUiStore,
        useAlertStore,
    } from '@/store'

    export default {
        created() {
            this.$watch(
                '$route.query.query',
                () => {
                    this.initAccount();
                },
                {
                    immediate: true,
                }
            );

            this.$watch(
                '$route.query.tags',
                () => {
                    this.initAccount();
                },
                {
                    immediate: true,
                }
            );

            this.$watch(
                '$route.query.type',
                () => {
                    this.initAccount();
                },
                {
                    immediate: true,
                }
            );

            this.$watch(
                '$route.query.filters',
                () => {
                    this.initAccount();
                },
                {
                    immediate: true,
                }
            );
        },
        computed: {
            ...mapWritableState(useUiStore, {
                account: "currentAddingAccount",
            }),
            
            ...mapState(useUiStore, [
                'SIDEBAR'
            ]),
        },
        methods: {
            ...mapActions(useUiStore, [
                'openSidebar'
            ]),
            ...mapActions(useAlertStore, ['openAlert']),

            initAccount: function() {
                this.account.label = this.$route.query.query ? this.$route.query.query : '';

                // get tags from url if any
                this.account.tags = this.$route.query.tags ? this.$route.query.tags.split(',').map(x => x.trim()).join(',') : '';

                // type;
                this.account.type = this.$route.query.type ? this.$route.query.type : '';

                // if there are filters in query string and it's an array
                if (this.$route.query.filters && this.$route.query.filters.length) {
                    try {
                        const filters = JSON.parse(this.$route.query.filters);

                        for (const filter of filters) {
                            console.log("Applying filter from URL", filter);
                            if (filter.field && filter.value) {
                                this.account[filter.field] = filter.value;
                            }
                        }
                    } catch (e) {
                        this.openAlert({
                            type: 'error',
                            message: e.message || 'Invalid filters format in URL',
                        });
                    }
                }

                // If the account has a platform, set the icon accordingly, otherwise generate an initial icon from label
                if (this.account.platform) {
                    this.account.icon = "https://www.google.com/s2/favicons?domain=" + this.account.platform;
                }
                else {
                    console.log("Generating initial icon for new account", this.account);
                    this.account.icon = generateInitialIcon(this.account.label);
                }
            },

            add: async function() {
                this.openSidebar(this.SIDEBAR.ADD_ACCOUNT);
            },

            onCardClick: async function() {
                await this.add();
            }
        }
    }
</script>

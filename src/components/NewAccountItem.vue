<template>
    <article class="env is-new">
        <button type="button" class="env-window win" @click="onCardClick()">
            <span class="logo-sq" aria-hidden="true"><i class="fa-solid fa-plus"></i></span>
            <span class="env-text">
                <b><span class="env-title">{{ account.label ? `Save “${ account.label }”` : 'Save a new item' }}</span></b>
                <small>Opens a new envelope with this name and filters filled in</small>
            </span>
        </button>
    </article>
</template>

<script>
    import '../assets/card.css';
    import { generateInitialIcon, faviconUrl } from "../utils/icon.js";
  
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
                '$route.query.search',
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
                this.account.label = this.$route.query.search ? this.$route.query.search : '';

                // get tags from url if any
                this.account.tags = this.$route.query.tags ? this.$route.query.tags.split(',').map(x => x.trim()).join(',') : '';

                // if there is one type assign it, if there are multiple types, don't assign any
                const types = this.$route.query.type ? this.$route.query.type.split(',').map(x => x.trim()) : [];
                if (types.length === 1) {
                    this.account.type = types[0];
                } else if (types.length > 1) {
                    this.account.type = '';
                }

                // if there are filters in query string and it's an array
                if (this.$route.query.filters && this.$route.query.filters.length) {
                    try {
                        const filters = JSON.parse(this.$route.query.filters);

                        for (const filter of filters) {
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
                    this.account.icon = faviconUrl(this.account.platform);
                }
                else {
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

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
        props: {
            query: String,
        },
        mounted() {
            this.account.label = this.query;
            this.account.icon = this.account.icon = "https://www.google.com/s2/favicons?domain=" + this.query;

            // get tags from url if any
            this.account.tags = this.$route.query.tags ? this.$route.query.tags.split(',').map(x => x.trim()).join(',') : '';
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
                'openSidebar',
                'setCurrentAddingAccount'
            ]),
            ...mapActions(useAlertStore, ['openAlert']),

            add: async function() {
                this.setCurrentAddingAccount(this.account);

                this.openSidebar(this.SIDEBAR.ADD_ACCOUNT);
            },

            onCardClick: async function() {
                await this.add();
            }
        }
    }
</script>

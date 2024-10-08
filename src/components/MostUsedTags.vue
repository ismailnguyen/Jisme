<template>
    <div class="main-container container-fluid">
        <div class="row">
            <div class="mb-3 col-12 col-xs-12 col-sm-12 placeholder-glow" v-if="isLoading">
                <span class="placeholder col-2 font-size-16 me-3 mb-0"></span><br>
            </div>
            <div class="mb-3 col-12 col-xs-12 col-sm-12" v-else>
                <h5 class="font-size-16 font-weight-light  me-3 mb-0">Most used tags</h5>
            </div>
        </div>

        <div class="row stacked-cards stacked-cards-small" v-if="isLoading">
            <div class="card-wrapper col-sm-4 mb-3"
                v-for="index in 5"
                v-bind:key="index">
                <div class="card card-secondary clickable">
                    <div class="card-body">
                        <h5 class="card-title">
                            <i class="fa fa-loading" aria-hidden="true"></i>
                            <span class="placeholder col-4 me-3 mb-0"></span>
                        </h5>
                    </div>
                    <div class="card-footer">
                        <a class="btn btn-outline-primary float-end">
                            ...
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <div class="row stacked-cards stacked-cards-small" v-else>
            <div class="card-wrapper col-sm-4 mb-3"
                v-for="(tag, index) in mostUsedTags"
                v-bind:key="index">
                <div class="card card-secondary clickable" @click.prevent="selectTag(tag)">
                    <div class="card-body">
                        <h5 class="card-title">
                            <i class="fa fa-tag" aria-hidden="true"></i>
                            {{ tag.name || 'None' }}
                        </h5>
                    </div>
                    <div class="card-footer">
                        <a class="btn btn-outline-primary float-end">
                            VIEW
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import {
        mapActions,
    } from 'pinia'
    import {
        useAccountsStore,
     } from '@/store'

    export default {
        props: {
            isLoading: {
                type: Boolean,
                default: true
            }
        },
        computed: {
            mostUsedTags: function () {
                return this.getMostUsedTags().slice(0, 10);
            }
        },
        methods: {
            ...mapActions(useAccountsStore, [
                'getMostUsedTags'
            ]),
            
            selectTag: function (tag) {
                this.$router.push({name: 'Home', query: {
                    tags: tag.name,
                    search: this.$route.query.search,
                    type: this.$route.query.type
                }});
            },
        }
    }
</script>

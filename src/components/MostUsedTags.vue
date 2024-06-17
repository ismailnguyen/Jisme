<template>
    <div class="main-container container-fluid">
        <div class="row">
            <div class="mb-3 col-12 col-xs-12 col-sm-12 placeholder-glow" v-show="mostUsedTags.length == 0">
                <span class="placeholder col-2 font-size-16 me-3 mb-0"></span><br>
            </div>
            <div class="mb-3 col-12 col-xs-12 col-sm-12" v-show="mostUsedTags.length">
                <h5 class="font-size-16 me-3 mb-0">Most used tags</h5>
            </div>
        </div>

        <div class="row stacked-cards stacked-cards-small" v-if="mostUsedTags.length == 0">
            <div class="card-wrapper col-sm-4 mb-3"
                v-for="(tag, index) in 5"
                v-bind:key="index">
                <div class="card clickable" @click.prevent="selectTag(tag)">
                    <div class="card-body">
                        <h5 class="card-title">
                            <i class="fa fa-tag" aria-hidden="true"></i>&nbsp;
                            <span class="placeholder col-4 me-3 mb-0"></span><br>
                        </h5>
                    </div>
                    <div class="card-footer">
                        <a class="btn btn-outline-primary float-end d-none">
                            ...
                            <i class="fa fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <div class="row stacked-cards stacked-cards-small" v-else>
            <div class="card-wrapper col-sm-4 mb-3"
                v-for="(tag, index) in mostUsedTags"
                v-bind:key="index">
                <div class="card clickable" @click.prevent="selectTag(tag)">
                    <div class="card-body">
                        <h5 class="card-title">
                            <i class="fa fa-tag" aria-hidden="true"></i>
                            {{ tag.name || 'None' }}
                        </h5>
                    </div>
                    <div class="card-footer">
                        <a class="btn btn-outline-primary float-end d-none">
                            View
                            <i class="fa fa-arrow-right"></i>
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
        async mounted() {
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

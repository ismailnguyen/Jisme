<template>
    <div class="right-sidebar-wrapper sidebar-wrapper">
        <div class="right-sidebar">
             <div class="sidebar-header">
                <div class="row">
                    <div class="mb-3 col-xs-9 col-sm-9 col-9 col-md-9 col-lg-9">
                        <h2 class="sidebar-title">Tags</h2>
                    </div>

                    <div class="mb-3 col-xs-3 col-sm-3 col-3 col-md-3 col-lg-3 justify-content-end">
                        <button type="button" class="button--close" @click="closeTags()">
                            <i class="fa fa-solid fa-close"></i>
                        </button>
                    </div>
                </div>
            </div>

            <div class="sidebar-body">
                <div class="row">
                    <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
                        <label class="form-label"><i class="fa fa-tag" aria-hidden="true"></i> New tag</label>
                            <div class="input-group">
                            <input class="form-control" type="text" placeholder="Add a new tag" />
                            <button class="btn btn-outline-secondary" type="button">Add</button>
                        </div>
                    </div>

                    <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
                            <label class="form-label"><i class="fa fa-tags" aria-hidden="true"></i> Existing tags</label>
                        </div>
                        <ul class="list-group">
                            <li
                                class="list-group-item"
                                v-for="(tag, index) in getUniqueTags()"
                                v-bind:key="index"
                                @click="selectTag(tag)">
                                <span class="text-end">
                                    <span class="btn btn-xs btn-default" @click="selectTag(tag)">
                                        <i class="fa-regular " :class="isCurrentTag(tag) ? 'fa-square-check' : 'fa-square'"></i>
                                    </span>
                                </span>
                                
                                {{  tag.name || 'None' }} ({{ tag.count }})

                                
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import '../assets/right_sidebar.css'

    import {
        mapActions,
    } from 'pinia'
    import {
        useUiStore,
        useAccountsStore,
     } from '@/store'

    export default {
        async created() {
            await this.loadCache();
        },
        methods: {
            ...mapActions(useAccountsStore, [
                'loadCache',
                'getUniqueTags'
            ]),

            ...mapActions(useUiStore, [
                'closeTags'
            ]),

            selectTag: function (tag) {
                const tags = this.updateTags(tag);

                this.$router.push({name: 'Home', query: { tags: tags }});
            },

            updateTags: function (tag) {
                if (this.isCurrentTag(tag)) {
                    return this.removeTag(tag);
                }

                return this.addTag(tag);
            },

            addTag: function ({ name }) {
                let newTags = this.$route.query.tags ? this.$route.query.tags.split(',').map(x => x.trim()) : [];
                newTags.push(name);

                return newTags.join(',');
            },

            removeTag: function ({ name }) {
                let newTags = this.$route.query.tags ? this.$route.query.tags.split(',').map(x => x.trim()) : [];
                newTags.splice(newTags.indexOf(name), 1);
                
                return newTags.join(',');
            },

            isCurrentTag: function ({ name}) {
                return this.$route.query.tags && this.$route.query.tags.split(',').includes(name);
            },
		}
    }
</script>

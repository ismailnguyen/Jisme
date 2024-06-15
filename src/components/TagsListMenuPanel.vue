<template>
    <div class="row">
        <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
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
</template>

<script>
    import {
        mapActions,
    } from 'pinia'
    import {
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

            selectTag: function (tag) {
                const tags = this.updateTags(tag);

                this.$router.push({name: 'Home', query: {
                    tags: tags,
                    search: this.$route.query.search,
                    type: this.$route.query.type
                }});
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

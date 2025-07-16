<template>
    <div class="most-used-tags-list-container container-fluid">
        <div class="most-used-tags-list" v-if="isLoading">
            <div v-for="index in 5"
                v-bind:key="index">
                <div class="tag-circle">
                    <div class="tag-icon">
                        <i class="fa fa-loading" aria-hidden="true"></i>
                    </div>
                    <div class="tag-label placeholder col-4 me-3 mb-0"></div>
                </div>
            </div>
        </div>

        <div class="most-used-tags-list" v-else>
            <div v-for="(tag, index) in mostUsedTags"
                    v-bind:key="index"
                    @click.prevent="selectTag(tag)">
                <div class="tag-circle">
                    <div class="tag-icon">
                        <i class="fa fa-tag" aria-hidden="true"></i>
                    </div>
                </div>
                <div class="tag-label">{{ tag.name || 'None' }}</div>
            </div>

            <div @click.prevent="showMore()" v-show="!isShowingMore">
                <div class="tag-circle">
                    <div class="tag-icon">
                        <i class="fa fa-chevron-down" aria-hidden="true"></i>
                    </div>
                </div>
                <div class="tag-label">More</div>
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
        data() {
            return {
                isShowingMore: false,
                displayedTagsNb: 8 // Default show only 9 first tags
            }
        },
        computed: {
            mostUsedTags: function () {
                return this.getMostUsedTags().slice(0, this.displayedTagsNb);
            }
        },
        methods: {
            ...mapActions(useAccountsStore, [
                'getMostUsedTags'
            ]),
            
            selectTag: function (tag) {
                // Add the tag to the query parameters with existing tags
                let existingTags = this.$route.query.tags ? 
                    this.$route.query.tags.split(',').concat(tag.name) : 
                    [tag.name];

                let newTags = [...new Set(existingTags)].join(','); // Ensure unique tags

                this.$router.push({
                    name: 'Home',
                    query: {
                        tags: newTags,
                        search: this.$route.query.search,
                        type: this.$route.query.type
                    }
                });
            },

            showMore: function () {
                this.displayedTagsNb = this.getMostUsedTags().length;
                this.isShowingMore = true;
            }
        }
    }
</script>

<style scoped>
.most-used-tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem 1.2rem;
  justify-content: flex-start;
  align-items: flex-start;
  padding-bottom: 1rem;
}
@media (max-width: 767px) {
    .most-used-tags-list {
        flex-wrap: nowrap;
        overflow-x: auto;
    }
}
.tag-circle {
  background: #fff;
  border-radius: 50%;
  width: 4rem;
  height: 4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: box-shadow 0.2s;
}
.tag-circle:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.10);
}
.tag-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.3rem;
}
.tag-icon img {
  width: 36px;
  height: 36px;
  object-fit: contain;
}
.tag-label {
  font-size: 0.95rem;
  font-weight: 500;
  color: #222;
  text-align: center;
  margin-top: 0.2rem;
  white-space: pre-line;
}
</style>

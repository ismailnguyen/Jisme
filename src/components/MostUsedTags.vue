<template>
    <section class="tag-shelf" aria-labelledby="tag-shelf-title" v-if="isLoading || mostUsedTags.length">
        <div class="section-hd">
            <h2 id="tag-shelf-title"><i class="fa-solid fa-tags" aria-hidden="true"></i>Tags</h2>
        </div>
        <div class="tag-row" v-if="isLoading" aria-hidden="true">
            <span v-for="index in 4" :key="index" class="tag-pill placeholder-glow"><span class="placeholder col-12"></span></span>
        </div>
        <div class="tag-row" v-else>
            <button
                v-for="(tag, index) in mostUsedTags"
                :key="index"
                type="button"
                class="tag-pill"
                :aria-label="'Filter by tag ' + (tag.name || 'untagged')"
                @click="selectTag(tag)">
                {{ tag.name || 'Untagged' }}
            </button>
            <button type="button" class="tag-pill is-more" @click="showMore()" v-show="canShowMore">
                More
                <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
            </button>
        </div>
    </section>
</template>

<script>
    import { mapActions } from 'pinia'
    import { useAccountsStore } from '@/store'

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
                displayedTagsNb: 8
            }
        },
        computed: {
            mostUsedTags: function () {
                return this.getMostUsedTags().slice(0, this.displayedTagsNb);
            },

            canShowMore: function () {
                return !this.isShowingMore && this.getMostUsedTags().length > this.displayedTagsNb;
            }
        },
        methods: {
            ...mapActions(useAccountsStore, [
                'getMostUsedTags'
            ]),

            selectTag: function (tag) {
                let existingTags = this.$route.query.tags ?
                    this.$route.query.tags.split(',').concat(tag.name) :
                    [tag.name];

                let newTags = [...new Set(existingTags)].join(',');

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
.tag-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

@media (max-width: 767.98px) {
    .tag-row {
        flex-wrap: nowrap;
        overflow-x: auto;
        margin: 0 -16px;
        padding: 0 16px 2px;
        scrollbar-width: none;
    }

    .tag-row::-webkit-scrollbar {
        display: none;
    }
}

.tag-pill {
    flex: none;
    min-height: 36px;
    min-width: 44px;
    padding: 0 12px;
    border-radius: 999px;
    border: 1px solid var(--rule);
    background: var(--sheet);
    color: var(--ink);
    font-size: 13.5px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    box-shadow: 0 1px 2px rgba(46, 58, 79, 0.06);
}

.tag-pill:hover {
    border-color: var(--tint);
    background: #fff;
}

.tag-pill.is-more {
    color: var(--ink-2);
    border-style: dashed;
}

.tag-pill.is-more i {
    font-size: 10px;
}

.tag-pill .placeholder {
    width: 48px;
}

/* 36px pill + the row's own padding keeps the hit area at 44px */
.tag-pill::after {
    content: "";
    position: absolute;
    inset: -4px 0;
}

.tag-pill {
    position: relative;
}
</style>

<template>
    <section class="tag-shelf" aria-labelledby="tag-shelf-title" v-if="isLoading || mostUsedTags.length">
        <div class="section-hd">
            <h2 id="tag-shelf-title">Tags</h2>
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
                Show all
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
    gap: 8px;
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
    position: relative;
    flex: none;
    min-height: 34px;
    min-width: 44px;
    padding: 0 14px;
    border: 0;
    border-radius: 999px;
    background: var(--bg-2);
    color: var(--label);
    font-size: 15px;
    letter-spacing: -0.015em;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    cursor: pointer;
    transition: transform 0.2s var(--ease-out);
}

.tag-pill:active {
    transform: scale(0.95);
}

.tag-pill.is-more {
    background: none;
    color: var(--accent);
    padding: 0 8px;
}

.tag-pill .placeholder {
    width: 48px;
}

/* 34px capsule + the row's own gap keeps the hit area at 44px */
.tag-pill::after {
    content: "";
    position: absolute;
    inset: -5px 0;
}
</style>

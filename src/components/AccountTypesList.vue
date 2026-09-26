<template>
    <nav class="type-counters" aria-label="Filter by type">
        <template v-if="isLoading">
            <div v-for="index in 4" :key="index" class="type-counter is-loading placeholder-glow" aria-hidden="true">
                <span class="placeholder col-4"></span>
                <span class="placeholder col-8"></span>
            </div>
        </template>
        <template v-else>
            <button
                v-for="type in types"
                :key="type.key"
                type="button"
                class="type-counter"
                :aria-pressed="isSelected(type.key) ? 'true' : 'false'"
                :aria-label="`${ type.label }, ${ counts[type.key] || 0 } items`"
                @click="openAccountType(type.key)">
                <b><i :class="type.icon" aria-hidden="true"></i>{{ counts[type.key] || 0 }}</b>
                <span>{{ type.label }}</span>
            </button>
        </template>
    </nav>
</template>

<script>
    import { mapState } from 'pinia'
    import { useAccountsStore } from '@/store'

    export default {
        props: {
            isLoading: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                types: [
                    { key: 'account', label: 'Credentials', icon: 'fa-solid fa-key' },
                    { key: 'card', label: 'Cards', icon: 'fa-solid fa-credit-card' },
                    { key: 'document', label: 'Documents', icon: 'fa-solid fa-file-lines' },
                    { key: 'bank', label: 'Banks', icon: 'fa-solid fa-building-columns' }
                ]
            };
        },
        computed: {
            ...mapState(useAccountsStore, ['accounts']),

            counts: function () {
                return this.accounts.reduce((counts, account) => {
                    counts[account.type] = (counts[account.type] || 0) + 1;
                    return counts;
                }, {});
            }
        },
        methods: {
            isSelected(type) {
                const selected = this.$route.query.type ? this.$route.query.type.split(',').map(x => x.trim()) : [];
                return selected.includes(type);
            },

            openAccountType(type) {
                this.$router.push({
                    name: 'Home',
                    query: {
                        search: this.$route.query.search,
                        tags: this.$route.query.tags,
                        // Tapping the selected type again clears it
                        type: this.isSelected(type) ? undefined : type
                    }
                });
            }
        }
    };
</script>

<style scoped>
.type-counters {
    margin-top: 12px;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 6px;
}

@media (min-width: 768px) {
    .type-counters {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

.type-counter {
    min-height: 56px;
    padding: 8px 8px;
    border-radius: var(--r-md);
    background: var(--sheet);
    border: 1px solid var(--rule);
    color: var(--ink);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 2px;
    text-align: left;
    cursor: pointer;
    box-shadow: 0 1px 2px rgba(46, 58, 79, 0.06);
    transition: border-color 0.15s, background-color 0.15s;
}

.type-counter:hover {
    border-color: var(--tint);
    background: #fff;
}

.type-counter b {
    font-size: 18px;
    font-weight: 700;
    line-height: 1;
    display: flex;
    align-items: center;
    gap: 6px;
}

.type-counter b i {
    font-size: 11px;
    color: var(--ink-3);
}

.type-counter span {
    font-size: 11.5px;
    letter-spacing: -0.01em;
    font-weight: 500;
    color: var(--ink-2);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
}

.type-counter[aria-pressed="true"] {
    background: var(--ink);
    border-color: var(--ink);
    color: #fff;
}

.type-counter[aria-pressed="true"] span,
.type-counter[aria-pressed="true"] b i {
    color: rgba(255, 255, 255, 0.82);
}

.type-counter.is-loading {
    cursor: default;
    gap: 6px;
}

@media (max-width: 380px) {
    .type-counters {
        gap: 5px;
    }

    .type-counter span {
        font-size: 11px;
    }
}
</style>

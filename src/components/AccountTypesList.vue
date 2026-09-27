<template>
    <nav class="type-counters" aria-label="Filter by type">
        <template v-if="isLoading">
            <div v-for="index in 4" :key="index" class="type-counter is-loading placeholder-glow" aria-hidden="true">
                <span class="placeholder type-dot"></span>
                <span class="placeholder col-6"></span>
            </div>
        </template>
        <template v-else>
            <button
                v-for="type in types"
                :key="type.key"
                type="button"
                class="type-counter"
                :style="{ '--cat': `var(--cat-${ type.key })` }"
                :aria-pressed="isSelected(type.key) ? 'true' : 'false'"
                :aria-label="`${ type.label }, ${ counts[type.key] || 0 } items`"
                @click="openAccountType(type.key)">
                <span class="type-dot" aria-hidden="true"><i :class="type.icon"></i></span>
                <b aria-hidden="true">{{ counts[type.key] || 0 }}</b>
                <span class="type-name" aria-hidden="true">{{ type.label }}</span>
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
                    { key: 'document', label: 'Documents', icon: 'fa-solid fa-id-card' },
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
/* Category tiles, as in Reminders and Passwords: a colour circle, a count, a name */
.type-counters {
    margin-top: 16px;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
}

.type-counter {
    position: relative;
    min-height: 80px;
    padding: 10px 12px 9px;
    border: 0;
    border-radius: var(--r-lg);
    background: var(--bg-2);
    color: var(--label);
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-rows: auto 1fr;
    align-items: start;
    text-align: left;
    cursor: pointer;
    transition: transform 0.2s var(--ease-out), background-color 0.2s;
}

.type-counter:active {
    transform: scale(0.97);
}

.type-dot {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: var(--cat);
    color: #fff;
    font-size: 14px;
}

.type-counter b {
    font-family: var(--font-display);
    font-size: 26px;
    font-weight: 700;
    line-height: 30px;
    letter-spacing: 0.01em;
    font-variant-numeric: tabular-nums;
}

.type-name {
    grid-column: 1 / -1;
    align-self: end;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: -0.015em;
    color: var(--label-2);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* the chosen category fills with its colour */
.type-counter[aria-pressed="true"] {
    background: var(--cat);
    color: #fff;
}

.type-counter[aria-pressed="true"] .type-dot {
    background: #fff;
    color: var(--cat);
}

.type-counter[aria-pressed="true"] .type-name {
    color: #fff;
}

.type-counter.is-loading {
    cursor: default;
    grid-template-columns: 1fr;
    gap: 16px;
}

.type-counter.is-loading .placeholder {
    display: block;
    height: 12px;
}

.type-counter.is-loading .type-dot {
    height: 30px;
    background: var(--fill);
}
</style>

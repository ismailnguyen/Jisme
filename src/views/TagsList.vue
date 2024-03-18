<template>
    <div>
        <span
            class="badge badge-pill badge-primary"
            @click="selectTag(tag)"
            v-for="(tag, index) in getUniqueTags()"
            v-bind:key="index">
            {{  tag.name }}
            <span class="badge badge-light">{{ tag.count }}</span>
        </span>
    </div>
</template>

<script>
    import { onBeforeMount } from 'vue'
    import {
        useAccountsStore,
     } from '@/store'

    export default {
        setup() {
            const accountsStore = useAccountsStore()
            const { loadCache, getUniqueTags } = accountsStore

            onBeforeMount(async () => {
                await loadCache()
            })

            return {
                getUniqueTags,
            }
        },
        computed: {
			
		}
    }
</script>

<style scoped>
	@media (prefers-color-scheme: dark) {
		pre {
			color: #eee;
		}
	}
</style>

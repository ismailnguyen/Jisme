<template>
    <aside v-if="!userStore.isDemo" class="local-safety-notice" aria-label="Local vault storage safety">
        <details :open="accountsStore.hasLegacyPending || accountsStore.outbox.length > 0">
            <summary>Device storage: online sign-in required</summary>
            <p>Vault keys and new account data stay in memory on this device. Reloading requires you to sign in again online. Secure offline saving is unavailable until local vault unlock is ready.</p>
            <p v-if="accountsStore.hasLegacyPending" role="alert">Older local changes may exist on this device. They have no verified owner and are not sent automatically, displayed, overwritten or deleted. Do not clear browser storage. Keep this browser profile for owner-verified recovery; automatic recovery is not available yet. Close older Jisme tabs, which may still use the previous storage behavior.</p>
            <div v-if="accountsStore.outbox.length" role="alert">
                <p>Unsaved edits are in memory only. They will not sync automatically. Retry saving online before locking, signing out or closing this page; those actions discard them. Automatic lock also discards these edits.</p>
                <button v-for="(item, index) in accountsStore.outbox" :key="index" type="button" class="btn btn-sm btn-outline-secondary me-2" :disabled="item.inFlight" @click="uiStore.restorePendingEdit(index)">Reopen unsaved {{ item.type }} #{{ index + 1 }}</button>
            </div>
        </details>
    </aside>
</template>
<script>
import { mapStores } from 'pinia';
import { useAccountsStore, useUserStore, useUiStore } from '@/store';
export default {
    computed: { ...mapStores(useAccountsStore, useUserStore, useUiStore) },
};
</script>
<style scoped>
.local-safety-notice { padding: .5rem 1rem; background: var(--bs-warning-bg-subtle, #fff3cd); color: #493600; font-size: .85rem; }
.local-safety-notice p { margin: .5rem 0; }
</style>

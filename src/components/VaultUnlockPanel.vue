<template>
    <section v-if="isVisible && hasContent" class="vault-unlock-panel" aria-label="Vault">
        <p v-if="vaultStore.isSyncing && !vaultStore.isUnlocked" class="text-muted small mb-2" role="status">Loading vault…</p>

        <form v-if="vaultStore.hasVault && !vaultStore.isUnlocked" class="mb-2" @submit.prevent="onUnlock">
            <h2 class="h6 mb-2">Vault locked</h2>
            <label for="vault-unlock-phrase" class="form-label small">Vault unlock phrase</label>
            <div class="input-group input-group-sm">
                <input
                    id="vault-unlock-phrase"
                    v-model="phrase"
                    type="password"
                    class="form-control"
                    autocomplete="off"
                    :spellcheck="false"
                    :disabled="isBusy"
                    required>
                <button type="submit" class="btn btn-primary" :disabled="isBusy || !phrase">Unlock</button>
            </div>
            <p v-if="unlockError" class="text-danger small mt-1 mb-0" role="alert">{{ unlockError }}</p>
        </form>

        <p v-if="!vaultStore.hasVault && !vaultStore.hasServerVault && vaultStore.syncError" class="text-warning-emphasis small mb-0" role="alert">
            {{ vaultStore.syncError }}
        </p>

        <form v-if="vaultStore.isUnlocked && vaultStore.needsFreshSignIn" class="mb-2" @submit.prevent="onFreshSignIn">
            <label for="vault-fresh-password" class="form-label small">Re-enter your account password to save the vault</label>
            <div class="input-group input-group-sm">
                <input
                    id="vault-fresh-password"
                    v-model="password"
                    type="password"
                    class="form-control"
                    autocomplete="current-password"
                    :disabled="isBusy"
                    required>
                <button type="submit" class="btn btn-outline-primary" :disabled="isBusy || !password">Save vault</button>
            </div>
            <p v-if="freshSignInError || vaultStore.syncError" class="text-warning-emphasis small mt-1 mb-0" role="alert">
                {{ freshSignInError || vaultStore.syncError }}
            </p>
        </form>

        <div v-else-if="vaultStore.isUnlocked && vaultStore.syncError" class="d-flex align-items-center gap-2" role="alert">
            <span class="text-warning-emphasis small">{{ vaultStore.syncError }}</span>
            <button type="button" class="btn btn-sm btn-outline-secondary" :disabled="isBusy" @click="onRetrySync">Retry sync</button>
        </div>
    </section>
</template>

<script>
import { mapStores } from 'pinia';
import { useUserStore, useVaultStore } from '@/store';
import { VaultEnvelopeError } from '../utils/vaultKey';

// The phrase and password live only in this component's local state and are cleared after use.
export default {
    data () {
        return { phrase: '', password: '', unlockError: '', freshSignInError: '', isBusy: false };
    },
    computed: {
        ...mapStores(useUserStore, useVaultStore),
        isVisible () {
            return this.vaultStore.isEnabled && this.userStore.isLoggedIn && !this.userStore.isDemo;
        },
        hasContent () {
            const v = this.vaultStore;
            if (!v.isUnlocked) return v.isSyncing || v.hasVault || (!v.hasServerVault && !!v.syncError);
            return !!v.syncError || v.needsFreshSignIn;
        },
    },
    methods: {
        async onUnlock () {
            this.unlockError = '';
            this.isBusy = true;
            try {
                await this.vaultStore.unlock(this.phrase);
            } catch (error) {
                this.unlockError = error instanceof VaultEnvelopeError ? 'Wrong vault phrase.' : 'Could not unlock the vault.';
            } finally {
                this.phrase = '';
                this.isBusy = false;
            }
        },
        async onFreshSignIn () {
            this.freshSignInError = '';
            this.isBusy = true;
            try {
                await this.vaultStore.retryPushAfterFreshSignIn(this.password);
            } catch (error) {
                this.freshSignInError = error?.message || 'Sign-in failed.';
            } finally {
                this.password = '';
                this.isBusy = false;
            }
        },
        async onRetrySync () {
            this.isBusy = true;
            try {
                await this.vaultStore.pushToServer();
            } catch (_) {
                // pushToServer only throws when locked; the locked form takes over.
            } finally {
                this.isBusy = false;
            }
        },
    },
};
</script>

<style scoped>
.vault-unlock-panel { padding: .5rem 1rem; }
</style>

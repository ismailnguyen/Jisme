<template>
    <div class="security-controls passkey-manager">
        <ul class="passkey-list mb-3" v-if="passkeysStore.list.length">
            <li v-for="passkey in passkeysStore.list" :key="passkey.id" class="passkey-cell">
                <div class="passkey-heading">
                    <div class="passkey-details">
                        <div class="fw-medium">{{ passkey.name }}</div>
                        <small class="text-muted">
                            <template v-if="passkey.createdAt">
                                Added <time :datetime="passkey.createdAt">{{ formatDate(passkey.createdAt) }}</time>
                            </template>
                            <template v-else>Added with a previous version</template>
                        </small>
                    </div>
                    <button
                        type="button"
                        class="btn btn-secondary passkey-remove"
                        :aria-label="'Delete passkey ' + passkey.name"
                        :disabled="passkeysStore.deleteStatus === 'loading'"
                        @click="onRequestDelete(passkey.id)">
                        <i class="fa fa-trash" aria-hidden="true"></i>
                        <span class="passkey-remove-label">&nbsp;Remove</span>
                    </button>
                </div>

                <!-- Delete confirmation: the API requires the current password. -->
                <form
                    v-if="passkeysStore.pendingDeleteId === passkey.id"
                    class="passkey-confirm"
                    @submit.prevent="onConfirmDelete">
                    <label :for="'passkey-delete-password-' + passkey.id" class="form-label small">
                        Enter your current password to delete “{{ passkey.name }}”
                    </label>
                    <div class="security-fields">
                        <input
                            :id="'passkey-delete-password-' + passkey.id"
                            v-model="deletePassword"
                            type="password"
                            class="form-control"
                            autocomplete="current-password"
                            :disabled="passkeysStore.deleteStatus === 'loading'"
                            required>
                        <button type="submit" class="btn btn-secondary security-destructive" :disabled="passkeysStore.deleteStatus === 'loading' || !deletePassword">Delete passkey</button>
                        <button type="button" class="btn btn-outline-secondary" @click="onCancelDelete">Cancel</button>
                    </div>
                    <p v-if="passkeysStore.deleteError" class="security-error small mt-1 mb-0" role="alert">{{ passkeysStore.deleteError }}</p>
                </form>
            </li>
        </ul>
        <p v-else class="small text-muted">No passkeys yet.</p>

        <p v-if="passkeysStore.fetchError" class="security-error small" role="alert">{{ passkeysStore.fetchError }}</p>

        <div v-if="passkeysStore.isSupported">
            <button
                id="passwordlesslogin_btn"
                type="button"
                class="btn btn-danger btn-block"
                :disabled="isEnrolling"
                @click="onEnroll">
                <i class="fa fa-plus" aria-hidden="true"></i> Allow a new device to connect
            </button>
            <p v-if="isEnrolling" class="small text-muted mt-1 mb-0" role="status">Waiting for your passkey… follow your browser's prompt.</p>
            <p v-else-if="passkeysStore.enrollStatus === 'success'" class="small security-success mt-1 mb-0" role="status">Passkey added.</p>
            <p v-else-if="passkeysStore.enrollStatus === 'error'" class="security-error small mt-1 mb-0" role="alert">{{ passkeysStore.enrollError }}</p>
        </div>
        <button
            v-else
            id="passwordlesslogin_unsupported_btn"
            class="btn btn-danger btn-block"
            disabled>
            <i class="fa fa-ban"></i> Passkey not supported in this device
        </button>

        <!-- Vault passkey unlock (PRF): the phrase re-derives the key once to wrap it for a passkey. -->
        <form v-if="canEnableVaultUnlock" class="mt-3" @submit.prevent="onEnableVaultUnlock">
            <h3 class="h6 mb-1">Unlock the vault with a passkey</h3>
            <p class="small text-muted mb-2">
                {{ vaultStore.hasPasskeyUnlock ? 'Passkey unlock is on. Add another passkey with your vault phrase.' : 'Enter your vault phrase once; your passkey then unlocks the vault on this account.' }}
            </p>
            <div class="security-fields">
                <input
                    id="passkey-vault-phrase"
                    v-model="vaultPhrase"
                    type="password"
                    class="form-control"
                    autocomplete="off"
                    :spellcheck="false"
                    :disabled="vaultStatus === 'loading'"
                    aria-label="Vault unlock phrase"
                    required>
                <button type="submit" class="btn btn-outline-primary" :disabled="vaultStatus === 'loading' || !vaultPhrase">Enable passkey unlock</button>
            </div>
            <p v-if="vaultStatus === 'loading'" class="small text-muted mt-1 mb-0" role="status">Waiting for your passkey…</p>
            <p v-else-if="vaultStatus === 'success'" class="small security-success mt-1 mb-0" role="status">Passkey unlock enabled.</p>
            <p v-else-if="vaultStatus === 'error'" class="security-error small mt-1 mb-0" role="alert">{{ vaultError }}</p>
        </form>
    </div>
</template>

<script>
import { mapStores } from 'pinia';
import { useUserStore, useVaultStore } from '@/store';
import usePasskeysStore from '../store/passkeys';
import { errorText } from '../utils/apiError';
import { VaultEnvelopeError } from '../utils/vaultKey';

export default {
    data () {
        return { deletePassword: '', vaultPhrase: '', vaultStatus: 'idle', vaultError: '' };
    },
    computed: {
        ...mapStores(usePasskeysStore, useVaultStore, useUserStore),
        isEnrolling () {
            return this.passkeysStore.enrollStatus === 'loading';
        },
        canEnableVaultUnlock () {
            const v = this.vaultStore;
            return v.isEnabled && v.hasVault && !this.userStore.isDemo && this.passkeysStore.isSupported
                && this.passkeysStore.list.some(p => p.verified);
        },
    },
    mounted () { this.passkeysStore.fetchPasskeys(); },
    watch: {
        'userStore.user.token': {
            handler () { this.passkeysStore.fetchPasskeys(); },
        },
    },
    methods: {
        formatDate (value) {
            const date = new Date(value);
            return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, { dateStyle: 'medium' });
        },
        // One ceremony only: the name prompt, then the browser's passkey prompt.
        async onEnroll () {
            const deviceName = window.prompt('Enter a device name', 'Device #1');
            if (!deviceName) return;
            await this.passkeysStore.enroll(deviceName);
        },
        onRequestDelete (id) {
            const passkey = this.passkeysStore.list.find(p => p.id === id);
            if (!window.confirm('Do you want to delete passkey for ' + (passkey ? passkey.name : id) + '?')) return;
            this.deletePassword = '';
            this.passkeysStore.requestDelete(id);
        },
        onCancelDelete () {
            this.deletePassword = '';
            this.passkeysStore.cancelDelete();
        },
        async onConfirmDelete () {
            try {
                await this.passkeysStore.confirmDelete(this.deletePassword);
            } finally {
                this.deletePassword = '';
            }
        },
        async onEnableVaultUnlock () {
            this.vaultStatus = 'loading';
            this.vaultError = '';
            try {
                await this.vaultStore.enablePasskeyUnlock(this.vaultPhrase);
                this.vaultStatus = 'success';
                // Sync the wrap into the server blob only when the vault is unlocked (push requires the key).
                if (this.vaultStore.isUnlocked) await this.vaultStore.pushToServer();
            } catch (error) {
                this.vaultStatus = 'error';
                this.vaultError = error instanceof VaultEnvelopeError
                    ? 'Wrong vault phrase.' : errorText(error, 'Could not enable passkey unlock.');
            } finally {
                this.vaultPhrase = '';
            }
        },
    },
};
</script>

<style scoped src="./securityControls.css"></style>

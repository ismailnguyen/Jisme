<template>
    <section v-if="isVisible && hasContent" class="vault-unlock-panel" aria-label="Vault">
        <p v-if="vaultStore.isSyncing && !vaultStore.isUnlocked" class="text-muted small mb-2" role="status">Loading vault…</p>

        <!-- First-run setup: no vault exists yet (docs/vault-recovery-design.md). -->
        <form v-if="canSetup && !showRecoveryCode" class="mb-2" @submit.prevent="onSetup">
            <h2 class="h6 mb-2">Create your vault</h2>
            <p class="small text-muted mb-2">
                Choose an unlock phrase (at least 12 characters). It never leaves this device and cannot be
                reset — but with a recovery code you can re-seal the vault if you forget it.
            </p>
            <label for="vault-setup-phrase" class="form-label small">New vault phrase</label>
            <input
                id="vault-setup-phrase"
                v-model="setupPhrase"
                type="password"
                class="form-control form-control-sm mb-2"
                autocomplete="new-password"
                :spellcheck="false"
                :disabled="isBusy"
                required>
            <label for="vault-setup-confirm" class="form-label small">Confirm the phrase</label>
            <input
                id="vault-setup-confirm"
                v-model="setupConfirm"
                type="password"
                class="form-control form-control-sm mb-2"
                autocomplete="new-password"
                :spellcheck="false"
                :disabled="isBusy"
                required>
            <label for="vault-setup-password" class="form-label small">Your login password (to check the phrase differs from it)</label>
            <input
                id="vault-setup-password"
                v-model="setupPassword"
                type="password"
                class="form-control form-control-sm mb-2"
                autocomplete="current-password"
                :disabled="isBusy"
                required>
            <p v-if="setupError" class="text-danger small mt-1 mb-1" role="alert">{{ setupError }}</p>
            <button type="submit" class="btn btn-primary btn-sm" :disabled="isBusy || !setupPhrase || !setupConfirm || !setupPassword">Create vault</button>
        </form>

        <!-- The recovery code is shown exactly ONCE, with an acknowledgement before dismissal. -->
        <RecoveryCodeReveal
            v-if="showRecoveryCode"
            :code="recoveryCode"
            title="Save your recovery code"
            warning="This code is shown only once. If you lose both the unlock phrase and this code, the vault is unrecoverable. No one can restore it — write the code down and keep it somewhere safe."
            confirm-label="I saved this code somewhere safe"
            checkbox-id="vault-recovery-ack"
            @done="dismissRecoveryCode" />

        <!-- Passkey unlock (WebAuthn PRF): the key is derived locally; phrase unlock stays the fallback. -->
        <div v-if="vaultStore.hasVault && !vaultStore.isUnlocked && vaultStore.hasPasskeyUnlock" class="mb-2">
            <button type="button" class="btn btn-primary btn-sm" :disabled="isBusy" @click="onPasskeyUnlock">
                <i class="fa fa-fingerprint" aria-hidden="true"></i>
                {{ passkeyBusy ? 'Waiting for your passkey…' : 'Unlock with passkey' }}
            </button>
            <p v-if="passkeyError" class="text-danger small mt-1 mb-0" role="alert">{{ passkeyError }}</p>
        </div>

        <form v-if="vaultStore.hasVault && !vaultStore.isUnlocked" class="mb-2" @submit.prevent="onUnlock">
            <h2 class="h6 mb-2">Vault locked</h2>
            <label for="vault-unlock-phrase" class="form-label small">{{ vaultStore.hasPasskeyUnlock ? 'Or use your vault unlock phrase' : 'Vault unlock phrase' }}</label>
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
            <button
                v-if="vaultStore.hasRecovery && mode !== 'recovery'"
                type="button"
                class="btn btn-link btn-sm p-0 mt-1"
                :disabled="isBusy"
                @click="mode = 'recovery'">Forgot the phrase? Use the recovery code</button>
        </form>

        <!-- Recovery unlock: the code alone re-derives the key; a new phrase is then required. -->
        <form v-if="mode === 'recovery' && vaultStore.hasVault && !vaultStore.isUnlocked" class="mb-2" @submit.prevent="onRecoveryUnlock">
            <h2 class="h6 mb-2">Unlock with the recovery code</h2>
            <label for="vault-recovery-code" class="form-label small">Recovery code</label>
            <div class="input-group input-group-sm">
                <input
                    id="vault-recovery-code"
                    v-model="recoveryInput"
                    type="text"
                    class="form-control"
                    autocomplete="off"
                    :spellcheck="false"
                    :disabled="isBusy"
                    required>
                <button type="submit" class="btn btn-primary" :disabled="isBusy || !recoveryInput">Unlock</button>
            </div>
            <p v-if="recoveryError" class="text-danger small mt-1 mb-0" role="alert">{{ recoveryError }}</p>
            <p class="small text-muted mt-1 mb-0">You will have to set a new phrase before using the vault.</p>
        </form>

        <!-- Needs re-seal: the vault's key params are weaker than this client seals with. -->
        <div v-if="vaultStore.needsReseal && !vaultStore.isUnlocked" class="text-warning-emphasis small mb-2" role="alert">
            This vault uses outdated security parameters. Unlock it, then set a new phrase to re-seal it.
        </div>

        <!-- Phrase reset / re-seal: after recovery unlock, or to upgrade weak params. -->
        <form v-if="showResetForm && !showRecoveryCode" class="mb-2" @submit.prevent="onResetPhrase">
            <h2 class="h6 mb-2">Set a new vault phrase</h2>
            <p v-if="vaultStore.needsPhraseReset" class="small text-muted mb-2">
                The vault was unlocked with the recovery code. Choose a new phrase (and a new recovery code
                will be shown once) to finish.
            </p>
            <label for="vault-reset-phrase" class="form-label small">New vault phrase</label>
            <input
                id="vault-reset-phrase"
                v-model="resetPhraseValue"
                type="password"
                class="form-control form-control-sm mb-2"
                autocomplete="new-password"
                :spellcheck="false"
                :disabled="isBusy"
                required>
            <label for="vault-reset-confirm" class="form-label small">Confirm the new phrase</label>
            <input
                id="vault-reset-confirm"
                v-model="resetConfirm"
                type="password"
                class="form-control form-control-sm mb-2"
                autocomplete="new-password"
                :spellcheck="false"
                :disabled="isBusy"
                required>
            <label for="vault-reset-password" class="form-label small">Your login password (to check the phrase differs from it)</label>
            <input
                id="vault-reset-password"
                v-model="resetPassword"
                type="password"
                class="form-control form-control-sm mb-2"
                autocomplete="current-password"
                :disabled="isBusy"
                required>
            <p v-if="resetError" class="text-danger small mt-1 mb-1" role="alert">{{ resetError }}</p>
            <button type="submit" class="btn btn-primary btn-sm" :disabled="isBusy || !resetPhraseValue || !resetConfirm || !resetPassword">Re-seal vault</button>
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
import { PrfUnsupportedError } from '../utils/vaultPasskey';
import { errorText } from '../utils/apiError';
import RecoveryCodeReveal from './RecoveryCodeReveal.vue';

// The phrase, recovery code and passwords live only in this component's local state
// and are cleared after use. The recovery code is never sent to the store to keep.
export default {
    components: { RecoveryCodeReveal },
    data () {
        return {
            // unlock / sync (unchanged)
            phrase: '', password: '', unlockError: '', freshSignInError: '', isBusy: false,
            // setup + recovery code reveal (shown exactly once, dismissed on acknowledgement)
            setupPhrase: '', setupConfirm: '', setupPassword: '', setupError: '',
            recoveryCode: '', pushAfterDismiss: false,
            // passkey (PRF) unlock
            passkeyBusy: false, passkeyError: '',
            // recovery unlock ("Forgot the phrase?")
            mode: 'vault', recoveryInput: '', recoveryError: '',
            // phrase reset / re-seal
            resetPhraseValue: '', resetConfirm: '', resetPassword: '', resetError: '',
        };
    },
    computed: {
        ...mapStores(useUserStore, useVaultStore),
        isVisible () {
            return this.vaultStore.isEnabled && this.userStore.isLoggedIn && !this.userStore.isDemo;
        },
        canSetup () {
            const v = this.vaultStore;
            return !v.hasVault && !v.isSyncing && !v.hasServerVault;
        },
        showRecoveryCode () {
            return !!this.recoveryCode;
        },
        showResetForm () {
            const v = this.vaultStore;
            return v.isUnlocked && (v.needsPhraseReset || v.needsReseal || this.mode === 'reset');
        },
        hasContent () {
            const v = this.vaultStore;
            if (!v.isUnlocked) {
                return v.isSyncing || v.hasVault || (!v.hasServerVault && !!v.syncError)
                    || this.canSetup || v.needsReseal;
            }
            return !!v.syncError || v.needsFreshSignIn || v.needsReseal || v.needsPhraseReset || this.showRecoveryCode;
        },
    },
    methods: {
        clearSecrets () {
            this.setupPhrase = ''; this.setupConfirm = ''; this.setupPassword = '';
            this.recoveryInput = ''; this.resetPhraseValue = ''; this.resetConfirm = ''; this.resetPassword = '';
        },
        async onSetup () {
            this.setupError = '';
            if (this.setupPhrase !== this.setupConfirm) {
                this.setupError = 'The phrases do not match.';
                this.setupPhrase = ''; this.setupConfirm = '';
                return;
            }
            this.isBusy = true;
            try {
                // Returned exactly once; kept only in this component until dismissed.
                this.recoveryCode = await this.vaultStore.setup(this.setupPhrase, { loginPassword: this.setupPassword });
            } catch (error) {
                this.setupError = error?.message || 'Could not create the vault.';
            } finally {
                this.clearSecrets();
                this.isBusy = false;
            }
        },
        dismissRecoveryCode () {
            const push = this.pushAfterDismiss;
            this.recoveryCode = '';
            this.pushAfterDismiss = false;
            this.mode = 'vault';
            // After a phrase reset, sync the re-sealed vault to the server.
            if (push && this.vaultStore.isUnlocked && !this.vaultStore.needsPhraseReset) this.onRetrySync();
        },
        async onRecoveryUnlock () {
            this.recoveryError = '';
            this.isBusy = true;
            try {
                await this.vaultStore.unlockWithRecovery(this.recoveryInput);
                this.mode = 'reset';
            } catch (error) {
                this.recoveryError = error instanceof VaultEnvelopeError
                    ? 'Wrong recovery code.' : (error?.message || 'Could not unlock the vault.');
            } finally {
                this.clearSecrets();
                this.isBusy = false;
            }
        },
        async onResetPhrase () {
            this.resetError = '';
            if (this.resetPhraseValue !== this.resetConfirm) {
                this.resetError = 'The phrases do not match.';
                this.resetPhraseValue = ''; this.resetConfirm = '';
                return;
            }
            this.isBusy = true;
            try {
                // New recovery code, shown exactly once like at setup.
                this.recoveryCode = await this.vaultStore.resetPhrase(this.resetPhraseValue, { loginPassword: this.resetPassword });
                this.pushAfterDismiss = true;
                this.mode = 'vault';
            } catch (error) {
                this.resetError = error?.message || 'Could not re-seal the vault.';
            } finally {
                this.clearSecrets();
                this.isBusy = false;
            }
        },
        async onUnlock () {
            this.unlockError = '';
            this.isBusy = true;
            try {
                await this.vaultStore.unlock(this.phrase);
                this.mode = 'vault';
            } catch (error) {
                this.unlockError = error instanceof VaultEnvelopeError ? 'Wrong vault phrase.' : 'Could not unlock the vault.';
            } finally {
                this.phrase = '';
                this.isBusy = false;
            }
        },
        async onPasskeyUnlock () {
            this.passkeyError = '';
            this.unlockError = '';
            this.isBusy = true;
            this.passkeyBusy = true;
            try {
                await this.vaultStore.unlockWithPasskey();
                this.mode = 'vault';
            } catch (error) {
                if (error instanceof VaultEnvelopeError) {
                    this.passkeyError = 'This passkey cannot unlock the vault. Use your vault phrase.';
                } else if (error instanceof PrfUnsupportedError) {
                    this.passkeyError = error.message + ' Use your vault phrase.';
                } else {
                    this.passkeyError = errorText(error, 'Could not unlock the vault with a passkey.');
                }
            } finally {
                this.passkeyBusy = false;
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

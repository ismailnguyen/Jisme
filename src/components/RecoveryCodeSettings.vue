<template>
    <div class="security-controls recovery-code-settings">
        <RecoveryCodeReveal
            v-if="passkeysStore.recoveryCode"
            :code="passkeysStore.recoveryCode"
            title="Your account recovery code"
            warning="This code is shown only once and replaces any previous one. Anyone holding it can recover your account: store it offline, somewhere safe."
            checkbox-id="account-recovery-ack"
            @done="passkeysStore.dismissRecoveryCode()" />

        <template v-else>
            <p class="small text-muted mb-2">
                A recovery code lets you get back into your account if you lose your passkeys and password.
                Generating a new code invalidates the previous one.
            </p>
            <button
                type="button"
                class="btn btn-outline-primary"
                :disabled="passkeysStore.recoveryStatus === 'loading'"
                @click="passkeysStore.generateRecoveryCode()">
                <i class="fa fa-key" aria-hidden="true"></i>
                {{ passkeysStore.recoveryStatus === 'loading' ? 'Generating…' : 'Generate recovery code' }}
            </button>
            <p v-if="passkeysStore.recoveryStatus === 'error'" class="security-error small mt-2 mb-0" role="alert">{{ passkeysStore.recoveryError }}</p>
        </template>
    </div>
</template>

<script>
import { mapStores } from 'pinia';
import usePasskeysStore from '../store/passkeys';
import RecoveryCodeReveal from './RecoveryCodeReveal.vue';

export default {
    components: { RecoveryCodeReveal },
    computed: {
        ...mapStores(usePasskeysStore),
    },
};
</script>

<style scoped src="./securityControls.css"></style>

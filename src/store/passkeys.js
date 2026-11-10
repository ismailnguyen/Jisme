// Settings > Security: passkey management and the one-time account recovery code
// (docs/passkey-ux-design.md). UI state lives here so every state is renderable and testable.
// Errors always surface the server reason (errorText), never a generic "Not authorized!".
import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { useUserStore } from '@/store';
import { PasskeyService } from '../services/PasskeyService';
import { registerPasskey, isWebAuthnSupported } from '../utils/webauthn';
import { errorText } from '../utils/apiError';

// Server shape { id, name, createdAt, verified } and the legacy client shape
// { deviceName, passkey: { id } } (never verified: those need re-enrollment).
export function normalizePasskey (p) {
    if (!p || typeof p !== 'object') return null;
    const id = p.id ?? p.credentialId ?? p.passkey?.id;
    if (typeof id !== 'string' || !id) return null;
    return {
        id,
        name: p.name || p.deviceName || 'Passkey',
        createdAt: p.createdAt ?? p.created_at ?? null,
        verified: p.verified === true,
    };
}

const usePasskeysStore = defineStore('passkeys', () => {
    const userStore = useUserStore();
    const service = new PasskeyService();

    const list = computed(() => (userStore.user?.passkeys || []).map(normalizePasskey).filter(Boolean));
    const isSupported = computed(() => isWebAuthnSupported());

    // 'idle' | 'loading' | 'success' | 'error'
    const enrollStatus = ref('idle');
    const enrollError = ref('');
    const pendingDeleteId = ref(null);
    const deleteStatus = ref('idle');
    const deleteError = ref('');
    const recoveryStatus = ref('idle');
    const recoveryError = ref('');
    // Shown exactly once; memory only, cleared on dismiss. Never written to the user object.
    const recoveryCode = ref('');

    const token = () => userStore.user?.token;
    const setPasskeys = (passkeys) => { if (userStore.user) userStore.user.passkeys = passkeys; };

    async function enroll (name) {
        enrollError.value = '';
        const label = typeof name === 'string' ? name.trim() : '';
        if (!label) {
            enrollStatus.value = 'error';
            enrollError.value = 'Give this passkey a name.';
            return;
        }
        enrollStatus.value = 'loading';
        const session = userStore.user;
        try {
            const options = await service.registrationOptions(token());
            const challenge = options.challenge;
            const response = await registerPasskey(options);
            const credential = await service.register(token(), { challenge, response });
            if (userStore.user !== session) return;
            const added = credential && typeof credential === 'object'
                ? { verified: true, createdAt: new Date().toISOString(), name: label, ...credential }
                : { id: response.id, name: label, createdAt: new Date().toISOString(), verified: true };
            await userStore.clearSessionEnvelope(added.id);
            setPasskeys([...(userStore.user.passkeys || []).filter(p => normalizePasskey(p)?.id !== added.id), added]);
            enrollStatus.value = 'success';
            return added;
        } catch (error) {
            if (userStore.user !== session) return;
            enrollStatus.value = 'error';
            enrollError.value = errorText(error, 'Could not add the passkey.');
        }
    }

    function requestDelete (id) {
        pendingDeleteId.value = id;
        deleteStatus.value = 'idle';
        deleteError.value = '';
    }

    function cancelDelete () {
        pendingDeleteId.value = null;
        deleteStatus.value = 'idle';
        deleteError.value = '';
    }

    async function confirmDelete (password) {
        const id = pendingDeleteId.value;
        if (!id) return;
        deleteError.value = '';
        if (typeof password !== 'string' || !password) {
            deleteStatus.value = 'error';
            deleteError.value = 'Enter your current password to delete this passkey.';
            return;
        }
        deleteStatus.value = 'loading';
        try {
            await service.remove(token(), id, password);
            await userStore.clearSessionEnvelope(id);
            setPasskeys((userStore.user?.passkeys || []).filter(p => normalizePasskey(p)?.id !== id));
            pendingDeleteId.value = null;
            deleteStatus.value = 'success';
        } catch (error) {
            deleteStatus.value = 'error';
            deleteError.value = errorText(error, 'Could not delete the passkey.');
        }
    }

    async function generateRecoveryCode () {
        recoveryError.value = '';
        recoveryCode.value = '';
        recoveryStatus.value = 'loading';
        try {
            const body = await service.createRecoveryCode(token());
            const code = body?.code ?? body?.recoveryCode;
            if (typeof code !== 'string' || !code) throw new Error('The server did not return a recovery code.');
            recoveryCode.value = code;
            recoveryStatus.value = 'success';
        } catch (error) {
            recoveryStatus.value = 'error';
            recoveryError.value = errorText(error, 'Could not generate a recovery code.');
        }
    }

    function dismissRecoveryCode () {
        recoveryCode.value = '';
        recoveryStatus.value = 'idle';
    }

    return {
        list,
        isSupported,
        enrollStatus,
        enrollError,
        pendingDeleteId,
        deleteStatus,
        deleteError,
        recoveryStatus,
        recoveryError,
        recoveryCode,
        enroll,
        requestDelete,
        cancelDelete,
        confirmDelete,
        generateRecoveryCode,
        dismissRecoveryCode,
    };
});

export default usePasskeysStore;

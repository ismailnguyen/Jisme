<template>
    <div
        class="state-pill vault-status"
        :class="stateClass"
        role="status"
        :aria-label="label">
        <i class="fa-solid" :class="icon" aria-hidden="true"></i>
        <span>{{ primary }}</span>
        <template v-if="secondary">
            <span class="sep" aria-hidden="true">·</span>
            <span>{{ secondary }}</span>
        </template>
        <span class="ok" v-if="state === 'synced'" aria-hidden="true"><i class="fa-solid fa-check"></i></span>
    </div>
</template>

<script>
import { mapState } from 'pinia';
import { useAccountsStore, useNetworkStore, useUserStore } from '@/store';

export default {
    computed: {
        ...mapState(useNetworkStore, ['isOffline']),
        ...mapState(useAccountsStore, ['isSyncing', 'outbox', 'areAccountsLoaded']),
        ...mapState(useUserStore, ['isLoggedIn', 'isDemo']),

        pendingChanges: function () {
            return Array.isArray(this.outbox) ? this.outbox.length : 0;
        },

        state: function () {
            if (!this.isLoggedIn) return 'locked';
            if (this.isDemo) return 'demo';
            if (this.isOffline) return 'offline';
            if (this.isSyncing || !this.areAccountsLoaded || this.pendingChanges) return 'syncing';
            return 'synced';
        },

        stateClass: function () {
            return 'is-' + this.state;
        },

        icon: function () {
            return {
                locked: 'fa-lock',
                demo: 'fa-flask',
                offline: 'fa-cloud-arrow-up',
                syncing: 'fa-rotate',
                synced: 'fa-lock-open',
            }[this.state];
        },

        primary: function () {
            return {
                locked: 'Locked',
                demo: 'Demo',
                offline: 'Offline',
                syncing: 'Unlocked',
                synced: 'Unlocked',
            }[this.state];
        },

        secondary: function () {
            if (this.state === 'offline') {
                return this.pendingChanges
                    ? `${ this.pendingChanges } change${ this.pendingChanges > 1 ? 's' : '' } held`
                    : 'works offline';
            }
            if (this.state === 'demo') return 'nothing is saved';
            if (this.state === 'syncing') return 'syncing';
            if (this.state === 'synced') return 'synced';
            return '';
        },

        label: function () {
            return 'Vault ' + [this.primary, this.secondary].filter(Boolean).join(', ').toLowerCase();
        },
    },
};
</script>

<style scoped>
/* Dashed edge: a sandbox, not a sealed vault */
.vault-status.is-demo {
    border-style: dashed;
    border-color: var(--ink-2);
}

.vault-status.is-syncing .fa-rotate {
    animation: spin 1.6s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
</style>

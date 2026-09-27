<template>
    <nav class="home-dock" aria-label="Vault actions">
        <button type="button" class="dock-btn" aria-label="Lock vault" title="Lock" @click="onLock">
            <i class="fa-solid fa-lock" aria-hidden="true"></i>
        </button>
        <VaultStatus class="dock-status" />
        <button type="button" class="dock-btn" aria-label="New item" title="New item" @click="onNewItem">
            <i class="fa-solid fa-pen-to-square" aria-hidden="true"></i>
        </button>
    </nav>
</template>

<script>
import { mapActions, mapState } from 'pinia';
import { useUiStore, useUserStore } from '@/store';
import VaultStatus from './VaultStatus.vue';

export default {
    components: {
        VaultStatus,
    },
    computed: {
        ...mapState(useUiStore, ['SIDEBAR', 'isSidebarOpen']),
    },
    methods: {
        ...mapActions(useUiStore, ['toggleSidebar', 'openSidebar', 'closeSidebar']),
        ...mapActions(useUserStore, ['lock']),

        onNewItem: function () {
            this.closeSidebar(this.SIDEBAR.MENU);
            this.openSidebar(this.SIDEBAR.ADD_ACCOUNT);
        },

        onLock: function () {
            this.lock('Sign in again to open it.');
        },
    },
};
</script>

<style scoped>
/* The iOS toolbar: translucent, full width, Lock left, the vault's state centred, New right */
.home-dock {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 40;
    height: calc(var(--toolbar-h) + env(safe-area-inset-bottom));
    padding: 0 6px env(safe-area-inset-bottom);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    background: var(--material);
    -webkit-backdrop-filter: saturate(180%) blur(20px);
    backdrop-filter: saturate(180%) blur(20px);
    border-top: var(--hair) solid var(--sep);
}

@media (min-width: 768px) {
    .home-dock {
        right: auto;
        width: var(--sidebar-w);
    }
}

.dock-btn {
    width: 44px;
    height: 44px;
    flex: none;
    border: 0;
    border-radius: 22px;
    background: none;
    color: var(--accent);
    font-size: 21px;
    display: grid;
    place-items: center;
    cursor: pointer;
    transition: opacity 0.2s;
}

.dock-btn:active {
    opacity: 0.4;
}

.dock-status {
    min-width: 0;
    overflow: hidden;
}
</style>

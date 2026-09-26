<template>
    <nav class="home-dock" aria-label="Vault actions">
        <button
            type="button"
            class="dock-side"
            :aria-expanded="isSidebarOpen(SIDEBAR.MENU) ? 'true' : 'false'"
            @click="toggleSidebar(SIDEBAR.MENU)">
            <i class="fa-solid fa-bars" aria-hidden="true"></i>
            Menu
        </button>
        <button type="button" class="dock-primary" @click="onNewItem">
            <i class="fa-solid fa-plus" aria-hidden="true"></i>
            New item
        </button>
        <button type="button" class="dock-side" @click="onLock">
            <i class="fa-solid fa-lock" aria-hidden="true"></i>
            Lock
        </button>
    </nav>
</template>

<script>
import { mapActions, mapState } from 'pinia';
import { useUiStore, useUserStore } from '@/store';

export default {
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
.home-dock {
    position: fixed;
    left: 50%;
    bottom: calc(14px + env(safe-area-inset-bottom));
    transform: translateX(-50%);
    width: min(420px, calc(100% - 32px));
    height: 68px;
    z-index: 40;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0 8px;
    border-radius: var(--r-xl);
    background: var(--sheet);
    box-shadow: var(--shadow-3);
}

@media (min-width: 768px) {
    .home-dock {
        left: max(24px, calc((100vw - 1280px) / 2 + 24px));
        width: 332px;
        transform: none;
    }
}

.dock-side {
    width: 64px;
    height: 56px;
    border: 0;
    border-radius: var(--r-lg);
    background: none;
    color: var(--ink);
    font-size: 12px;
    font-weight: 600;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    cursor: pointer;
}

.dock-side i {
    font-size: 17px;
}

.dock-side:hover,
.dock-side[aria-expanded="true"] {
    background: var(--field);
}

.dock-primary {
    flex: 1;
    height: 52px;
    border: 0;
    border-radius: var(--r-lg);
    background: var(--ink);
    color: #fff;
    font-size: 16px;
    font-weight: 700;
    letter-spacing: -0.005em;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    cursor: pointer;
    box-shadow: var(--shadow-ink);
    transition: transform 0.15s var(--ease-out);
}

.dock-primary:hover {
    background: #243044;
}

.dock-primary:active {
    transform: translateY(1px);
}
</style>

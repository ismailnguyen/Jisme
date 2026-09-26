<template>
    <section class="first-envelope" aria-labelledby="first-envelope-title">
        <div class="first-window win">
            <h2 id="first-envelope-title">Your vault is empty</h2>
            <p>Logins, payment and loyalty cards, IDs, IBANs, Wi-Fi and verification codes all fit in one place.</p>
        </div>
        <div class="first-seal tint" aria-hidden="true"></div>
        <p class="first-note">
            <i class="fa-solid fa-lock" aria-hidden="true"></i>
            Each item is encrypted on this device before it syncs.
        </p>
        <button type="button" class="btn btn-primary btn-lg first-cta" @click="onAddAccount()">
            <i class="fa-solid fa-plus" aria-hidden="true"></i>
            Add your first item
        </button>
    </section>
</template>

<style scoped>
.first-envelope {
    margin-top: 16px;
    padding: 12px 12px 16px;
    border-radius: var(--r-md);
    background: var(--sheet);
    box-shadow: var(--shadow-2);
}

.first-window {
    padding: 18px 16px;
}

.first-window h2 {
    font-size: 20px;
    font-weight: 800;
    margin-bottom: 6px;
}

.first-window p {
    font-size: 14.5px;
    line-height: 1.5;
    color: var(--ink-2);
    margin: 0;
    max-width: 38ch;
}

.first-seal {
    height: 28px;
    margin-top: 10px;
    border-radius: 5px;
    box-shadow: inset 0 0 0 1px rgba(46, 58, 79, 0.18);
}

.first-note {
    margin: 12px 4px;
    font-size: 13px;
    color: var(--ink-2);
    display: flex;
    gap: 8px;
    align-items: center;
}

.first-cta {
    width: 100%;
    min-height: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    font-size: 16px;
    font-weight: 700;
}
</style>

<script>
import { mapState, mapActions } from "pinia";
import { useUiStore } from "@/store";

export default {
    computed: {
        ...mapState(useUiStore, [
            'SIDEBAR'
        ])
    },
    methods: {
        ...mapActions(useUiStore, [
            'openSidebar',
        ]),

        onAddAccount: function () {
            this.openSidebar(this.SIDEBAR.ADD_ACCOUNT);
        },
    },
};
</script>

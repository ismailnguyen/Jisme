<template>
    <section class="empty-vault" aria-labelledby="empty-vault-title">
        <span class="empty-glyph" aria-hidden="true"><i class="fa-solid fa-key"></i></span>
        <h2 id="empty-vault-title">Your vault is empty</h2>
        <p>Logins, payment and loyalty cards, IDs, IBANs, Wi-Fi and verification codes all fit in one place.</p>
        <p class="empty-note">
            <i class="fa-solid fa-lock" aria-hidden="true"></i>
            Each item is encrypted on this device before it syncs.
        </p>
        <button type="button" class="btn btn-primary btn-lg empty-cta" @click="onAddAccount()">
            Add your first item
        </button>
    </section>
</template>

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

<style scoped>
/* An iOS empty state: a glyph, a title, one line, one filled button */
.empty-vault {
    margin: 24px 0;
    padding: 36px 20px 24px;
    border-radius: var(--r-md);
    background: var(--bg-2);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

.empty-glyph {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: var(--cat-account);
    color: #fff;
    font-size: 26px;
    margin-bottom: 16px;
}

.empty-vault h2 {
    margin: 0 0 6px;
    font-size: 22px;
    font-weight: 700;
    letter-spacing: -0.01em;
}

.empty-vault p {
    max-width: 34ch;
    margin: 0;
    font-size: 15px;
    line-height: 1.4;
    color: var(--label-2);
}

.empty-vault .empty-note {
    margin-top: 12px;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 6px;
}

.empty-cta {
    width: 100%;
    max-width: 320px;
    min-height: 50px;
    margin-top: 24px;
}
</style>

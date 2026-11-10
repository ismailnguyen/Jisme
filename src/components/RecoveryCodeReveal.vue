<template>
    <!-- A one-time code: shown once, with a copy button, a warning and an acknowledgement before dismissal. -->
    <div class="recovery-code-reveal mb-2" role="alertdialog" :aria-label="title">
        <h2 class="h6 mb-2">{{ title }}</h2>
        <p class="small text-danger-emphasis mb-2">{{ warning }}</p>
        <code class="d-block p-2 mb-2 border rounded user-select-all">{{ code }}</code>
        <div class="d-flex align-items-center gap-2 mb-2">
            <button type="button" class="btn btn-sm btn-outline-secondary" @click="copy">Copy</button>
            <span v-if="copied" class="small text-muted" role="status">Copied!</span>
            <span v-if="copyFailed" class="small text-warning-emphasis" role="status">Copy failed: select the code and copy it manually.</span>
        </div>
        <div class="form-check mb-2">
            <input :id="checkboxId" v-model="saved" class="form-check-input" type="checkbox">
            <label class="form-check-label small" :for="checkboxId">{{ confirmLabel }}</label>
        </div>
        <button type="button" class="btn btn-primary btn-sm" :disabled="!saved" @click="done">Done</button>
    </div>
</template>

<script>
export default {
    props: {
        code: { type: String, required: true },
        title: { type: String, default: 'Save your recovery code' },
        warning: { type: String, default: 'This code is shown only once. Store it somewhere safe and offline.' },
        confirmLabel: { type: String, default: 'I copied this code and saved it somewhere safe' },
        checkboxId: { type: String, default: 'recovery-code-ack' },
    },
    emits: ['done'],
    data () {
        return { saved: false, copied: false, copyFailed: false };
    },
    methods: {
        copy () {
            this.copied = false;
            this.copyFailed = false;
            const clip = globalThis.navigator?.clipboard;
            if (!clip?.writeText) { this.copyFailed = true; return; }
            clip.writeText(this.code).then(() => { this.copied = true; }, () => { this.copyFailed = true; });
        },
        done () {
            if (!this.saved) return;
            this.saved = false;
            this.copied = false;
            this.$emit('done');
        },
    },
};
</script>

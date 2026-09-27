<template>
    <div
        class="toast-slip"
        :class="'is-' + type"
        :role="isUrgent ? 'alert' : 'status'"
        :aria-live="isUrgent ? 'assertive' : 'polite'">
        <span class="toast-mark" aria-hidden="true">
            <img v-if="image && !isImageBroken" :src="image" alt="" @error="isImageBroken = true">
            <i v-else class="fa-solid" :class="icon"></i>
        </span>
        <span class="toast-text">
            <b>{{ title }}</b>
            <small v-if="message">{{ message }}</small>
        </span>
        <button type="button" class="toast-close" aria-label="Dismiss" @click="close()">
            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>
    </div>
</template>

<script>
    import { mapState, mapActions } from 'pinia'
    import { useAlertStore } from '@/store'

    export default {
        data() {
            return {
                isImageBroken: false
            }
        },
        watch: {
            currentAlert() {
                this.isImageBroken = false;
            }
        },
        computed: {
            ...mapState(useAlertStore, [
                'currentAlert'
            ]),

            title: function () {
                return this.currentAlert && this.currentAlert.title || '';
            },

            message: function () {
                return this.currentAlert && this.currentAlert.message || '';
            },

            image: function () {
                return this.currentAlert && this.currentAlert.image || null;
            },

            type: function () {
                return this.currentAlert && this.currentAlert.type || 'info';
            },

            isUrgent: function () {
                return this.type === 'danger' || this.type === 'warning';
            },

            icon: function () {
                return {
                    success: 'fa-check',
                    info: 'fa-check',
                    warning: 'fa-cloud-arrow-up',
                    danger: 'fa-triangle-exclamation',
                }[this.type] || 'fa-check';
            }
        },
        methods: {
            ...mapActions(useAlertStore, [
                'clearAlert'
            ]),

            close: function () {
                this.clearAlert();
            }
        }
    }
</script>

<style scoped>
/* An iOS banner: a blurred capsule that drops in at the top, the same on every size */
.toast-slip {
    position: fixed;
    z-index: 9999;
    top: calc(10px + env(safe-area-inset-top));
    left: 50%;
    width: max-content;
    min-width: min(260px, calc(100% - 24px));
    max-width: min(440px, calc(100% - 24px));
    min-height: 56px;
    padding: 8px 6px 8px 10px;
    border-radius: 28px;
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--material);
    -webkit-backdrop-filter: saturate(180%) blur(24px);
    backdrop-filter: saturate(180%) blur(24px);
    color: var(--label);
    box-shadow: var(--shadow-pop);
    transform: translateX(-50%);
    animation: banner-in 0.5s var(--ease-out) both;
}

.toast-mark {
    width: 34px;
    height: 34px;
    flex: none;
    border-radius: 50%;
    background: var(--green);
    color: #fff;
    display: grid;
    place-items: center;
    font-size: 15px;
    overflow: hidden;
}

.toast-mark:has(img) {
    border-radius: 8px;
    background: #fff;
    box-shadow: inset 0 0 0 var(--hair) rgba(0, 0, 0, 0.14);
}

.toast-slip.is-danger .toast-mark {
    background: var(--red);
}

.toast-slip.is-warning .toast-mark {
    background: var(--orange);
}

.toast-mark img {
    width: 22px;
    height: 22px;
    object-fit: contain;
}

.toast-text {
    min-width: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 1px 0;
}

.toast-text b {
    font-size: 15px;
    font-weight: 600;
    letter-spacing: -0.015em;
    line-height: 1.3;
}

.toast-text small {
    font-size: 13px;
    letter-spacing: -0.005em;
    line-height: 1.3;
    color: var(--label-2);
    overflow-wrap: anywhere;
}

.toast-close {
    width: 40px;
    height: 40px;
    flex: none;
    border: 0;
    border-radius: 50%;
    background: none;
    color: var(--label-3);
    display: grid;
    place-items: center;
    cursor: pointer;
}

.toast-close:hover {
    background: var(--fill-4);
    color: var(--label-2);
}

@keyframes banner-in {
    from { opacity: 0; transform: translate(-50%, -24px) scale(0.96); }
    to { opacity: 1; transform: translate(-50%, 0); }
}
</style>

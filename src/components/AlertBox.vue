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
.toast-slip {
    position: fixed;
    z-index: 9999;
    top: calc(10px + env(safe-area-inset-top));
    left: 50%;
    width: max-content;
    max-width: min(440px, calc(100% - 24px));
    min-height: 48px;
    padding: 6px 4px 6px 8px;
    border-radius: 24px;
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--ink);
    color: #fff;
    box-shadow: 0 4px 10px rgba(20, 28, 40, 0.25), 0 12px 24px rgba(20, 28, 40, 0.2);
    transform: translateX(-50%);
    animation: slip-in 0.35s var(--ease-out) both;
}

@media (min-width: 768px) {
    .toast-slip {
        top: auto;
        bottom: 24px;
        left: auto;
        right: 24px;
        transform: none;
        animation-name: slip-up;
    }
}

.toast-slip.is-danger {
    background: var(--red);
}

.toast-mark {
    width: 28px;
    height: 28px;
    flex: none;
    border-radius: 50%;
    background: #fff;
    color: var(--ink);
    display: grid;
    place-items: center;
    font-size: 12px;
    overflow: hidden;
}

.toast-slip.is-danger .toast-mark {
    color: var(--red);
}

.toast-mark img {
    width: 18px;
    height: 18px;
    object-fit: contain;
}

.toast-text {
    min-width: 0;
    display: flex;
    flex-direction: column;
    padding: 2px 0;
}

.toast-text b {
    font-size: 14.5px;
    font-weight: 700;
    line-height: 1.3;
}

.toast-text small {
    font-size: 13px;
    line-height: 1.35;
    color: rgba(255, 255, 255, 0.84);
    overflow-wrap: anywhere;
}

.toast-close {
    width: 40px;
    height: 40px;
    flex: none;
    border: 0;
    border-radius: 50%;
    background: none;
    color: rgba(255, 255, 255, 0.84);
    display: grid;
    place-items: center;
    cursor: pointer;
}

.toast-close:hover {
    background: rgba(255, 255, 255, 0.12);
    color: #fff;
}

.toast-close:focus-visible {
    outline-color: #fff;
}

@keyframes slip-in {
    from { opacity: 0; transform: translate(-50%, -12px); }
    to { opacity: 1; transform: translate(-50%, 0); }
}

@keyframes slip-up {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: none; }
}
</style>

<template>
    <div class="secret-strip" :class="{ 'is-open': isRevealed, 'is-empty': !value }">
        <button
            type="button"
            class="strip-face"
            :disabled="!value"
            :aria-pressed="isRevealed ? 'true' : 'false'"
            :aria-label="value ? (isRevealed ? `Hide ${ label }` : `Show ${ label }`) : `No ${ label } saved`"
            @pointerdown="onPointerDown"
            @pointerup="onPointerUp"
            @pointerleave="onPointerCancel"
            @pointercancel="onPointerCancel"
            @contextmenu.prevent
            @keydown.enter.prevent="toggle"
            @keydown.space.prevent="toggle"
            @click.prevent>
            <span v-if="isRevealed" class="strip-value mono">{{ value }}</span>
            <span v-else-if="value" class="strip-dots" aria-hidden="true">{{ hint || '••••••••••' }}</span>
            <span v-else class="strip-empty" aria-hidden="true">No {{ label }} saved</span>
            <span v-if="value && !isRevealed" class="strip-hint" aria-hidden="true" title="Tap or hold to show"><i class="fa-regular fa-eye"></i></span>
        </button>
        <p class="strip-timer" v-if="isRevealed && !isHolding" aria-live="polite">
            <i class="fa-solid fa-eye" aria-hidden="true"></i>
            Visible · hides in {{ secondsLeft }}s
            <button type="button" class="strip-reseal" @click="hide">Hide</button>
        </p>
    </div>
</template>

<script>
import { REVEAL_DURATION_MS } from '../utils/secrets';

// A tap shorter than this keeps the secret open; a longer press reveals only while held
const HOLD_THRESHOLD_MS = 300;

export default {
    props: {
        value: { type: String, default: '' },
        label: { type: String, default: 'secret' },
        hint: { type: String, default: '' },
    },
    emits: ['reveal'],
    data() {
        return {
            isRevealed: false,
            isHolding: false,
            secondsLeft: 0,
        };
    },
    watch: {
        value() {
            this.hide();
        },
    },
    beforeUnmount() {
        this.clearTimers();
    },
    methods: {
        clearTimers() {
            clearTimeout(this.pressTimer);
            clearInterval(this.countdownTimer);
        },

        reveal() {
            if (!this.value) return;
            this.isRevealed = true;
            this.$emit('reveal');
        },

        hide() {
            this.clearTimers();
            this.isRevealed = false;
            this.isHolding = false;
        },

        // Tap or keyboard: stay open for a while, then reseal on its own
        openForAWhile() {
            this.reveal();
            this.isHolding = false;
            this.secondsLeft = Math.round(REVEAL_DURATION_MS / 1000);
            clearInterval(this.countdownTimer);
            this.countdownTimer = setInterval(() => {
                this.secondsLeft -= 1;
                if (this.secondsLeft <= 0) this.hide();
            }, 1000);
        },

        toggle() {
            if (this.isRevealed) {
                this.hide();
            } else {
                this.openForAWhile();
            }
        },

        onPointerDown(event) {
            if (!this.value || event.button > 0) return;

            if (this.isRevealed) {
                this.hide();
                this.wasToggledOff = true;
                return;
            }

            this.wasToggledOff = false;
            this.pressStartedAt = Date.now();
            this.reveal();
            this.isHolding = true;
        },

        onPointerUp() {
            if (this.wasToggledOff || !this.isHolding) return;

            const heldFor = Date.now() - this.pressStartedAt;

            if (heldFor < HOLD_THRESHOLD_MS) {
                this.openForAWhile();
            } else {
                // Released after a hold: seal it straight back
                this.hide();
            }
        },

        onPointerCancel() {
            if (this.isHolding) {
                this.hide();
            }
        },
    },
};
</script>

<style scoped>
/* Passwords-style: dots until you ask; the value shows in SF Mono, then hides itself again */
.strip-face {
    width: 100%;
    min-height: 30px;
    padding: 0;
    border: 0;
    background: none;
    color: var(--label);
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    text-align: left;
    cursor: pointer;
    touch-action: manipulation;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
}

.strip-face:disabled {
    cursor: default;
}

.strip-face:focus-visible {
    outline-offset: 4px;
    border-radius: 4px;
}

.strip-dots {
    font-size: 17px;
    letter-spacing: 0.06em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.strip-hint {
    flex: none;
    font-size: 15px;
    color: var(--label-3);
    transition: opacity 0.2s;
}

.strip-face:active .strip-hint {
    opacity: 0;
}

.strip-value {
    display: block;
    font-size: 17px;
    line-height: 1.35;
    word-break: break-all;
    user-select: text;
    -webkit-user-select: text;
    animation: show-secret 0.35s var(--ease-out);
}

@keyframes show-secret {
    from { opacity: 0; filter: blur(4px); }
}

.strip-empty {
    font-size: 17px;
    color: var(--label-3);
}

.strip-timer {
    margin: 4px 0 0;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: var(--red);
}

.strip-reseal {
    margin-left: auto;
    min-height: 32px;
    padding: 0 4px;
    border: 0;
    background: none;
    color: var(--accent);
    font-size: 15px;
    cursor: pointer;
}
</style>

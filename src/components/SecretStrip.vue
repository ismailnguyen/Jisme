<template>
    <div class="secret-strip" :class="{ 'is-open': isRevealed, 'is-empty': !value }">
        <button
            type="button"
            class="strip-face"
            :disabled="!value"
            :aria-pressed="isRevealed ? 'true' : 'false'"
            :aria-label="value ? (isRevealed ? `Hide ${ label }` : `Reveal ${ label }`) : `No ${ label } saved`"
            @pointerdown="onPointerDown"
            @pointerup="onPointerUp"
            @pointerleave="onPointerCancel"
            @pointercancel="onPointerCancel"
            @contextmenu.prevent
            @keydown.enter.prevent="toggle"
            @keydown.space.prevent="toggle"
            @click.prevent>
            <span class="strip-value carbon" :aria-hidden="isRevealed ? 'false' : 'true'">{{ isRevealed ? value : '' }}</span>
            <span class="strip-seal tint" aria-hidden="true">
                <span class="strip-label">
                    <i v-if="value" class="fa-solid fa-fingerprint"></i>
                    {{ value ? (hint ? hint : 'Hold to reveal') : `No ${ label } saved` }}
                </span>
            </span>
        </button>
        <p class="strip-timer" v-if="isRevealed && !isHolding" aria-live="polite">
            <i class="fa-solid fa-eye" aria-hidden="true"></i>
            Visible · reseals in {{ secondsLeft }}s
            <button type="button" class="strip-reseal" @click="hide">Reseal now</button>
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
.strip-face {
    position: relative;
    display: block;
    width: 100%;
    min-height: 44px;
    padding: 0;
    border: 0;
    border-radius: var(--r-sm);
    background: #fff;
    overflow: hidden;
    cursor: pointer;
    touch-action: manipulation;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
    box-shadow: inset 0 0 0 1px rgba(46, 58, 79, 0.22), inset 0 1px 3px rgba(46, 58, 79, 0.18);
}

.strip-face:disabled {
    cursor: default;
}

.strip-value {
    display: block;
    padding: 11px 14px;
    font-size: 17px;
    line-height: 1.3;
    text-align: left;
    word-break: break-all;
    user-select: text;
    -webkit-user-select: text;
}

/* The tint peels off to the right and slides back when resealed */
.strip-seal {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    clip-path: inset(0 0 0 0);
    transition: clip-path 0.42s var(--ease-out);
}

.is-open .strip-seal {
    clip-path: inset(0 0 0 100%);
}

.strip-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: 30px;
    padding: 0 12px;
    border-radius: 999px;
    background: var(--sheet);
    color: var(--ink);
    font-size: 13.5px;
    font-weight: 600;
    white-space: nowrap;
    box-shadow: 0 1px 2px rgba(46, 58, 79, 0.25), 0 3px 8px rgba(46, 58, 79, 0.12);
}

.is-empty .strip-seal {
    background: var(--field);
    justify-content: flex-start;
    padding-left: 2px;
}

.is-empty .strip-label {
    box-shadow: none;
    background: transparent;
    color: var(--ink-3);
}

.is-open .strip-face {
    box-shadow: inset 0 0 0 1.5px var(--red);
}

.strip-timer {
    margin: 6px 0 0;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12.5px;
    font-weight: 600;
    color: var(--red);
}

.strip-reseal {
    margin-left: auto;
    min-height: 32px;
    padding: 0 4px;
    border: 0;
    background: none;
    color: var(--red);
    font-weight: 700;
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
}
</style>

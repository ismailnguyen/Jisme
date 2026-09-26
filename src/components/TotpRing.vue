<template>
    <div class="totp-ring" :class="{ 'is-ending': remaining <= 5 }" role="timer" :aria-label="`${ remaining } seconds until a new code`">
        <svg viewBox="0 0 44 44" aria-hidden="true">
            <circle cx="22" cy="22" r="18" fill="none" stroke="var(--rule)" stroke-width="3.5" />
            <circle
                class="arc"
                cx="22"
                cy="22"
                r="18"
                fill="none"
                stroke="currentColor"
                stroke-width="3.5"
                stroke-linecap="round"
                :stroke-dasharray="`${ dash } ${ CIRCUMFERENCE }`" />
        </svg>
        <span aria-hidden="true">{{ remaining }}s</span>
    </div>
</template>

<script>
const CIRCUMFERENCE = 2 * Math.PI * 18;

export default {
    props: {
        remaining: { type: Number, default: 30 },
        period: { type: Number, default: 30 },
    },
    data() {
        return { CIRCUMFERENCE };
    },
    computed: {
        dash() {
            return Math.max(0, Math.min(1, this.remaining / this.period)) * CIRCUMFERENCE;
        },
    },
};
</script>

<style scoped>
.totp-ring {
    position: relative;
    width: 44px;
    height: 44px;
    flex: none;
    color: var(--ink);
}

.totp-ring svg {
    position: absolute;
    inset: 0;
    transform: rotate(-90deg);
}

.arc {
    transition: stroke-dasharray 0.9s linear;
}

.totp-ring span {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    font-size: 12px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
}

.totp-ring.is-ending {
    color: var(--ink-3);
}
</style>

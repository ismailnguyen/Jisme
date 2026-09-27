<template>
    <header class="login-hero col-12 col-md-6 col-lg-6">
        <div class="login-brand">
            <span class="login-mark" :class="{ 'is-working': isLoading }">
                <img src="../assets/logo_medium.png" alt="" width="34" height="34">
            </span>
            <span class="login-name">Jisme</span>
            <span class="state-pill login-state" role="status">
                <i class="fa-solid" :class="isLoading ? 'fa-rotate' : 'fa-lock'" aria-hidden="true"></i>
                {{ isLoading ? 'Unlocking' : 'Locked' }}
            </span>
        </div>

        <h1 class="login-title">Your secrets, sealed on this device.</h1>
        <p class="login-lede">
            Every item is encrypted before it leaves your device. The code is open source, so you can
            <a href="https://github.com/ismailnguyen/jisme" target="_blank" rel="noopener">read every line<span class="visually-hidden"> (opens GitHub)</span></a>.
        </p>
    </header>
</template>

<script>
    export default {
        props: {
            isLoading: Boolean
        }
    }
</script>

<style scoped>
/* The app icon, the name, a large title: the first screen of an iOS app */
.login-hero {
    padding: 0 20px;
}

.login-brand {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 28px;
}

.login-mark {
    width: 64px;
    height: 64px;
    border-radius: 15px;
    display: grid;
    place-items: center;
    background: var(--bg-2);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08), 0 6px 18px rgba(0, 0, 0, 0.08);
}

.login-mark img {
    width: 42px;
    height: 42px;
}

.login-mark.is-working {
    animation: breathe 1.2s var(--ease-out) infinite alternate;
}

.login-name {
    font-family: var(--font-display);
    font-size: 28px;
    font-weight: 700;
    letter-spacing: 0.01em;
}

.login-state {
    margin-left: auto;
    font-size: 13px;
}

.login-state .fa-rotate {
    animation: spin 1.4s linear infinite;
}

.login-title {
    font-size: clamp(34px, 9vw, 52px);
    font-weight: 700;
    line-height: 1.08;
    letter-spacing: -0.01em;
    max-width: 14ch;
    margin-bottom: 14px;
    text-wrap: balance;
}

.login-lede {
    font-size: 17px;
    line-height: 1.45;
    color: var(--label-2);
    max-width: 40ch;
    margin: 0;
}

@media (max-width: 767.98px) {
    .login-hero {
        padding: calc(16px + env(safe-area-inset-top)) 16px 0;
    }

    .login-brand {
        margin-bottom: 24px;
    }
}

@keyframes breathe {
    to { transform: scale(0.94); }
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
</style>

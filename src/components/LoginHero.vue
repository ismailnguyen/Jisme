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
.login-hero {
    padding: 0 20px;
}

.login-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 28px;
}

.login-mark {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    background: var(--sheet);
    box-shadow: 0 0 0 1px rgba(46, 58, 79, 0.1), var(--shadow-1);
}

.login-mark.is-working {
    animation: breathe 1.4s var(--ease-out) infinite alternate;
}

.login-name {
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.02em;
}

.login-state {
    margin-left: auto;
}

.login-state .fa-rotate {
    animation: spin 1.4s linear infinite;
}

.login-title {
    font-size: clamp(30px, 8.4vw, 52px);
    font-weight: 800;
    line-height: 1.04;
    letter-spacing: -0.035em;
    max-width: 14ch;
    margin-bottom: 14px;
    text-wrap: balance;
}

.login-lede {
    font-size: 16px;
    line-height: 1.55;
    color: var(--ink-2);
    max-width: 40ch;
    margin: 0;
}

.login-lede a {
    color: var(--ink);
    font-weight: 600;
}

@media (max-width: 767.98px) {
    .login-hero {
        padding: calc(12px + env(safe-area-inset-top)) 16px 0;
    }

    .login-brand {
        margin-bottom: 22px;
    }
}

@keyframes breathe {
    to { transform: scale(0.94); }
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
</style>

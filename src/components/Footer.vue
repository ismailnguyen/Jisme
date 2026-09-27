<script setup>
    // can't be used directly on the template
    const app_name = __APP_NAME__
    const version = __APP_VERSION__
</script>

<template>
    <footer class="paper-footer d-none d-md-flex">
        <span class="carbon">&copy; {{ (new Date()).getFullYear() }} {{ app_name }} · v{{ version }}</span>
        <a href="https://github.com/ismailnguyen/jisme" target="_blank" rel="noopener">
            Source on GitHub<span class="visually-hidden"> (opens in a new tab)</span>
        </a>
    </footer>
</template>

<style scoped>
.paper-footer {
    height: 56px;
    max-width: 1080px;
    margin: 0 auto;
    padding: 0 24px;
    align-items: center;
    justify-content: space-between;
    font-size: 13px;
    color: var(--label-2);
}

.paper-footer a {
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    color: var(--accent);
}
</style>

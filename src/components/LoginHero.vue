<template>
    <div class="d-flex justify-content-center text-bg-primary">
        <div class="col-12 col-xl-9">
            <img class="img-fluid rounded mb-4" :class="isLoading ? 'loader-animate' : ''" loading="lazy" src="images/touch/favicon64.png" alt="Jisme">
            <hr class="border-primary-subtle mb-4">
            <h2 class="h1 mb-4">We protect your integrity.</h2>
            <p class="lead mb-5">An open source password manager, check it out at <a href="https://github.com/ismailnguyen/jisme" class="external-link" target="_blank">github.com/ismailnguyen/jisme</a>.</p>
            <div class="text-endx">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" class="bi bi-grip-horizontal" viewBox="0 0 16 16">
                    <path d="M2 8a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0-3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm3 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0-3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm3 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0-3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm3 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0-3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm3 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0-3a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
                </svg>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        props: {
            isLoading: Boolean
        }
    }
</script>

<style scoped>
    a.external-link {
        color: var(--color-text);
    }

    a.external-link:hover {
        color: var(--color-background);
        text-decoration: none;
        background: var(--color-text);
    }
</style>
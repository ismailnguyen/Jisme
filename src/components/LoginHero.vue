

<template>
    <div class="col-xs-12 col-md-7 col-lg-7 px-4 text-center text-lg-start">
        <img class="img-fluid rounded mb-4" :class="isLoading ? 'loader-animate' : ''" loading="lazy" src="../assets/logo_medium.png" alt="Jisme">

        <h1 class="display-4 fw-bold lh-1 mb-3">We protect your integrity.</h1>
        <p class="col-lg-10 fs-4">
            An open source password manager, check it out at <a href="https://github.com/ismailnguyen/jisme" class="external-link" target="_blank">github.com/jisme</a>.
        </p>
        <div class="text-end d-none d-md-block">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" class="bi bi-grip-horizontal" viewBox="0 0 16 16">
                <path d="M2 8a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0-3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm3 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0-3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm3 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0-3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm3 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0-3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm3 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0-3a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
            </svg>
        </div>
        <div class="text-center d-sm-block d-md-none py-5">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" class="bi bi-grip-horizontal" viewBox="0 0 16 16">
                <path d="M2 8a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0-3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm3 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0-3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm3 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0-3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm3 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0-3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm3 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0-3a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
            </svg>
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
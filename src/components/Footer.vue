<script setup>
    // can't be used directly on the template
    const version = __APP_VERSION__
</script>

<template>
    <div class="container d-none d-md-block">
        <footer class="d-flex flex-wrap justify-content-between align-items-center py-3 my-4 border-top">
            <div class="col-md-4 d-flex align-items-center">
                <a href="/" class="mb-3 me-2 mb-md-0 text-body-secondary text-decoration-none lh-1">
                    <img
                    class="img-fluid"
                    loading="lazy"
                    src="../assets/logo_medium.png"
                    height="30"
                    width="30"
                    alt="Jisme">
                </a>
                <span class="mb-3 mb-md-0 text-body-secondary">
                    &copy; {{ (new Date()).getFullYear() }} Jisme
                </span>
            </div>

            <span class="badge-secondary">
            v. {{ version }}
            </span>
        </footer>
    </div>
</template>

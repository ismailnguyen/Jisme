<script setup>
    // can't be used directly on the template
    const version = __APP_VERSION__
</script>

<template>
    <div class="container">
        <footer class="d-flex flex-wrap justify-content-between align-items-center py-3 my-4 border-top">
            <div class="col-md-4 d-flex align-items-center">
            <span class="mb-3 mb-md-0 text-body-secondary">&copy; {{ (new Date()).getFullYear() }} Jisme</span>
            </div>

            <span class="col-md-4 justify-content-end d-flex">
            v. {{ version }}
            </span>
        </footer>
    </div>
</template>

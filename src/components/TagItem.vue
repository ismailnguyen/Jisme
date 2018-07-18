<template>
    <div class="col-sm-12 col-md-6 col-lg-4">
        <div class="card">
            <div class="card-header text-center">
                <router-link :to="{ name: 'Tag', params: { tag: tag } }">
                    <h6 class="card-title">
                        {{ tag }}
                    </h6>
                </router-link>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        props: ['tag']
    }
</script>

<style>
    .card {
      color: black;
      background: #ffffff6b;
      border: none;
      border-radius: 1.55rem;
      margin: 10px;
      box-shadow: 0 0 2rem rgba(0,0,255,.1);
    }

    .card-header {
        background: none;
        border: none;
    }

    .card-header a {
        color: black;
        text-decoration: none;
    }
</style>
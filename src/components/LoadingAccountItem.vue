<template>
    <div class="card-wrapper col-12 col-xs-12 col-sm-12 col-md-4 col-lg-3">
        <div class="card clickable">
            <div class="card-image-wrapper col-xs-3">
                <img
                    :src="getIcon"
                    loading="lazy"
                    class="card-icon" />
            </div>

            <div class="card-header tags placeholder-glow">
                <span class="placeholder col-4 bg-primary"></span>
            </div>

            <div class="card-body">
                <h2 class="card-title placeholder-glow">
                    <span class="placeholder col-6"></span>
                </h2>

                <div class="row">
                    <div class="col-sm-12">
                        <span class="placeholder col-4"></span>
                    </div>
                </div>

                <div class="row">
                    <div class="col-sm-12">
                        <span class="placeholder col-8"></span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import '../assets/card.css'

    import { generateInitialIcon } from "../utils/icon.js";

    export default {
        computed: {
            getIcon: function () {
                return generateInitialIcon('', '#878f96');
            }
        }
    }
</script>

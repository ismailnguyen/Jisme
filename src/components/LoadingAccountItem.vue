<template>
<div class="card-wrapper col-12 col-xs-12 col-sm-12 col-md-6 col-lg-6 col-xl-4">
        <div class="card clickable">
            <div class="card-body">
                <div class="row">
                    <div class="col-12 tags placeholder-glow">
                        <span class="placeholder col-4 bg-primary"></span>
                    </div>
                </div>

                <div class="row">
                    <div class="col-8 align-self-center">
                        <h2 class="card-title placeholder-glow">
                            <span class="placeholder col-6"></span>
                        </h2>
                    </div>

                    <div class="col-4 align-self-center">
                        <img
                        :src="getIcon"
                        loading="lazy"
                        class="card-icon float-end" />
                    </div>
                </div>

                <div class="row">
                    <div class="col-12">
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

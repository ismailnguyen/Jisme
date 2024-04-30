<template>
    <div class="card-wrapper col-12 col-xs-12 col-sm-12" :class="layoutAdjustmentCss">
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

    const cardSizeMapping= {
        small: 'col-md-4 col-lg-3',
        medium: 'col-md-6 col-lg-6 col-xl-6',
        large: 'col-lg-12 col-xl-12',
    }

    export default {
        props: {
            size: {
                type: String,
                default: 'small'
            },
        },
        computed: {
            layoutAdjustmentCss: function () {
                return cardSizeMapping[this.size] || cardSizeMapping['small'];
            },

            getIcon: function () {
                return this.generateInitialIcon();
            }
        },
        methods: {
            generateInitialIcon: function () {
                let avatar, ctx, color;

                //creating canvas
                avatar = document.createElement("canvas");
                avatar.width = avatar.height = "48";
                ctx = avatar.getContext("2d");
                ctx.font = `${avatar.width / 2}px Arial`;
                ctx.textAlign = "center";

                //generating color
                color = '#878f96';

                //function to create avatar
                //clear canvas
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, avatar.width, avatar.height);

                //add background
                ctx.fillStyle = `${color}60`;
                ctx.fillRect(0, 0, avatar.width, avatar.height);

                //generate as Image
                return avatar.toDataURL();
            },
        }
    }
</script>

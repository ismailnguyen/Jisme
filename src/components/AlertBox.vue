<template>
    <div id="alert" class="alert alert-dismissible fade show" :class="type">
        
        <img
            v-if="image"
            :src="image"
            loading="lazy"
            :alt="title"
            :title="title"
            class="alert-image" />

        <strong>
            {{ title }}
        </strong>
        
        <p>
            {{ message }}
        </p>

        <button type="button" class="close" @click="close()" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>

    </div>
</template>

<script>
    export default {
        props: {
            alertDetails: Object
        },
        methods: {
            close: function () {
                this.$emit('closeAlert');
            }
        },
        computed: {
            title: function () {
                return this.alertDetails.title;
            },

            message: function () {
                return this.alertDetails.message;
            },

            image: function () {
                return this.alertDetails.image;
            },

            type: function () {
                return  'alert-' + this.alertDetails.type;
            }
        }
    } 
</script>

<style scoped>
    .alert {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 99999;
    }

    .alert-image {
        width: 40px;
        height: 40px;
        margin-right: 10px;
        background-color: white;
        border-radius: 15px;
    }
</style>
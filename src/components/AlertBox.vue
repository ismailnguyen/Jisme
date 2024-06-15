<template>
    <div class="alert alert-dismissible fade show" role="alert" :class="type">
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

        <button type="button" class="btn-close" data-dismiss="alert" aria-label="Close" @click="close()"></button>
    </div>
   
</template>

<script>
    import {
        mapState,
        mapActions
    } from 'pinia'
    import { useAlertStore } from '@/store'

    export default {
        computed: {
            ...mapState(useAlertStore, [
                'currentAlert'
            ]),

            title: function () {
                return this.currentAlert && this.currentAlert.title || 'Title';
            },

            message: function () {
                return this.currentAlert && this.currentAlert.message || 'Message';
            },

            image: function () {
                return this.currentAlert && this.currentAlert.image || null;
            },

            type: function () {
                return  this.currentAlert && 'alert-' + this.currentAlert.type || 'alert-info';
            }
        },
        methods: {
            ...mapActions(useAlertStore, [
                'clearAlert'
            ]),

            close: function () {
                this.clearAlert();
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
        border-radius: 1.2rem;
        border: none;
    }

    .alert-image {
        width: 40px;
        height: 40px;
        margin-right: 10px;
        background-color: white;
        border-radius: var(--btn-border-radius);
    }

    .alert-dismissible,
    .alert-dismissible .btn-close {
        color: #fefefe;
    }

    .alert-success {
        background-color: #32c75a;
    }

    .alert-danger {
        background-color: #ff0000;
    }

    .alert-warning {
        background-color: #ff8001;
    }

    .alert-info {
        background-color: #262626;
    }
</style>
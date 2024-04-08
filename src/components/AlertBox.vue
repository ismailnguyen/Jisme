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
    import { useAlertStore } from '@/store'
    import { storeToRefs } from 'pinia'

    export default {
        setup() {
            const alertStore = useAlertStore()
            const { currentAlert } = storeToRefs(alertStore)
            const { clearAlert } = alertStore

            return {
                currentAlert,
                clearAlert
            }
        },
        methods: {
            close: function () {
                this.clearAlert();
            }
        },
        computed: {
            title: function () {
                return this.currentAlert.title;
            },

            message: function () {
                return this.currentAlert.message;
            },

            image: function () {
                return this.currentAlert.image;
            },

            type: function () {
                return  'alert-' + this.currentAlert.type;
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
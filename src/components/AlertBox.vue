<template>
    <div id="alert" class="alert alert-dismissible fade show" :class="type">
        
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
    import { getUser } from '../utils/auth'
    import UserService from '../services/UserService'
    import AccountsService from '../services/AccountsService'
    import { cleanUrl, randomPassword } from '../utils/textFormat'

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
</style>
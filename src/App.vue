<template>
    <div id="app">
        <router-view v-on:showAlert="onShowAlert" />
    </div> 
</template>

<script>
    export default {
        data () {
            return {
                alertDetails: {},
                showAlert: false
            }
        },
        methods: {
            onShowAlert: function (alertDetails)
            {
                this.alertDetails = alertDetails;

                if (!this.showAlert)
                {
                    this.onToggleAlert();

                    setTimeout(() => 
                    {
                        this.onToggleAlert();
                    }
                    , 5000);
                }
            },

            onToggleAlert: function () {
                this.showAlert = !this.showAlert;
            }
        }
    }
</script>

<template>
    <div id="app">
        <NavBar />

        <router-view v-on:showAlert="onShowAlert" />

        <AlertBox :alertDetails="alertDetails" v-if="showAlert" v-on:closeAlert="onToggleAlert()" />
    </div> 
</template>

<script>
    import NavBar from './components/NavBar.vue'
    import AlertBox from './components/AlertBox.vue'
    
    export default {
        data () {
            return {
                alertDetails: {},
                showAlert: false
            }
        },
        components: {
            NavBar,
            AlertBox
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

<style>
    * {
        margin: 0;
        position: relative;
    }

    body {
      color: black;
      background: #EFEEEE;
    }

    a {
      color: #99c9ff;
    }

    .main-container {
        padding-top: 100px;
    }
	  
    header {
        width: 100%;
        position: fixed;
        color: #007bff;
        padding: 20px;
        z-index: 999;
    }

    .form-control {
        color: #fff;
        border: none;
        border-radius: 0.75rem;
        background-color: #ced4da70;
    }

    .form-control::placeholder {
        color: #fff;
        opacity: 1;
    }

    .btn {
        border-radius: .75rem;
    }
</style>
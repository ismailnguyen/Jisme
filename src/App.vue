<template>
    <div id="app">
        <router-view v-on:showAlert="onShowAlert" />

        <NavBar />

        <AlertBox :alertDetails="alertDetails" :isVisible="showAlert" />

        <div class="overlay"></div>
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

                if (!$('#alert').hasClass('show'))
                {
                    this.showAlert = true;

                    setTimeout(() => $('#alert').toggleClass('show'), 1);

                    setTimeout(() => 
                    {
                        $('#alert').toggleClass('show');
                        this.showAlert = false;
                    }
                    , 5000);
                }
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

    .modal {
        backdrop-filter: blur(10px);
        transition: all 1s;
    }

    .modal {
        box-shadow: 0 0 1rem 0 rgba(0, 0, 0, .2);   
        border-radius: 5px;
        z-index: 1;
        background: inherit;
        overflow: hidden;
    }

    .modal:before {
        content: "";
        position: absolute;
        background: inherit;
        z-index: -1;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        box-shadow: inset 0 0 2000px rgba(255, 255, 255, .5);
        filter: blur(10px);
        margin: -20px;
    }
</style>
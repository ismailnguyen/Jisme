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
                    setTimeout(() => $('#alert').toggleClass('show'), 1);
                    setTimeout(() => $('#alert').toggleClass('show'), 5000);
                }
            }
        },
        computed: {
        },
    }
</script>

<style>
    * {
        margin: 0;
        position: relative;
    }

    body {
      color: black;
      background: #f5f5f5;
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

    .searchBar {
        border-radius: 2rem;
        color: #818182;
        background-color: #fff;
        line-height: 2.5;
        box-shadow: 0 0 2rem rgba(0, 0, 255, .1);
    }

    .searchBar::placeholder {
        color: #818182;
    }
</style>
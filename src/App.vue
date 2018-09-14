<template>
<div>
    <router-view></router-view>

    <nav class="navbar navbar-light bg-light navbar-expand-lg fixed-bottom" v-if="isLoggedIn">
        <a class="navbar-brand btn btn-outline-primary" href="/Tags">{{ currentTag }}</a>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav mr-auto">
            <li class="nav-item ">
                <a class="nav-link" href="#" @click="signOut()">Sign out</a>
            </li>
            </ul>
        </div>
    </nav>

    <div id="alert" class="alert alert-success alert-dismissible fade" role="alert">
        <p id="alert-content"></p>
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    </div>

    <div class="overlay"></div>
</div> 
     
</template>

<script>
    import { isLoggedIn } from './utils/auth'
    import UserService from './services/UserService'
    
    export default {
        data () {
            return {
                isLoggedIn: isLoggedIn()
            }
        },
        methods: {
            signOut: function () {
                let userService = new UserService();

                userService.logout();
            }
        },
        computed: {
            currentTag: function ()
            {
                let tag = this.$route.params.tag;

                if (!tag) {
                    tag = 'All';
                }

                this.$store.state.currentTag = tag;

                return tag;
            },
        },
    }
</script>

<style>
    @import url("//cdnjs.cloudflare.com/ajax/libs/font-awesome/4.4.0/css/font-awesome.min.css");

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
    
    .alert {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
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
        background-color: #fff;
        line-height: 2.5;
        box-shadow: 0 0 2rem rgba(0, 0, 255, .1);
    }

    .searchBar::placeholder {
        color: #818182;
    }
</style>
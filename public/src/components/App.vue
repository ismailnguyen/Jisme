<template>
<div>
    <div class="modal fade" id="AddModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
      <div class="modal-dialog">
          <AddAccount :user="user" />
      </div>
    </div>

    <router-view></router-view>

    <nav class="navbar navbar-light bg-light navbar-expand-lg fixed-bottom">
        <a class="navbar-brand" href="/Tags">{{ currentTag }}</a>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav mr-auto">
            <!-- <li class="nav-item">
                <a class="nav-link" href="#">Sort by date <input type="date" max="3000-12-31" :value="formattedDate" :min="formattedDate" class="form-control datepicker"></a>
            </li> -->
            <li class="nav-item ">
                <a class="nav-link btn btn-outline-danger" href="#" @click="signOut()">Sign out</a>
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
    import { getUser } from '../utils/auth'
    import { sortByName } from '../utils/sort'
    import UserService from '../services/UserService'
    import AccountsService from '../services/AccountsService'
    import AddAccount from './AddAccount.vue'
    import Datepicker from 'vuejs-datepicker'
    
    export default {
        components: {
            AddAccount
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
    }

    body.modal-open .main-container {
      -webkit-filter: blur(2.5px);
      -moz-filter: blur(2.5px);
      -o-filter: blur(2.5px);
      -ms-filter: blur(2.5px);
      filter: blur(2.5px);
    }

    .modal {
        z-index: 10500;
    }

    .modal-dialog {
        width: 100%;
        height: 100%;
        padding: 0;
    }

    @media(min-width:768px) {
        .modal-content {
            border-radius: 1.55rem;
        }
    }
 
    @media (max-width: 767.98px) { 
      .modal-dialog {
        margin: 0;
      }
    }

    .modal-content {
        border-radius: 0;
    }

    .modal-content {
        color: #007bff;
        background: #fff;
        height: auto;
        min-height: 100%;
        box-shadow: 0 0 2rem rgba(0,0,255,.1);
    }

    .modal-content, .modal-footer {
      border: none;
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

    .datepicker {
        background: none;
        color: #6c757d;
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

    .btn {
        border-radius: .75rem;
    }
</style>
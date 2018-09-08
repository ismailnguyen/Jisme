<template>
    <div class="col-sm-12 col-md-6 col-lg-4">
        <div class="card">
            <div class="card-header">
                <div class="badge badge-pill badge-primary" v-for="(tag, index) in account.tags.split(',')" v-bind:key="index">
                    {{tag}}
                </div>
            </div>

            <div class="card-body">
                <h2 class="card-title">{{ account.displayPlatform }}</h2>

                <div class="row">
                    <div class="col-sm-12">
                        <a href="#" @click.prevent="edit(account)" class="card-link">See more</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import UserService from '../services/UserService'
    import AccountsService from '../services/AccountsService'

    export default {
        props: ['user', 'account'],
        data()
        {
            return {
                accountsService: new AccountsService(this.user, this.$store),
                userService: new UserService()
            }
        },
        methods:
        {
            edit(account) {
                this.$emit('toggleEditAccountModal', account);
            },

            showAlert: function (title, message)
            {
                $('#alert-content').html('<strong>' + title + '</strong> ' + message);
                
                if (!$('#alert').hasClass('show'))
                {
                    $('#alert').toggleClass('show');

                    setTimeout(function () { $('#alert').toggleClass('show') }, 5000);
                }
            }
        }
    }
</script>

<style scoped>
    .card {
      color: black;
      background: #ffffff6b;
      border: none;
      border-radius: 1.55rem;
      margin: 10px;
      box-shadow: 0 0 2rem rgba(0,0,255,.1);
    }

    .card-header {
        background: none;
        border: none;
    }

    .card a {
      text-decoration: none;
    }

    .badge-pill {
        margin-right: 5px;
    }
</style>
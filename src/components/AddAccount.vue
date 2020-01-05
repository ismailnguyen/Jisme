<template>
    <div class="modal" id="addAccountModal" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">Add</h2>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close" @click="cleanForm()">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <h4>{{ account.displayPlatform }}</h4>

                    <form class="card-text lead">
                        <div class="row">
                            <div class="form-group col-xs-12 col-md-6">
                                <label for="platform_input">Platform</label>
                                <input id="platform_input" class="form-control" placeholder="Platform" type="text" v-model="account.platform" @keyup.enter="add()" required />
                            </div>
                            <div class="form-group col-xs-12 col-md-6">
                                <label for="tags_input">Tags</label>
                                <input id="tags_input" class="form-control" placeholder="Tags" type="text" aria-describedby="tagsHelp" v-model="account.tags" @keyup.enter="add()" required />
                                <small id="tagsHelp" class="form-text text-muted">Separated with comma.</small>
                            </div>
                            <div class="form-group col-xs-12 col-md-6">
                                <label for="login_input">Login</label>
                                <input id="login_input" class="form-control" placeholder="Login" type="text" v-model="account.login" @keyup.enter="add()" required />
                            </div>
                            <div class="form-group col-xs-12 col-md-6">
                                <label for="password_input">Password</label>
                                <div class="input-group">
                                    <input id="password_input" class="form-control" type="text" aria-describedby="passwordHelp" v-model="account.password" placeholder="Password" @keyup.enter="add()" required />
                                    <div class="input-group-append">
                                        <button class="btn btn-outline-secondary" type="button" @click="account.generatePassword()">Generate</button>
                                    </div>
                                </div>
                                <small id="passwordHelp" class="form-text text-muted">Click button to generate password.</small>
                            </div>
                        </div>
                    </form>
                </div>
                
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" @click="add()">Add</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import Account from '../models/Account'
    import UserService from '../services/UserService'
    import AccountsService from '../services/AccountsService'
    import Alert from '../models/Alert'

    export default {
        props: {
            user: Object,
        },
        data()
        {
            return {
                account: new Account()
            }
        },
        methods: {
            add: function ()
            {
                if (!this.account.isValid()) {
                    this.showAlert('Error', 'Please fill all fields !', 'danger');
                    return;
                }

                let accountsService = new AccountsService(this.user, this.$store);

                accountsService
                .add(this.account)
                .then(response => this.closeModal())
                .catch(error =>
                {
                    this.showAlert('Error', error.toString(), 'danger');
                });
            },
            
            cleanForm: function ()
            {
                this.account = new Account();
            },

            showAlert: function (title, message, type)
            {
                this.$emit('showAlert', new Alert(title, message, type));
            },

            closeModal: function ()
            {
                let userService = new UserService();
                userService.update(this.user);

                $('#addAccountModal').modal('toggle');

                this.showAlert(this.account.displayPlatform, 'created !', 'success');
                
                this.cleanForm();
            }
        }
    } 
</script>

<style scoped>
    .modal-header {
        padding-bottom: 0;
        border: none;
    }
    
    .modal-header .close {
        font-size: 2.5rem;
    }

    .modal-content {
      border: none;
      background: #f5f5f5;
    }

    @media only screen and (min-width: 500px) {
        .modal-content {
            border-radius: 1.55rem;
            margin: 10px;
            box-shadow: 0 0 2rem rgba(0,0,255,.1);
        }
    }

    .text-muted, a {
      color: #99c9ff !important;
    }

    .modal-footer .btn {
        width:100%;
    }
</style>
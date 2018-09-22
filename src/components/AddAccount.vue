<template>
    <div class="modal fade" id="addAccountModal" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-body">
                    <h2 class="card-title">Add</h2>
                    <h4>{{ account.displayPlatform }}</h4>

                    <form class="card-text lead">
                        <div class="form-group">
                            <label for="platform_input">Platform</label>
                            <input id="platform_input" class="form-control" placeholder="Platform" type="text" v-model="account.platform" @keyup.enter="add()" required autofocus />
                        </div>
                        <div class="form-group">
                            <label for="login_input">Login</label>
                            <input id="login_input" class="form-control" placeholder="Login" type="text" v-model="account.login" @keyup.enter="add()" required />
                        </div>
                        <div class="form-group">
                            <label for="password_input">Password</label>
                            <div class="input-group">
                                <input id="password_input" class="form-control" type="text" aria-describedby="passwordHelp" v-model="account.password" placeholder="Password" @keyup.enter="add()" required />
                                <div class="input-group-append">
                                    <button class="btn btn-outline-secondary" type="button" @click="account.generatePassword()">Generate</button>
                                </div>
                            </div>
                            <small id="passwordHelp" class="form-text text-muted">Click button to generate password.</small>
                        </div>
                        <div class="form-group">
                            <label for="tags_input">Tags</label>
                            <input id="tags_input" class="form-control" placeholder="Tags" type="text" aria-describedby="tagsHelp" v-model="account.tags" @keyup.enter="add()" required />
                            <small id="tagsHelp" class="form-text text-muted">Separated with comma.</small>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <div class="row">
                        <div class="col-xs-6 action-button">
                            <button type="button" class="btn btn-link modal-close" data-dismiss="modal" @click="cleanForm()">Close</button>
                        </div>
                        <div class="col-xs-6 action-button" >
                            <button type="button" class="btn btn-primary" @click="add()">Add</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { getUser } from '../utils/auth'
    import Account from '../models/Account'
    import UserService from '../services/UserService'
    import AccountsService from '../services/AccountsService'
    import Alert from '../models/Alert'

    export default {
        data()
        {
            return {
                user: getUser(),
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
                accountsService.add(this.account);

                let userService = new UserService();
                userService.update(this.user);

                $('#addAccountModal').modal('toggle');
                
                this.showAlert('this.account.displayPlatform', 'created !', 'success');

                this.cleanForm();
            },
            
            cleanForm: function ()
            {
                this.account = new Account();
            },

            showAlert: function (title, message, type)
            {
                this.$emit('showAlert', new Alert(title, message, type));
            }
        }
    } 
</script>

<style scoped>
    .modal-content {
      border: none;
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

    .action-button {
        margin: 0 1em 0 1em;
    }
</style>
<template>
    <div class="modal fade" id="editAccountModal" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-body">
                    <h2 class="card-title">{{ account.displayPlatform }}</h2>

                    <form class="card-text lead">
                        <div class="form-group">
                            <label for="platform_input">Platform</label>
                            <input id="platform_input" class="form-control" placeholder="Platform" type="text" v-model="account.platform" v-on:dblclick="copyToClipboard('platform_input_hidden')" autofocus />
                            <input id="platform_input_hidden" type="hidden" :value="account.platform" />
                        </div>
                        <div class="form-group">
                            <label for="login_input">Login</label>
                            <input id="login_input" class="form-control" placeholder="Login" type="text" v-model="account.login" v-on:dblclick="copyToClipboard('login_input_hidden')" />
                            <input id="login_input_hidden" type="hidden" :value="account.login" />
                        </div>
                        <div class="form-group">
                            <label for="password_input">Password</label>
                            <div class="input-group">
                                <input id="password_input" class="form-control" type="text" aria-describedby="passwordHelp" v-model="account.password" placeholder="Password" />
                                <div class="input-group-append">
                                    <button class="btn btn-outline-light" type="button" @click="account.generatePassword()">Generate</button>
                                </div>
                            </div>
                            <small id="passwordHelp" class="form-text text-muted">Click button to generate password.</small>
                        </div>
                        <div class="form-group">
                            <label for="tags_input">Tags</label>
                            <input id="tags_input" class="form-control" placeholder="Tags" type="text" aria-describedby="tagsHelp" v-model="account.tags" />
                            <small id="tagsHelp" class="form-text text-muted">Separated with comma.</small>
                        </div>
                        <div class="form-group">
                            <label for="tags_input">Created date</label>
                            <input class="form-control" v-model="account.created_date" disabled />
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <div class="row">
                        <div class="col-xs-4 action-button">
                            <button type="button" class="btn btn-primary" @click="remove()">Delete</button>
                        </div>
                        <div class="col-xs-4 action-button">
                            <button type="button" class="btn btn-outline-light" @click="save()">Save</button>
                        </div>
                        <div class="col-xs-4 action-button">
                            <button type="button" class="btn btn-light modal-close" data-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <button class="modal-close is-large" aria-label="close"></button>
    </div>
</template>

<script>
    import Account from '../models/Account'
    import Alert from '../models/Alert'
    import UserService from '../services/UserService'
    import AccountsService from '../services/AccountsService'

    export default {
        props: {
            user: Object,
            account: Account
        },
        data()
        {
            return {
                accountsService: new AccountsService(this.user, this.$store),
                userService: new UserService()
            }
        },
        methods: {
            save: function()
            {
                if (!this.account.isValid()) {
                    this.showAlert('Error', 'Please fill all fields !', 'danger');
                    return;
                }

                this.accountsService.save(this.account);
                this.userService.update(this.user);

                $('#editAccountModal').modal('toggle');

                this.$emit('showAlert', new Alert(this.account.displayPlatform, 'updated !', 'success'));
            },

            remove: function ()
            {
                if (confirm('Are you sure to delete : ', this.account.displayPlatform, ' ?') === true)
                {
                    this.accountsService.remove(this.account);
                    this.userService.update(this.user);

                    $('#editAccountModal').modal('toggle');

                    this.showAlert(this.account.displayPlatform, 'removed !', 'success');
                }
            },

            showAlert: function (title, message, type)
            {
                this.$emit('showAlert', new Alert(title, message, type));
            },

            copyToClipboard: function (input)
            {
                let inputToCopy = document.querySelector('#' + input);
                inputToCopy.setAttribute('type', 'text');
                inputToCopy.select();

                document.execCommand('copy');

                /* unselect the range */
                inputToCopy.setAttribute('type', 'hidden');
                window.getSelection().removeAllRanges();

                this.showAlert(inputToCopy.value, 'Copied to clipboard !', 'info');
            }
        }
    } 
</script>

<style scoped>
    .modal-content {
      color: white;
      background: #007aff;
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

    .form-control:disabled {
        background: none;
    }

    .action-button {
        margin: 0 1em 0 1em;
    }
</style>
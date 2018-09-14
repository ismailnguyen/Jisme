<template>
    <div class="modal fade" id="editAccountModal" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-body">
                    <h2 class="card-title">{{ account.platform | formatPlatform }}</h2>

                    <form class="card-text lead">
                        <div class="form-group">
                            <label for="platform_input">Platform</label>
                            <input id="platform_input" class="form-control" placeholder="Platform" type="text" v-model="account.platform" autofocus />
                        </div>
                        <div class="form-group">
                            <label for="login_input">Login</label>
                            <input id="login_input" class="form-control" placeholder="Login" type="text" v-model="account.login" />
                        </div>
                        <div class="form-group">
                            <label for="password_input">Password</label>
                            <div class="input-group">
                                <input id="password_input" class="form-control" type="text" aria-describedby="passwordHelp" v-model="account.password" placeholder="Password" v-on:dblclick="generatePassword()" />
                                <div class="input-group-append">
                                    <button class="btn btn-outline-light" type="button" @click="generatePassword()">Generate</button>
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
                            <button type="button" class="btn btn-primary modal-close" data-dismiss="modal" @click="remove()">Delete</button>
                        </div>
                        <div class="col-xs-4 action-button">
                            <button type="button" class="btn btn-outline-light modal-close" data-dismiss="modal" @click="save()">Save</button>
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
    import { getUser } from '../utils/auth'
    import UserService from '../services/UserService'
    import AccountsService from '../services/AccountsService'
    import { cleanUrl, randomPassword } from '../utils/textFormat'

    export default {
        props: {
            account: Object   
        },
        data()
        {
            return {
                user: getUser()
            }
        },
        filters:
        {
            formatPlatform: function (platform)
            {
                return cleanUrl(platform);
            }
        },
        methods: {
            save: function()
            {
                this.accountsService.save(this.account);
                this.userService.update(this.user);

                this.showAlert(this.account.displayPlatform, 'updated.');
            },

            remove: function ()
            {
                if (confirm('Are you sure to delete : ', this.account.platform, ' ?') == true)
                {
                    this.accountsService.remove(this.account);

                    this.userService.update(this.user);

                    this.showAlert(this.account.displayPlatform, 'removed.');
                }

                console.log('pressed cancel !')
            },

            generatePassword: function ()
            {
                this.account.password = randomPassword(8);
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
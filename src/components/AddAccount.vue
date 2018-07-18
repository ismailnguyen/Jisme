<template>
    <div class="modal-content">
        <div class="modal-body">
            <h2 class="card-title">Add</h2>
            <h4>{{ account.platform | formatPlatform }}</h4>

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
                            <button class="btn btn-outline-secondary" type="button" @click="generatePassword()">Generate</button>
                        </div>
                    </div>
                    <small id="passwordHelp" class="form-text text-muted">Click button to generate password.</small>
                </div>
                <div class="form-group">
                    <label for="tags_input">Tags</label>
                    <input id="tags_input" class="form-control" placeholder="Tags" type="text" aria-describedby="tagsHelp" v-model="account.tags" />
                    <small id="tagsHelp" class="form-text text-muted">Separated with comma.</small>
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-link modal-close" data-dismiss="modal" @click="cleanForm()">Close</button>
            <button type="button" class="btn btn-primary modal-close" data-dismiss="modal" @click="add()">Add</button>
        </div>
    </div>
</template>

<script>
    import { getUser } from '../utils/auth'
    import UserService from '../services/UserService'
    import AccountsService from '../services/AccountsService'
    import { cleanUrl, randomPassword } from '../utils/textFormat'

    export default {
        data()
        {
            return {
                user: getUser(),
                account: {
                    platform: '',
                    login: '',
                    password: '',
                    tags: ''
                }
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
            add: function ()
            {
                let accountsService = new AccountsService(this.user, this.$store);
                accountsService.add(this.account);

                let userService = new UserService();
                userService.update(this.user);

                this.showAlert(cleanUrl(this.account.platform), 'created.');

                this.cleanForm();
            },
            
            generatePassword: function ()
            {
                this.account.password = randomPassword(8);
            },

            cleanForm: function ()
            {
                this.account = {
                    platform: '',
                    login: '',
                    password: '',
                    tags: ''
                };
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
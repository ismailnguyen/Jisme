<template>
    <div class="col-sm-12 col-md-6 col-lg-4" :id="account._id">
        <div class="card" v-bind:class="{ cardFocus : showDetails }">
            <div class="card-header" v-if="!editMode">
                <div class="badge badge-pill" v-bind:class="{ 'badge-primary' : !showDetails, 'badge-light' : showDetails }" v-for="(tag, index) in account.tags.split(',')" v-bind:key="index">
                    {{tag}}
                </div>
            </div>
            <div class="card-header" v-if="showDetails && editMode">
                <h6 class="card-title">
                    <div class="form-group">
                        <label for="tags_input">Tags</label>
                        <input id="tags_input" class="form-control" placeholder="Tags" type="text" aria-describedby="tagsHelp" v-model="account.tags" />
                        <small id="tagsHelp" class="form-text text-muted">Separated with comma.</small>
                    </div>
                </h6>
            </div>

            <div class="card-body">
                <h2 class="card-title" v-if="!showDetails">{{ account.displayPlatform }}</h2>
                <h2 class="card-title" v-if="showDetails && !editMode">{{ account.platform }}</h2>
                <h6 class="card-title" v-if="showDetails && editMode">
                    <div class="form-group">
                        <label for="platform_input">Platform</label>
                        <input id="platform_input" class="form-control" placeholder="Platform" type="text" v-model="account.platform" autofocus />
                    </div>
                </h6>
                
                <h6 class="card-subtitle mb-2 text-muted" v-if="showDetails && !editMode">{{account.login}}</h6>
                <h6 class="card-title" v-show="showDetails && editMode">
                    <div class="form-group">
                        <label for="login_input">Login</label>
                        <input id="login_input" class="form-control" placeholder="Login" type="text" v-model="account.login" />
                    </div>
                </h6>

                <div class="card-text" v-if="showDetails">
                    <p class="lead" v-if="!editMode">{{ account.password }}</p>
                    <h6 class="card-title" v-if="editMode">
                        <div class="form-group">
                            <label for="password_input">Password</label>
                            <input id="password_input" class="form-control" type="text" aria-describedby="passwordHelp" v-model="account.password" placeholder="Password" v-on:dblclick="generatePassword()" />
                            <small id="passwordHelp" class="form-text text-muted">Double-click to generate password.</small>
                        </div>
                    </h6>
                </div>
                <div class="row" v-if="!showDetails">
                    <div class="col-sm-12"><a @click="showDetails = true" :href="'#' + account._id" class="card-link">See more</a></div>
                </div>
                <div class="row" v-if="showDetails && !editMode">
                    <div class="col-xs-6 col-sm-6 col-md-2"><a @click="showDetails = false; editMode = false" :href="'#' + account._id" class="card-link">See less</a></div>
                    <div class="col-xs-6 col-sm-6 col-md-2"><a @click="editMode = true" :href="'#' + account._id" class="card-link">Edit</a></div>
                    <div class="col-sm-12 col-md-5 font-weight-light">{{ account.created_date }}</div>
                </div>
                <div class="row" v-if="showDetails && editMode">
                    <div class="col-sm-4 col-md-2"><a @click="save(); editMode = false" :href="'#' + account._id" class="card-link">Save</a></div>
                    <div class="col-sm-4 col-md-2"><a @click="editMode = false" :href="'#' + account._id" class="card-link">Cancel</a></div>
                    <div class="col-sm-4 col-md-2"><a @click="removeAccount()" :href="'#' + account._id" class="card-link">Delete</a></div>
                    <div class="col-sm-12 col-md-5 font-weight-light">{{ account.created_date }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import UserService from '../services/UserService'
    import AccountsService from '../services/AccountsService'
    import { cleanUrl, randomPassword } from '../utils/textFormat'

    export default {
        props: ['user', 'account'],
        data()
        {
            return {
                showDetails: false,
                editMode: false,
                accountsService: new AccountsService(this.user, this.$store),
                userService: new UserService()
            }
        },
        methods:
        {
            save: function()
            {
                this.accountsService.save(this.account);
                this.userService.update(this.user);

                this.showAlert(this.account.displayPlatform, 'updated.');
            },

            removeAccount: function ()
            {
                this.accountsService.remove(this.account);

                this.showDetails = false;

                this.userService.update(this.user);

                this.showAlert(this.account.displayPlatform, 'removed.');
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

<style>
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

    .cardFocus {
      color: white;
      background: #007aff;
    }
    
    .cardFocus .text-muted, a {
      color: #99c9ff !important;
    }
    
    .card a {
      text-decoration: none;
      color: #5a4296; 
    }

    .badge-pill {
        margin-right: 5px;
    }
</style>
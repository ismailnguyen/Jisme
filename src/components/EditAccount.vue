<template>
    <div class="modal" @keyup.esc="closeModal()" tabindex="0" @click.self="closeModal()">
        <transition name="pop" appear v-on:before-enter="toggleModalContent()">
            <div class="modal-dialog">
                <div class="modal-content" v-if="showModalContent">
                    <div class="modal-header">
                        <h2 class="modal-title">{{ account.displayPlatform }}</h2>
                        <button type="button" class="close" @click="closeModal()">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form class="card-text lead">
                            <div class="row">
                                <div class="form-group col-xs-12 col-md-6 col-lg-3">
                                    <label for="editAccount_platform_input">Platform</label>
                                    <input id="editAccount_platform_input" class="form-control" placeholder="Platform" type="text" v-model="account.platform" v-on:dblclick="copyToClipboard('editAccount_platform_input_hidden')" autofocus />
                                    <input id="editAccount_platform_input_hidden" type="hidden" :value="account.platform" />
                                </div>
                                <div class="form-group col-xs-12 col-md-6 col-lg-3">
                                    <label for="editAccount_icon_input">Icon</label>
                                    <input id="editAccount_icon_input" class="form-control" placeholder="Icon URL" type="text" v-model="account.icon" @keyup.enter="save()" />
                                </div>
                                <div class="form-group col-xs-12 col-md-6 col-lg-3">
                                    <label for="editAccount_tags_input">Tags</label>
                                    <input id="editAccount_tags_input" class="form-control" placeholder="Tags" type="text" aria-describedby="editAccount_tagsHelp" @keyup.enter="save()" v-model="account.tags" />
                                    <small id="editAccount_tagsHelp" class="form-text text-muted">Separated with comma.</small>
                                </div>
                                <div class="form-group col-xs-12 col-md-6 col-lg-3">
                                    <label for="editAccount_login_input">Login</label>
                                    <input id="editAccount_login_input" class="form-control" placeholder="Login" type="text" v-model="account.login" @keyup.enter="save()" v-on:dblclick="copyToClipboard('editAccount_login_input_hidden')" />
                                    <input id="editAccount_login_input_hidden" type="hidden" :value="account.login" />
                                </div>
                                <div class="form-group col-xs-12 col-md-6 col-lg-3">
                                    <label for="editAccount_password_input">Password</label>
                                    <div class="input-group">
                                        <input id="editAccount_password_input" class="form-control" type="text" aria-describedby="editAccount_passwordHelp" v-model="account.password" @keyup.enter="save()" />
                                        <input id="editAccount_password_input_hidden" type="hidden" :value="account.password" />
                                        <div class="input-group-append">
                                            <button class="btn btn-outline-light" type="button" @click="account.generatePassword()">Generate</button>
                                        </div>
                                    </div>
                                    <small id="editAccount_passwordHelp" class="form-text text-muted">Click button to generate password.</small>
                                </div>
								
								<div class="form-group col-xs-12 col-md-6 col-lg-3">
                                    <label for="editAccount_social_login_input">Social login</label>
                                    <input id="editAccount_social_login_input" class="form-control" type="text" v-model="account.social_login" @keyup.enter="save()" />
                                </div>
								
								<div class="form-group col-xs-12 col-md-6 col-lg-3">
                                    <label for="editAccount_password_clue_input">Password clue</label>
                                    <input id="editAccount_password_clue_input" class="form-control" type="text" v-model="account.password_clue" @keyup.enter="save()" />
                                </div>
								
								<div class="form-group col-md-12 col-lg-6">
                                    <label for="editAccount_notes_input">Notes</label>
                                    <textarea id="editAccount_notes_input" class="form-control" type="text" v-model="account.notes" rows="6"></textarea>
                                </div>
								
								 <div class="form-group col-md-4 small">
                                    <label>Created</label>
                                    <input class="form-control" v-model="createdDate" disabled />
                                </div>
                                <div class="form-group col-md-4 small">
                                    <label>Modified</label>
                                    <input class="form-control" v-model="lastModifiedDate" disabled />
                                </div>
                                <div class="form-group col-md-4 small">
                                    <label>Opened</label>
                                    <input class="form-control" v-model="lastOpenedDate" disabled />
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <div class="col-xs-12 col-md-6">
                            <button type="button" class="btn btn-outline-danger" @click="remove()">Delete</button>
                        </div>
                        <div class=" col-xs-12 col-md-6">
                            <button type="button" class="btn btn-light" @click="save()">Save</button>
                        </div>
                    </div>
                </div>
            </div>
    </transition>
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
        data() {
            return {
                accountsService: new AccountsService(this.user, this.$store),
                userService: new UserService(),
                showModalContent: false
            }
        },
        methods: {
            save: function() {
                if (!this.account.isValid()) {
                    this.showAlert('Error', 'Please fill all fields !', 'danger');
                    return;
                }

                this.account.last_modified_date = new Date();
                this.accountsService.save(this.account);
                this.userService.update(this.user);

                this.closeModal();

                this.$emit('showAlert', new Alert(this.account.displayPlatform, 'updated !', 'success'));
            },

            toggleModalContent: function() {
                this.showModalContent = !this.showModalContent;

                // Update the last opened date of this account each time the modal is opened
                if(this.showModalContent) {
                    // Leave this console log here for debugging purpose
                    console.log(this.account);

                    this.account.last_opened_date = new Date();
                    this.account.opened_count = this.account.opened_count ? this.account.opened_count + 1 : 1;
                    this.accountsService.save(this.account);
                }
            },

            remove: function () {
                if (confirm(`Are you sure to delete : ${this.account.displayPlatform } ?`) === true)
                {
                    this.accountsService.remove(this.account);
                    this.userService.update(this.user);

                    this.closeModal();

                    this.showAlert(this.account.displayPlatform, 'Removed !', 'success');
                }
            },

            showAlert: function (title, message, type) {
                this.$emit('showAlert', new Alert(title, message, type));
            },

            copyToClipboard: function (input) {
                let inputToCopy = document.querySelector('#' + input);
                inputToCopy.setAttribute('type', 'text');
                inputToCopy.select();

                document.execCommand('copy');

                /* unselect the range */
                inputToCopy.setAttribute('type', 'hidden');
                window.getSelection().removeAllRanges();

                this.showAlert(inputToCopy.value, 'Copied to clipboard !', 'info');
            },

            closeModal: function () {
                this.$emit('toggleEditAccountModal', new Account());
            },
            
            formatDate: function (date) {
                return date.getDate() + '/' + (date.getMonth()+1)  + '/' + date.getFullYear();
            }
        },
        computed: {
            createdDate: function () {
                return this.formatDate(new Date(this.account.created_date));
            },

            lastModifiedDate: function () {
                return this.formatDate(new Date(this.account.last_modified_date));
            },
            
            lastOpenedDate: function () {
                return this.formatDate(new Date(this.account.last_opened_date));
            }
        }
    } 
</script>

<style scoped>
    .modal-header .close {
        font-size: 2.5rem;
        color: #f8f9fa;
    }

    .modal-content {
        color: #f8f9fa;
        background: #162056;
        border: none;
    }

    @media only screen and (min-width: 500px) {
        .modal-content {
			background: #162056db;
            border-radius: 8px;
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

    .modal-footer .btn {
        width:100%;
    }
</style>
<template>
    <div class="modal" @keyup.esc="closeModal()" tabindex="0" @click.self="closeModal()">
        <transition name="pop" appear v-on:before-enter="toggleModalContent()">
            <div class="modal-dialog">
                <div class="modal-content" v-if="showModalContent">
                    <div class="modal-header">
                        <h2 class="modal-title">Add</h2>
                        <button type="button" class="close" @click="closeModal()">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <h4>{{ account.displayPlatform }}</h4>

                        <form class="card-text lead">
                            <div class="row">
                                <div class="form-group col-xs-12 col-md-6 col-lg-3">
                                    <label for="addAccount_platform_input">Platform</label>
                                    <input id="addAccount_platform_input" class="form-control" placeholder="Platform" type="text" ref="platform" v-model="account.platform" @keyup.enter="add()" required />
                                </div>
                                <div class="form-group col-xs-12 col-md-6 col-lg-3">
                                    <label for="addAccount_platform_input">Icon</label>
                                    <input id="addAccount_platform_input" class="form-control" placeholder="Icon URL" type="text" v-model="account.icon" @keyup.enter="add()" />
                                </div>
                                <div class="form-group col-xs-12 col-md-6 col-lg-3">
                                    <label for="addAccount_tags_input">Tags</label>
                                    <input id="addAccount_tags_input" class="form-control" placeholder="Tags" type="text" aria-describedby="addAccount_tagsHelp" v-model="account.tags" @keyup.enter="add()" required />
                                    <small id="addAccount_tagsHelp" class="form-text text-muted">Separated with comma.</small>
                                </div>
                                <div class="form-group col-xs-12 col-md-6 col-lg-3">
                                    <label for="addAccount_login_input">Login</label>
                                    <input id="addAccount_login_input" class="form-control" placeholder="Login" type="text" v-model="account.login" @keyup.enter="add()" required />
                                </div>
                                <div class="form-group col-xs-12 col-md-6 col-lg-3">
                                    <label for="addAccount_password_input">Password</label>
                                    <div class="input-group">
                                        <input id="addAccount_password_input" class="form-control" type="text" aria-describedby="addAccount_passwordHelp" v-model="account.password" placeholder="Password" @keyup.enter="add()" />
                                        <div class="input-group-append">
                                            <button class="btn btn-outline-secondary" type="button" @click="account.generatePassword()">Generate</button>
                                        </div>
                                    </div>
                                    <small id="addAccount_passwordHelp" class="form-text text-muted">Click button to generate password.</small>
                                </div>
								
								<div class="form-group col-xs-12 col-md-6 col-lg-3">
                                    <label for="addAccount_social_login_input">Social login</label>
                                    <input id="addAccount_social_login_input" class="form-control" placeholder="Google, Facebook, LinkedIn, ..." type="text" v-model="account.social_login" @keyup.enter="add()" />
                                </div>
								
								<div class="form-group col-xs-12 col-md-6 col-lg-3">
                                    <label for="addAccount_password_clue_input">Password clue</label>
                                    <input id="password_clue_input" class="form-control" placeholder="" type="text" v-model="account.password_clue" @keyup.enter="add()" />
                                </div>
								
								<div class="form-group col-md-12 col-lg-6">
                                    <label for="addAccount_notes_input">Notes</label>
                                    <textarea id="addAccount_notes_input" class="form-control" type="text" v-model="account.notes" rows="6"></textarea>
                                </div>
                            </div>
                        </form>
                    </div>
                    
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" @click="add()">Add</button>
                    </div>
                </div>
            </div>
        </transition>
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
                account: new Account(),
                showModalContent: false
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
                .then(response => this.updateUI())
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

            updateUI: function ()
            {
                let userService = new UserService();
                userService.update(this.user);

                this.closeModal();

                this.showAlert(this.account.displayPlatform, 'Created !', 'success');
                
                this.cleanForm();
            },
            
            toggleModalContent: function() 
            {
                this.showModalContent = !this.showModalContent;
                this.$nextTick(() => this.$refs.platform.focus())
            },

            closeModal: function ()
            {
                this.$emit('toggleAddAccountModal');
            }
        }
    } 
</script>

<style scoped>
    .modal-header .close {
        font-size: 2.5rem;
    }
	
	@media (prefers-color-scheme: dark) {
		.modal-header .close {
			color: #e4e6eb;
		}
	}

    .modal-content {
      border: none;
      background: #ffffff;
    }
	
	@media (prefers-color-scheme: dark) {
		.modal-content {
			color: #e4e6eb;
			background: #242526;
		}
	}
	
	@media only screen and (min-width: 500px) {
        .modal-content {
			background: #ffffffdb;
            border-radius: 8px;
            margin: 10px;
            box-shadow: 0 0 2rem rgba(0,0,255,.1);
        }
		
		@media (prefers-color-scheme: dark) {
			.modal-content {
				background: #242526db;
			}
		}
    }

    .form-control {
        color: #343a40;
    }

    .form-control::placeholder {
        color: #343a40;
        opacity: 1;
    }

    .text-muted, a {
      color: #99c9ff !important;
    }

    .modal-footer .btn {
        width:100%;
    }

    .modal-footer .btn-primary {
        color: #f8f9fa;
        background-color: #162056;
        border-color: #162056;
    }
	
	@media (prefers-color-scheme: dark) {
		.modal-footer .btn-primary {
			color: #fff;
			background-color: #007bff;
		}
	}
</style>
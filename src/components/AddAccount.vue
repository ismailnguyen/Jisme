<template>
    <div class="modal" @keyup.esc="closeModal()" tabindex="0" :class="account.icon ? 'hasIcon' : ''">
        <transition name="modal-animation" appear v-on:before-enter="toggleModalContent()">
            <div class="modal-dialog">
                <div class="modal-content" v-if="showModalContent">
                   <div class="modal-header">
                        <div class="modal-image-wrapper" v-if="account.icon">
                            <img
                                :src="account.icon"
                                loading="lazy"
                                :alt="account.displayPlatform"
                                :title="account.displayPlatform"
                                class="modal-icon" />
                        </div>
                        <h2 class="modal-title">{{ account.displayPlatform || 'Add' }}</h2>
                        <button type="button" class="close" @click="closeModal()">
                            <span class="close-svg-container">
                                <svg width="21" height="21" class="as-svgicon as-svgicon-close as-svgicon-tiny as-svgicon-closetiny" role="img" aria-hidden="true"><path fill="none" d="M0 0h21v21H0z"></path><path d="M12.12 10l4.07-4.06a1.5 1.5 0 10-2.11-2.12L10 7.88 5.94 3.81a1.5 1.5 0 10-2.12 2.12L7.88 10l-4.07 4.06a1.5 1.5 0 000 2.12 1.51 1.51 0 002.13 0L10 12.12l4.06 4.07a1.45 1.45 0 001.06.44 1.5 1.5 0 001.06-2.56z"></path></svg>
                            </span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form class="card-text lead">
                            <div class="row">
                                <div class="form-group col-xs-12 col-md-12 col-lg-12">
                                    <div class="btn-group" role="group" aria-label="Account type">
                                        <label class="btn btn-outline-primary" for="addAccount_radiobutton_accounttype_account" :class="account.type == 'account' ? 'active' : ''">Account</label>
                                        <input type="radio" class="btn-check" id="addAccount_radiobutton_accounttype_account" value="account" v-model="account.type">

                                        <label class="btn btn-outline-primary" for="addAccount_radiobutton_accounttype_card" :class="account.type == 'card' ? 'active' : ''">Card</label>
                                        <input type="radio" class="btn-check" id="addAccount_radiobutton_accounttype_card" value="card" v-model="account.type">

                                        <label class="btn btn-outline-primary" for="addAccount_radiobutton_accounttype_2fa" :class="account.type == '2fa' ? 'active' : ''">2FA</label>
                                        <input type="radio" class="btn-check" id="addAccount_radiobutton_accounttype_2fa" value="2fa" v-model="account.type">
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="form-group col-xs-12 col-md-6 col-lg-3">
                                    <label for="addAccount_platform_input">Platform</label>
                                    <input id="addAccount_platform_input" class="form-control" placeholder="Platform" type="text" ref="platform" v-model="account.platform" @keyup.enter="add()" required />
                                </div>
                                <div class="form-group col-xs-12 col-md-6 col-lg-6">
                                    <label for="addAccount_tags_input">Tags</label>
                                    <input id="addAccount_tags_input" class="form-control" placeholder="Tags" type="text" aria-describedby="addAccount_tagsHelp" v-model="account.tags" @keyup.enter="add()" required />
                                    <small id="addAccount_tagsHelp" class="form-text text-muted">Separated with comma.</small>
                                </div>
                                <div class="form-group col-xs-12 col-md-6 col-lg-3">
                                    <label for="addAccount_platform_input">Icon</label>
                                    <input id="addAccount_platform_input" class="form-control" placeholder="Icon URL" type="text" v-model="account.icon" @keyup.enter="add()" />
                                </div>

                                <!-- region_start -- Account type: card -->
                                <div class="form-group col-xs-12 col-md-6 col-lg-3" v-if="account.type == 'card'">
                                    <label for="addAccount_card_number_input">Number</label>
                                    <input id="addAccount_card_number_input" class="form-control" placeholder="Card number" type="text" v-model="account.card_number" @keyup.enter="add()" />
                                </div>
                                
                                <div class="form-group col-xs-12 col-md-3 col-lg-2" v-if="account.type == 'card'">
                                    <label for="addAccount_card_pin_input">PIN</label>
                                    <input id="addAccount_card_pin_input" class="form-control" placeholder="PIN" type="text" v-model="account.card_pin" @keyup.enter="add()" />
                                </div>

                                <div class="form-group col-xs-12 col-md-3 col-lg-2" v-if="account.type == 'card'">
                                    <label for="addAccount_card_expiracy_input">Expiracy</label>
                                    <input id="addAccount_card_expiracy_input" class="form-control" placeholder="Expiracy" type="text" v-model="account.card_expiracy" @keyup.enter="add()" />
                                </div>
                                
                                <div class="form-group col-xs-12 col-md-3 col-lg-2" v-if="account.type == 'card'">
                                    <label for="addAccount_card_cryptogram_input">Cryptogram</label>
                                    <input id="addAccount_card_cryptogram_input" class="form-control" placeholder="CVC/CVV" type="text" v-model="account.card_cryptogram" @keyup.enter="add()" />
                                </div>

                                <div class="form-group col-xs-12 col-md-6 col-lg-3" v-if="account.type == 'card'">
                                    <label for="addAccount_card_name_input">Name</label>
                                    <input id="addAccount_card_name_input" class="form-control" placeholder="Name on card" type="text" v-model="account.card_name" @keyup.enter="add()" />
                                </div>
                                <!-- region_end -- Account type: card -->
                                
                                <div class="form-group col-xs-12 col-md-6" v-if="account.type == 'account' || account.type == '2fa'" :class="account.type == 'account' ? 'col-lg-3' : 'col-lg-6'">
                                    <label for="addAccount_login_input">Login</label>
                                    <input id="addAccount_login_input" class="form-control" placeholder="Login" type="text" v-model="account.login" @keyup.enter="add()" />
                                </div>

                                <div class="form-group col-xs-12 col-md-6 col-lg-6" v-if="account.type == '2fa'">
                                    <label for="addAccount_totp_secret_input">TOTP Secret</label>
                                    <input id="addAccount_totp_secret_input" class="form-control" placeholder="TOTP Secret" type="text" v-model="account.totp_secret" @keyup.enter="add()" />
                                </div>

                                <div class="form-group col-xs-12 col-md-6 col-lg-3" v-if="account.type == 'account'">
                                    <label for="addAccount_password_input">Password</label>
                                    <div class="input-group">
                                        <input id="addAccount_password_input" class="form-control" type="text" aria-describedby="addAccount_passwordHelp" v-model="account.password" placeholder="Password" @keyup.enter="add()" />
                                        <div class="input-group-append">
                                            <button class="btn btn-outline-secondary" type="button" @click="account.generatePassword()">Generate</button>
                                        </div>
                                    </div>
                                    <small id="addAccount_passwordHelp" class="form-text text-muted">Click button to generate password.</small>
                                </div>
								
                                <div class="form-group col-xs-12 col-md-6 col-lg-3" v-if="account.type == 'account'">
                                    <label for="addAccount_password_clue_input">Password clue</label>
                                    <input id="password_clue_input" class="form-control" placeholder="" type="text" v-model="account.password_clue" @keyup.enter="add()" />
                                </div>

								<div class="form-group col-xs-12 col-md-6 col-lg-3" v-if="account.type == 'account'">
                                    <label for="addAccount_social_login_input">Social login</label>
                                    <input id="addAccount_social_login_input" class="form-control" placeholder="Google, Facebook, LinkedIn, ..." type="text" v-model="account.social_login" @keyup.enter="add()" />
                                </div>
								
								<div class="form-group col-xs-12 col-md-12 col-lg-12">
                                    <label for="addAccount_notes_input">Notes</label>
                                    <textarea id="addAccount_notes_input" class="form-control" type="text" v-model="account.notes" rows="6"></textarea>
                                </div>
                            </div>
                        </form>
                    </div>
                    
                    <div class="modal-footer">
                        <button type="button" class="btn" :class="isCreating ? 'btn-dark': 'btn-primary'" @click="add()">{{ isCreating ? 'Creating ...' : 'Create' }}</button>
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
                showModalContent: false,
                isCreating: false
            }
        },
        methods: {
            add: function ()
            {
                if (!this.account.isValid()) {
                    this.showAlert('Error', 'Please fill all fields !', 'danger');
                    return;
                }

                this.isCreating = true;

                let accountsService = new AccountsService(this.user, this.$store);

                accountsService
                .add(this.account)
                .then(() => this.updateUI())
                .catch(error =>
                {
                    this.showAlert('Error', error.toString(), 'danger');
                    this.isCreating = false;
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

                this.isCreating = false;

                this.closeModal();

                this.showAlert(this.account.displayPlatform, 'Created !', 'success', this.account.icon);
                
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
    .close-svg-container {
        background: #e8e8ed;
        border-radius: 15px;
        color: #6e6e73;
        display: flex;
        align-items: center;
        height: 36px;
        width: 36px;
        outline: none;
        position: relative;
    }

    .close-svg-container svg {
        fill: currentColor;
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        height: 20px;
        width: 20px;
    }
	
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
			background: #fff;
            border-radius: 15px;
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
        color: #ced4da70;
    }

    .text-muted, a {
      color: #99c9ff !important;
    }

    .modal-footer .btn {
        width:100%;
    }

    .modal-footer .btn-primary {
        color: #f8f9fa;
        border-color: #162056;
        background: linear-gradient(81.62deg,#2870ea 8.72%,#1b4aef 85.01%);
    }
	
    .btn-group .btn-check {
        display: none;
    }

    .btn-group label.btn:first-of-type{
        border-top-left-radius: 15px;
        border-bottom-left-radius: 15px;
    }

    .btn-group label.btn:last-of-type{
        border-top-right-radius: 15px;
        border-bottom-right-radius: 15px;
    }

    .btn-group label.btn {
        background: none;
        color: #2870ea;
        border-color: #2870ea;
    }

    .btn-group label.btn.active {
        background: linear-gradient(81.62deg,#2870ea 8.72%,#1b4aef 85.01%);
        color: #fff;
    }

    @media (prefers-color-scheme: dark) {
		.btn-group label.btn {
            color: #fff;
        }

        .btn-group label.btn.active {
            color: #fff;
        }
	}

    .modal.hasIcon .modal-title {
        margin-left: 2rem;
        transition: all .5s;
    }

    .modal-image-wrapper {
        position: absolute;
        top: -14px;
        left: -14px;
        border-radius: 15px;
        background: #f9f9f9;
        padding: 2px;
    }

    .modal-icon {
        border-radius: 15px;
        height: 48px;
        width: 48px;
    }
</style>
<template>
    <div id="account-sidebar-wrapper">
        <div class="right-sidebar">
            <div class="sidebar-header">
                <div class="row">
                    <div class="form-group col-xs-3 col-md-3 col-lg-3" v-show="account.icon">
                        <img
                            :src="account.icon"
                            loading="lazy"
                            :alt="account.displayPlatform"
                            :title="account.displayPlatform"
                            class="sidebar-icon" />
                    </div>

                    <div class="form-group" :class="account.icon ? 'col-xs-6 col-md-6 col-lg-6' : 'col-xs-9 col-md-9 col-lg-9'">
                        <h2 class="sidebar-title">{{ account.displayPlatform || 'Add' }}</h2>
                    </div>

                    <div class="form-group col-xs-3 col-md-3 col-lg-3 justify-content-end">
                        <button type="button" class="button--close" @click="closeAccount()">
                            <i class="fa fa-solid fa-close"></i>
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="sidebar-body">
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
                        <div class="form-group col-xs-12 col-md-12 col-lg-12">
                            <label for="addAccount_platform_input">Platform</label>
                            <input id="addAccount_platform_input" class="form-control" placeholder="Platform" type="text" ref="platform" v-model="account.platform" @keyup.enter="add()" required />
                        </div>
                        <div class="form-group col-xs-12 col-md-12 col-lg-12">
                            <label for="addAccount_input_new_tag">Tags</label>
                            <div id="addAccount_input_tags" class="form-control tags">
                                <span
                                    class="badge badge-pill badge-primary"
                                    v-for="(tag, tagIndex) in account.tags.split(',')"
                                    v-bind:key="tagIndex"
                                    @click="removeTag(tag)">
                                    {{ tag }}
                                    <i class="fa fa-close" v-if="tag"></i>
                                </span>
                            </div>
                            <input id="addAccount_input_new_tag" class="form-control" placeholder="Tag" type="text" v-model="newTag" @keyup.enter="addTag()" required />
                        </div>
                        <div class="form-group col-xs-12 col-md-12 col-lg-12">
                            <label for="addAccount_platform_icon">Icon</label>
                            <input id="addAccount_platform_icon" class="form-control" placeholder="Icon URL" type="text" v-model="account.icon" @keyup.enter="add()" />
                        </div>

                        <!-- region_start -- Account type: card -->
                        <div class="form-group col-xs-12 col-md-12 col-lg-12" v-if="account.type == 'card'">
                            <label for="addAccount_card_number_input">Number</label>
                            <input id="addAccount_card_number_input" class="form-control" placeholder="Card number" type="text" v-model="account.card_number" @keyup.enter="add()" />
                        </div>
                        
                        <div class="form-group col-xs-12 col-md-12 col-lg-12" v-if="account.type == 'card'">
                            <label for="addAccount_card_pin_input">PIN</label>
                            <input id="addAccount_card_pin_input" class="form-control" placeholder="PIN" type="text" v-model="account.card_pin" @keyup.enter="add()" />
                        </div>

                        <div class="form-group col-xs-12 col-md-12 col-lg-12" v-if="account.type == 'card'">
                            <label for="addAccount_card_expiracy_input">Expiracy</label>
                            <input id="addAccount_card_expiracy_input" class="form-control" placeholder="Expiracy" type="text" v-model="account.card_expiracy" @keyup.enter="add()" />
                        </div>
                        
                        <div class="form-group col-xs-12 col-md-12 col-lg-12" v-if="account.type == 'card'">
                            <label for="addAccount_card_cryptogram_input">Cryptogram</label>
                            <input id="addAccount_card_cryptogram_input" class="form-control" placeholder="CVC/CVV" type="text" v-model="account.card_cryptogram" @keyup.enter="add()" />
                        </div>

                        <div class="form-group col-xs-12 col-md-12 col-lg-12" v-if="account.type == 'card'">
                            <label for="addAccount_card_name_input">Name</label>
                            <input id="addAccount_card_name_input" class="form-control" placeholder="Name on card" type="text" v-model="account.card_name" @keyup.enter="add()" />
                        </div>
                        <!-- region_end -- Account type: card -->
                        
                        <div class="form-group col-xs-12 col-md-12 col-lg-12" v-if="account.type == 'account' || account.type == '2fa'" :class="account.type == 'account' ? 'col-lg-3' : 'col-lg-6'">
                            <label for="addAccount_login_input">Login</label>
                            <input id="addAccount_login_input" class="form-control" placeholder="Login" type="text" v-model="account.login" @keyup.enter="add()" />
                        </div>

                        <div class="form-group col-xs-12 col-md-12 col-lg-12" v-if="account.type == '2fa'">
                            <label for="addAccount_totp_secret_input">TOTP Secret</label>
                            <input id="addAccount_totp_secret_input" class="form-control" placeholder="TOTP Secret" type="text" v-model="account.totp_secret" @keyup.enter="add()" />
                        </div>

                        <div class="form-group col-xs-12 col-md-12 col-lg-12" v-if="account.type == 'account'">
                            <label for="addAccount_password_input">Password</label>
                            <div class="input-group">
                                <input id="addAccount_password_input" class="form-control" type="text" aria-describedby="addAccount_passwordHelp" v-model="account.password" placeholder="Password" @keyup.enter="add()" />
                                <div class="input-group-append">
                                    <button class="btn btn-outline-secondary" type="button" @click="account.generatePassword()">Generate</button>
                                </div>
                            </div>
                            <small id="addAccount_passwordHelp" class="form-text text-muted">Click button to generate password.</small>
                        </div>
                        
                        <div class="form-group col-xs-12 col-md-12 col-lg-12" v-if="account.type == 'account'">
                            <label for="addAccount_password_clue_input">Password clue</label>
                            <input id="password_clue_input" class="form-control" placeholder="" type="text" v-model="account.password_clue" @keyup.enter="add()" />
                        </div>

                        <div class="form-group col-xs-12 col-md-12 col-lg-12" v-if="account.type == 'account'">
                            <label for="addAccount_social_login_input">Social login</label>
                            <input id="addAccount_social_login_input" class="form-control" placeholder="Google, Facebook, LinkedIn, ..." type="text" v-model="account.social_login" @keyup.enter="add()" />
                        </div>

                        <div class="form-group col-xs-12 col-md-12 col-lg-12">
                            <label for="addAccount_description_input">Description</label>
                            <textarea id="addAccount_description_input" class="form-control" type="text" v-model="account.description" rows="3"></textarea>
                        </div>
                        
                        <div class="form-group col-xs-12 col-md-12 col-lg-12">
                            <label for="addAccount_notes_input">Notes</label>
                            <textarea id="addAccount_notes_input" class="form-control" type="text" v-model="account.notes" rows="6"></textarea>
                        </div>
                    </div>
                </form>
            </div>

            <div class="row sidebar-footer">
                <button type="button" class="btn btn-primary" @click="add()" :disabled="isCreating">
                    <span v-if="isCreating" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span v-else>Add</span>
                </button>
            </div>
        </div>
    </div>
</template>

<script>
    import '../assets/right_sidebar.css'

    import {
        useUiStore,
        useAlertStore,
        useAccountsStore
    } from '@/store'
    import Alert from '../models/Alert'
    import Account from '../models/Account'

    export default {
        data()
        {
            return {
                account: new Account(),
                isCreating: false,
                newTag: ''
            }
        },
        setup() {
            const accountsStore = useAccountsStore()
            const { closeAddAccountModal } = useUiStore()

            const { openAlert } = useAlertStore()

            return {
                accountsStore,
                closeAddAccountModal,

                openAlert

            }
        },
        methods: {
            add: async function ()
            {
                if (!this.account.isValid()) {
                    this.showAlert('Error', 'Please fill all fields !', 'danger');
                    return;
                }

                this.isCreating = true;

                try {
                    await this.accountsStore.addAccount(this.account);
                    
                    this.updateUI();
                }
                catch (error) {
                    this.showAlert('Error', error.toString(), 'danger');
                    this.isCreating = false;
                }
            },

            addTag: function () {
                const tags = this.account.tags.split(',').map(t => t.trim());

                // add the tag only if it wasn't already existing
                if (tags.indexOf(this.newTag) == -1) {
                    this.account.tags += (this.account.tags ? ',' : '') + this.newTag;
                }

                this.newTag = '';
            },

            removeTag: function (tag) {
                let newTags = this.account.tags.split(',').map(t => t.trim());
                newTags.splice(newTags.indexOf(tag), 1);
                this.account.tags = newTags.join(',');
            },
            
            cleanForm: function ()
            {
                this.account = new Account();
            },

            showAlert: function (title, message, type)
            {
                this.openAlert(new Alert(title, message, type));
            },

            updateUI: function ()
            {
                this.isCreating = false;

                this.closeAccount();

                this.openAlert(new Alert(this.account.displayPlatform, 'Created !', 'success', this.account.icon));

                this.cleanForm();
            },
            
            closeAccount: function ()
            {
                this.closeAddAccountModal();
            }
        }
    } 
</script>

<style scoped>
    #account-sidebar-wrapper .account-sidebar {
      background: #ffffff;
    }
	
	@media (prefers-color-scheme: dark) {
		#account-sidebar-wrapper .account-sidebar {
			color: #e4e6eb;
			background: var(--color-background-soft);
		}
	}
	
	@media only screen and (min-width: 500px) {
        #account-sidebar-wrapper .account-sidebar {
			background: #fff;
            border-top-left-radius: 15px;
            border-top-right-radius: 0;
            border-bottom-left-radius: 15px;
            border-bottom-right-radius: 0;
            box-shadow: 0 0 2rem rgba(0,0,255,.1);
        }
		
		@media (prefers-color-scheme: dark) {
			#account-sidebar-wrapper .account-sidebar {
				background: var(--color-background-mute);
			}
		}
    }

    .form-control {
        color: #343a40;
    }

    .form-control#addAccount_input_tags {
        border-bottom-right-radius: 0;
        border-bottom-left-radius: 0;
    }

    .form-control#addAccount_input_new_tag {
        border-top-right-radius: 0;
        border-top-left-radius: 0;
    }

    .sidebar-footer .btn-primary {
        color: #f8f9fa;
        border-color: var(--color-text);
        background: linear-gradient(81.62deg,#2870ea 8.72%,#1b4aef 85.01%);
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
</style>
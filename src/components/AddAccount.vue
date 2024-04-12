<template>
    <div id="account-sidebar-wrapper">
        <div class="right-sidebar">
            <div class="sidebar-header">
                <div class="row">
                    <div class="mb-3 col-xs-3 col-md-3 col-lg-3" v-show="account.icon">
                        <img
                            :src="account.icon"
                            loading="lazy"
                            :alt="account.displayPlatform"
                            :title="account.displayPlatform"
                            class="sidebar-icon" />
                    </div>

                    <div class="mb-3" :class="account.icon ? 'col-xs-6 col-md-6 col-lg-6' : 'col-xs-9 col-md-9 col-lg-9'">
                        <h2 class="sidebar-title">{{ account.displayPlatform || 'Add' }}</h2>
                    </div>

                    <div class="mb-3 col-xs-3 col-md-3 col-lg-3 justify-content-end">
                        <button type="button" class="button--close" @click="closeAccount()">
                            <i class="fa fa-solid fa-close"></i>
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="sidebar-body">
                <form class="card-text lead">
                    <div class="row">
                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
                            <div class="btn-group" role="group" aria-label="Account type">
                                <input type="radio" class="btn-check" name="account-type" id="addAccount_radiobutton_accounttype_account" v-model="account.type" value="account">
                                <label class="btn" for="addAccount_radiobutton_accounttype_account" :class="account.type == 'account' ? 'active' : ''">Account</label>

                                <input type="radio" class="btn-check" name="account-type" id="addAccount_radiobutton_accounttype_card" v-model="account.type" value="card">
                                <label class="btn" for="addAccount_radiobutton_accounttype_card" :class="account.type == 'card' ? 'active' : ''">Card</label>

                                <input type="radio" class="btn-check" name="account-type" id="addAccount_radiobutton_accounttype_2fa" v-model="account.type" value="2fa">
                                <label class="btn" for="addAccount_radiobutton_accounttype_2fa" :class="account.type == '2fa' ? 'active' : ''">2FA</label>
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
                            <label class="form-label" for="addAccount_platform_input"><i class="fa fa-globe" aria-hidden="true"></i> Platform</label>
                            <input id="addAccount_platform_input" class="form-control" placeholder="Platform" type="text" ref="platform" v-model="account.platform" @keyup.enter="add()" required />
                        </div>
                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
                            <label class="form-label" for="addAccount_input_new_tag"><i class="fa fa-tags" aria-hidden="true"></i> Tags</label>
                            <div class="form-control tags tags-input" @click="focusTagInput()">
                                <span
                                    class="badge rounded-pill badge-primary"
                                    v-for="(tag, tagIndex) in account.tags.split(',')"
                                    v-bind:key="tagIndex"
                                    @click="removeTag(tag)">
                                    {{ tag }}
                                    <i class="fa fa-close" v-if="tag"></i>
                                </span>
                            </div>
                            <input ref="tags" id="addAccount_input_new_tag" class="form-control tags-new-input" placeholder="Tag" type="text" v-model="newTag" @keyup.enter="addTag()" required />
                        </div>
                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
                            <label class="form-label" for="addAccount_platform_icon"><i class="fa fa-icons" aria-hidden="true"></i> Icon</label>
                            <input id="addAccount_platform_icon" class="form-control" placeholder="Icon URL" type="text" v-model="account.icon" @keyup.enter="add()" />
                        </div>

                        <hr class="my-4">

                        <!-- region_start -- Account type: card -->
                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12" v-if="account.type == 'card'">
                            <label class="form-label" for="addAccount_card_number_input"><i class="fa fa-barcode" aria-hidden="true"></i> Number</label>
                            <input id="addAccount_card_number_input" class="form-control" placeholder="Card number" type="text" v-model="account.card_number" @keyup.enter="add()" />
                        </div>
                        
                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12" v-if="account.type == 'card'">
                            <label class="form-label" for="addAccount_card_pin_input"><i class="fa fa-key" aria-hidden="true"></i> PIN</label>
                            <input id="addAccount_card_pin_input" class="form-control" placeholder="PIN" type="text" v-model="account.card_pin" @keyup.enter="add()" />
                        </div>

                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12" v-if="account.type == 'card'">
                            <label class="form-label" for="addAccount_card_expiracy_input"><i class="fa fa-calendar" aria-hidden="true"></i> Expiracy</label>
                            <input id="addAccount_card_expiracy_input" class="form-control" placeholder="Expiracy" type="text" v-model="account.card_expiracy" @keyup.enter="add()" />
                        </div>
                        
                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12" v-if="account.type == 'card'">
                            <label class="form-label" for="addAccount_card_cryptogram_input"><i class="fa fa-lock" aria-hidden="true"></i> Cryptogram</label>
                            <input id="addAccount_card_cryptogram_input" class="form-control" placeholder="CVC/CVV" type="text" v-model="account.card_cryptogram" @keyup.enter="add()" />
                        </div>

                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12" v-if="account.type == 'card'">
                            <label class="form-label" for="addAccount_card_name_input"><i class="fa fa-user" aria-hidden="true"></i> Name</label>
                            <input id="addAccount_card_name_input" class="form-control" placeholder="Name on card" type="text" v-model="account.card_name" @keyup.enter="add()" />
                        </div>
                        <!-- region_end -- Account type: card -->
                        
                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12" v-if="account.type == 'account' || account.type == '2fa'" :class="account.type == 'account' ? 'col-lg-3' : 'col-lg-6'">
                            <label class="form-label" for="addAccount_login_input"><i class="fa fa-id-badge" aria-hidden="true"></i> Login</label>
                            <input id="addAccount_login_input" class="form-control" placeholder="Login" type="text" v-model="account.login" @keyup.enter="add()" />
                        </div>

                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12" v-if="account.type == '2fa'">
                            <label class="form-label" for="addAccount_totp_secret_input"><i class="fa fa-key" aria-hidden="true"></i> TOTP Secret</label>
                            <input id="addAccount_totp_secret_input" class="form-control" placeholder="TOTP Secret" type="text" v-model="account.totp_secret" @keyup.enter="add()" />
                        </div>

                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12" v-if="account.type == 'account'">
                            <label class="form-label" for="addAccount_password_input"><i class="fa fa-lock" aria-hidden="true"></i> Password</label>
                            <div class="input-group">
                                <input id="addAccount_password_input" class="form-control" type="text" aria-describedby="addAccount_passwordHelp" v-model="account.password" placeholder="Password" @keyup.enter="add()" />
                                <button class="btn btn-outline-secondary" type="button" @click="account.generatePassword()"><i class="fa fa-cogs"></i> Generate</button>
                            </div>
                            <small id="addAccount_passwordHelp" class="form-text text-muted">Click button to generate password.</small>
                        </div>
                        
                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12" v-if="account.type == 'account'">
                            <label class="form-label" for="addAccount_password_clue_input"><i class="fa fa-eye" aria-hidden="true"></i> Password clue</label>
                            <input id="password_clue_input" class="form-control" type="text" v-model="account.password_clue" @keyup.enter="add()" />
                        </div>

                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12" v-if="account.type == 'account'">
                            <label class="form-label" for="addAccount_social_login_input"><i class="fa fa-users" aria-hidden="true"></i> Social login</label>
                            <input id="addAccount_social_login_input" class="form-control" placeholder="Google, Facebook, LinkedIn, ..." type="text" v-model="account.social_login" @keyup.enter="add()" />
                        </div>

                        <hr class="my-4">

                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
                            <label class="form-label" for="addAccount_description_input"><i class="fa fa-quote-left" aria-hidden="true"></i> Description</label>
                            <textarea id="addAccount_description_input" class="form-control" type="text" v-model="account.description" rows="3"></textarea>
                        </div>
                        
                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
                            <label class="form-label" for="addAccount_notes_input"><i class="fa fa-marker" aria-hidden="true"></i> Notes</label>
                            <textarea id="addAccount_notes_input" class="form-control" type="text" v-model="account.notes" rows="6"></textarea>
                        </div>

                        <hr class="my-4">
                    </div>
                </form>
            </div>

            <div class="row sidebar-footer">
                <button type="button" class="btn btn-primary" @click="add()" :disabled="isCreating">
                    <span v-if="isCreating" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span v-else><i class="fa fa-save"></i> Add</span>
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

            focusTagInput: function () {
                this.$refs.tags.focus();
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
    #account-sidebar-wrapper .right-sidebar {
        background: var(--color-background-mute);
    }
	
	@media (prefers-color-scheme: dark) {
		#account-sidebar-wrapper .right-sidebar {
			color: var(--color-text);
		}
	}

    .form-control {
        color: #343a40;
    }

    .sidebar-footer .btn-primary {
        color: #f8f9fa;
        border-color: var(--color-text);
        background: linear-gradient(81.62deg,#2870ea 8.72%,#1b4aef 85.01%);
    }

    .btn-group label.btn {
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
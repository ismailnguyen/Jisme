<template>
    <div id="account-sidebar-wrapper">
        <div class="right-sidebar">
            <div class="sidebar-header">
                <div class="row">
                    <div class="mb-3 col-xs-3 col-sm-3 col-3 col-md-3 col-lg-3" v-show="account.icon">
                        <img
                            :src="account.icon"
                            loading="lazy"
                            :alt="account.displayPlatform"
                            :title="account.displayPlatform"
                            class="sidebar-icon" />
                    </div>

                    <div class="mb-3" :class="account.icon ? 'col-xs-6 col-sm-6 col-6 col-md-6 col-lg-6' : 'col-xs-9 col-sm-9 col-9 col-md-9 col-lg-9'">
                        <h2 class="sidebar-title">{{ account.displayPlatform}}</h2>
                    </div>
                        
                    <div class="mb-3 col-xs-3 col-sm-3 col-3 col-md-3 col-lg-3 justify-content-end">
                        <button type="button" class="button--close" @click="closeAccount()">
                            <i class="fa fa-solid fa-close"></i>
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="sidebar-body">
                <form class="card-text lead">
                    <div class="row">
                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12 small">
                            <div class="btn-group" role="group" aria-label="Account type">
                                <input type="radio" class="btn-check" name="account-type" id="editAccount_radiobutton_accounttype_account" v-model="account.type" value="account">
                                <label class="btn" for="editAccount_radiobutton_accounttype_account" :class="account.type == 'account' ? 'active' : ''">Account</label>

                                <input type="radio" class="btn-check" name="account-type" id="editAccount_radiobutton_accounttype_card" v-model="account.type" value="card">
                                <label class="btn" for="editAccount_radiobutton_accounttype_card" :class="account.type == 'card' ? 'active' : ''">Card</label>

                                <input type="radio" class="btn-check" name="account-type" id="editAccount_radiobutton_accounttype_2fa" v-model="account.type" value="2fa">
                                <label class="btn" for="editAccount_radiobutton_accounttype_2fa" :class="account.type == '2fa' ? 'active' : ''">2FA</label>
                            </div>
                        </div>
                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
                            <label class="form-label" for="editAccount_input_platform"><i class="fa fa-globe" aria-hidden="true"></i> Platform</label>
                            <div class="input-group">
                                <button class="btn btn-outline-light" type="button" @click="copyToClipboard('editAccount_input_platform_hidden')"><i class="fa fa-clipboard"></i></button>
                                <input id="editAccount_input_platform" class="form-control" placeholder="Platform" type="text" v-model="account.platform" autofocus />
                            </div>
                            <input id="editAccount_input_platform_hidden" type="hidden" :value="account.platform" />
                        </div>

                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
                            <label class="form-label" for="editAccount_input_new_tag"><i class="fa fa-tags" aria-hidden="true"></i> Tags</label>
                            <div class="form-control tags tags-input">
                                <span
                                    class="badge badge-pill badge-primary"
                                    v-for="(tag, tagIndex) in account.tags.split(',')"
                                    v-bind:key="tagIndex"
                                    @click="removeTag(tag)">
                                    {{ tag }}
                                    <i class="fa fa-close" v-if="tag"></i>
                                </span>
                            </div>

                            <input id="editAccount_input_new_tag" class="form-control tags-new-input" placeholder="Enter new tag" type="text" @keyup.enter="addTag()" v-model="newTag" />
                        </div>

                        <hr class="my-4">

                        <!-- region_start -- Account type: card -->
                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12" v-if="account.type == 'card'">
                            <label class="form-label" for="editAccount_input_card_number"><i class="fa fa-barcode" aria-hidden="true"></i> Number</label>
                            <input id="editAccount_input_card_number" class="form-control" placeholder="Card number" type="text" v-model="account.card_number" @keyup.enter="add()" />
                        </div>

                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12" v-if="account.type == 'card'">
                            <label class="form-label" for="editAccount_input_card_name"><i class="fa fa-user" aria-hidden="true"></i> Name</label>
                            <input id="editAccount_input_card_name" class="form-control" placeholder="Name on card" type="text" v-model="account.card_name" @keyup.enter="add()" />
                        </div>
                        
                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12" v-if="account.type == 'card'">
                            <label class="form-label" for="editAccount_input_card_pin"><i class="fa fa-key" aria-hidden="true"></i> PIN</label>
                            <input id="editAccount_input_card_pin" class="form-control" placeholder="PIN" type="text" v-model="account.card_pin" @keyup.enter="add()" />
                        </div>

                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12" v-if="account.type == 'card'">
                            <label class="form-label" for="editAccount_input_card_expiracy"><i class="fa fa-calendar" aria-hidden="true"></i> Expiracy</label>
                            <input id="editAccount_input_card_expiracy" class="form-control" placeholder="Expiracy" type="text" v-model="account.card_expiracy" @keyup.enter="add()" />
                        </div>
                        
                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12" v-if="account.type == 'card'">
                            <label class="form-label" for="editAccount_input_card_cryptogram"><i class="fa fa-lock" aria-hidden="true"></i> Cryptogram</label>
                            <input id="editAccount_input_card_cryptogram" class="form-control" placeholder="CVC/CVV" type="text" v-model="account.card_cryptogram" @keyup.enter="add()" />
                        </div>
                        <!-- region_end -- Account type: card -->

                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12" v-if="account.type == '2fa'">
                            <label class="form-label" for="editAccount_input_totp_token"><i class="fa fa-qrcode" aria-hidden="true"></i> TOTP Token</label>
                            <input id="editAccount_input_totp_token" class="form-control" placeholder="Generated token" type="text" v-model="totpToken" readonly />
                        </div>

                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12" v-if="account.type == 'account' || account.type == '2fa'">
                            <label class="form-label" for="editAccount_input_login"><i class="fa fa-id-badge" aria-hidden="true"></i> Login</label>
                            <div class="input-group">
                                <button class="btn btn-outline-light" type="button" @click="copyToClipboard('editAccount_input_login_hidden')"><i class="fa fa-clipboard"></i></button>
                                <input id="editAccount_input_login" class="form-control" placeholder="Login" type="text" v-model="account.login" @keyup.enter="save()" />
                            </div>
                            <input id="editAccount_input_login_hidden" type="hidden" :value="account.login" />
                        </div>
                        
                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12" v-if="account.type == '2fa'">
                            <label class="form-label" for="editAccount_input_totp_secret"><i class="fa fa-key" aria-hidden="true"></i> TOTP Secret</label>
                            <input id="editAccount_input_totp_secret" class="form-control" placeholder="TOTP Secret" type="text" v-model="account.totp_secret" @keyup.enter="add()" />
                        </div>

                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12" v-if="account.type == 'account'">
                            <label class="form-label" for="editAccount_input_password"><i class="fa fa-lock" aria-hidden="true"></i> Password</label>
                            <div class="input-group">
                                <input id="editAccount_input_password" class="form-control" type="text" aria-describedby="editAccount_input_passwordHelp" v-model="account.password" @keyup.enter="save()" />
                                <input id="editAccount_input_password_hidden" type="hidden" :value="account.password" />
                                <button class="btn btn-outline-light" type="button" @click="account.generatePassword()"><i class="fa fa-cogs"></i> Generate</button>
                            </div>
                            <small id="editAccount_input_passwordHelp" class="form-text text-muted">Click button to generate password.</small>
                        </div>

                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12" v-if="account.type == 'account'">
                            <label class="form-label" for="editAccount_input_password_clue"><i class="fa fa-eye" aria-hidden="true"></i> Password clue</label>
                            <input id="editAccount_input_password_clue" class="form-control" type="text" v-model="account.password_clue" @keyup.enter="save()" />
                        </div>

                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12" v-if="account.type == 'account'">
                            <label class="form-label" for="editAccount_input_passwordless"><i class="fa fa-bolt" aria-hidden="true"></i> Password less</label>
                            <div class="input-group" v-show="passwordLess.generatedPassword">
                                <input id="editAccount_input_passwordless_generatedPassword" class="form-control" type="text" v-model="passwordLess.generatedPassword" readonly />
                                <button class="btn btn-outline-light" type="button" @click="resetPasswordLess()"><i class="fa fa-undo"></i> Reset</button>
                            </div>
                            <div class="input-group" v-show="!passwordLess.generatedPassword">
                                <input id="editAccount_input_passwordless_masterPassword" class="form-control" type="password" aria-describedby="editAccount_input_passwordlessHelp_masterPassword" v-model="passwordLess.masterPassword" />
                                <button class="btn btn-outline-light" type="button" @click="generatePasswordLess()"><i class="fa fa-cogs"></i> Generate</button>
                            </div>
                            <small id="editAccount_input_passwordlessHelp_masterPassword" class="form-text text-muted" v-show="!passwordLess.generatedPassword">Type your master password to generate the password less.</small>
                        </div>
                        
                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12" v-if="account.type == 'account'">
                            <label class="form-label" for="editAccount_input_social_login"><i class="fa fa-users" aria-hidden="true"></i> Social login</label>
                            <input id="editAccount_input_social_login" class="form-control" type="text" v-model="account.social_login" @keyup.enter="save()" />
                        </div>

                        <hr class="my-4">

                        <div class="mb-3 col-xs-12 col-md-12" :class="account.type == 'account' ? 'col-lg-12' : 'col-lg-12'">
                            <label class="form-label" for="editAccount_input_icon"><i class="fa fa-icons" aria-hidden="true"></i> Icon</label>
                            <input id="editAccount_input_icon" class="form-control" placeholder="Icon URL" type="text" v-model="account.icon" @keyup.enter="save()" />
                        </div>

                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
                            <label class="form-label" for="editAccount_input_description"><i class="fa fa-quote-left" aria-hidden="true"></i> Description</label>
                            <textarea id="editAccount_input_description" class="form-control" type="text" v-model="account.description" rows="3"></textarea>
                        </div>

                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
                            <label class="form-label" for="editAccount_input_notes"><i class="fa fa-marker" aria-hidden="true"></i> Notes</label>
                            <textarea id="editAccount_input_notes" class="form-control" type="text" v-model="account.notes" rows="6"></textarea>
                        </div>

                        <hr class="my-4">

                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
                            <label class="form-label" for="editAccount_input_notes"><i class="fa fa-marker" aria-hidden="true"></i> Notes</label>
                            <textarea id="editAccount_input_notes" class="form-control" type="text" v-model="account.notes" rows="6"></textarea>
                        </div>

                        <hr class="my-4">

                        <div class="mb-3 col-4 col-xs-4 col-sm-4 col-md-4 col-lg-4 small">
                            <label>Created</label>
                            <input class="form-control" v-model="createdDate" disabled />
                        </div>
                        <div class="mb-3 col-4 col-xs-4 col-sm-4 col-md-4 col-lg-4 small">
                            <label>Modified</label>
                            <input class="form-control" v-model="lastModifiedDate" disabled />
                        </div>
                        <div class="mb-3 col-4 col-xs-4 col-sm-4 col-md-4 col-lg-4 small">
                            <label>Opened</label>
                            <input class="form-control" v-model="lastOpenedDate" disabled />
                        </div>

                        <hr class="my-4">
                    </div>
                </form>
            </div>

            <div class="sidebar-footer row">
                <div class="col-6 col-xs-6 col-md-6 col-lg-6">
                    <button type="button" class="btn" :class="isDeleting ? 'btn-dark': 'btn-outline-danger'" @click="remove()">
                        <i class="fa fa-trash"></i> {{ isDeleting ? 'Deleting ...' : 'Delete' }}
                    </button>
                </div>
                <div class="col-6 col-xs-6 col-md-6 col-lg-6">
                    <button type="button" class="btn" :class="isSaving ? 'btn-dark': 'btn-light'" @click="save()">
                        <i class="fa fa-save"></i> {{ isSaving ? 'Saving ...' : 'Save' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import '../assets/right_sidebar.css'

    import { storeToRefs } from 'pinia'
    import {
        useUiStore,
        useAlertStore,
        useAccountsStore
    } from '@/store'
    import Alert from '../models/Alert'
    import totpGenerator from 'totp-generator'

    export default {
        data() {
            return {
                showModalContent: false,
                isSaving: false,
                isDeleting: false,
                newTag: '',
                passwordLess: {
                    masterPassword: '',
                    generatedPassword: ''
                }
            }
        },
        setup() {
            const accountsStore = useAccountsStore()

            const uiStore = useUiStore()
            const { closeEditAccountModal } = uiStore
            const { currentEditingAccount } = storeToRefs(uiStore)
            const account = currentEditingAccount

            const { openAlert } = useAlertStore()

            return {
                account,
                accountsStore,
                closeEditAccountModal,

                openAlert
            }
        },
        methods: {
            save: async function() {
                if (!this.account.isValid()) {
                    this.showAlert('Error', 'Please fill all fields !', 'danger');
                    return;
                }

                this.isSaving = true;

                try {
                    await this.accountsStore.updateAccount(this.account);

                    this.openAlert(new Alert(this.account.displayPlatform, 'Updated !', 'success', this.account.icon));
                    this.updateUI();
                }
                catch (error) {
                    this.showAlert('Error', error.toString(), 'danger');
                    this.isSaving = false;
                }
            },

            updateUI: function ()
            {
                this.isSaving = false;
                this.isDeleting = false;

                this.closeAccount();
            },
            
            toggleModalContent: async function() {
                this.showModalContent = !this.showModalContent;

                // Update the last opened date of this account each time the modal is opened
                if(this.showModalContent) {
                    // Leave this console log here for debugging purpose
                    console.log('debug', this.account);

                    try {
                        await this.accountsStore.updateAccount(this.account);
                    }
                    catch (error) {
                        this.showAlert('Error', error.toString(), 'danger');
                    }
                }
            },

            generatePasswordLess: function () {
                this.account.generatePasswordLess(this.passwordLess.masterPassword).then((generatedPassword) => {
                    this.passwordLess.generatedPassword = generatedPassword;
                });
            },

            resetPasswordLess: function () {
                this.passwordLess.generatedPassword = '';
            },

            remove: async function () {
                if (confirm(`Are you sure to delete : ${this.account.displayPlatform } ?`) === true)
                {
                    this.isDeleting = true;

                    try {
                        await this.accountsStore.removeAccount(this.account);

                        this.showAlert(this.account.displayPlatform, 'Removed !', 'success');
                        this.updateUI();
                    }
                    catch (error) {
                        this.showAlert('Error', error.toString(), 'danger');
                        this.isDeleting = false;
                    }
                }
            },

            addTag: function () {
                this.account.tags += ',' + this.newTag;
                this.newTag = '';
            },

            removeTag: function (tag) {
                let newTags = this.account.tags.split(',').map(t => t.trim());
                newTags.splice(newTags.indexOf(tag), 1);
                this.account.tags = newTags.join(',');
            },

            showAlert: function (title, message, type) {
                this.openAlert(new Alert(title, message, type));
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

            closeAccount: function () {
                this.closeEditAccountModal();
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
            },

            totpToken: function () {
                if (this.account.type == '2fa' && this.account.totp_secret) {
                     // Remove all spaces because spaces are forbidden for TOTP generation
                     // And some websites give the secret with spaces for better human readability
                    return totpGenerator(this.account.totp_secret.replace(/ /g,''));
                }

                return 'Please fill the secret key';
            }
        }
    } 
</script>

<style scoped>
    #account-sidebar-wrapper .right-sidebar {
        color: #f8f9fa;
        background: linear-gradient(141.13deg,#106cde 26.29%,#36a5ef 100%);
    }
	
	@media (prefers-color-scheme: dark) {
		#account-sidebar-wrapper .right-sidebar {
			color: #e4e6eb;
			background: linear-gradient(141.69deg,#3077e2 0%,#1b42ab 100%);
		}
	}

    .btn-outline-light {
        border-color: #ced4da70;
    }

    .btn-group label.btn.btn-outline-primary:hover {
        background: #fff;
        color: #000;
    }

    .btn-group label.btn {
        color: #fff;
        border-color: #fff;
    }

    .btn-group label.btn.active {
        background: #fff;
        color: #000;
        border-color: #fff;
    }
</style>
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
                        <h2 class="modal-title">{{ account.displayPlatform }}</h2>
                        <button type="button" class="close" @click="closeModal()">
                            <span class="close-svg-container">
                                <svg width="21" height="21" class="as-svgicon as-svgicon-close as-svgicon-tiny as-svgicon-closetiny" role="img" aria-hidden="true"><path fill="none" d="M0 0h21v21H0z"></path><path d="M12.12 10l4.07-4.06a1.5 1.5 0 10-2.11-2.12L10 7.88 5.94 3.81a1.5 1.5 0 10-2.12 2.12L7.88 10l-4.07 4.06a1.5 1.5 0 000 2.12 1.51 1.51 0 002.13 0L10 12.12l4.06 4.07a1.45 1.45 0 001.06.44 1.5 1.5 0 001.06-2.56z"></path></svg>
                            </span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form class="card-text lead">
                            <div class="row">
                                <div class="form-group col-xs-6 col-md-6 col-lg-6 small">
                                    <label>Type</label>
                                    <br>
                                    <div class="btn-group" role="group" aria-label="Account type">
                                        <label class="btn btn-outline-primary" for="editAccount_radiobutton_accounttype_account" :class="account.type == 'account' ? 'active' : ''">Account</label>
                                        <input type="radio" class="btn-check" id="editAccount_radiobutton_accounttype_account" value="account" v-model="account.type">

                                        <label class="btn btn-outline-primary" for="editAccount_radiobutton_accounttype_card" :class="account.type == 'card' ? 'active' : ''">Card</label>
                                        <input type="radio" class="btn-check" id="editAccount_radiobutton_accounttype_card" value="card" v-model="account.type">

                                        <label class="btn btn-outline-primary" for="editAccount_radiobutton_accounttype_2fa" :class="account.type == '2fa' ? 'active' : ''">2FA</label>
                                        <input type="radio" class="btn-check" id="editAccount_radiobutton_accounttype_2fa" value="2fa" v-model="account.type">
                                    </div>
                                </div>
                                <div class="form-group col-xs-6 col-md-6 col-lg-6">
                                    <label for="editAccount_input_platform">Platform</label>
                                    <input id="editAccount_input_platform" class="form-control" placeholder="Platform" type="text" v-model="account.platform" v-on:dblclick="copyToClipboard('editAccount_input_platform_hidden')" autofocus />
                                    <input id="editAccount_input_platform_hidden" type="hidden" :value="account.platform" />
                                </div>

                                <div class="form-group col-xs-12 col-md-6 col-lg-6">
                                    <label for="editAccount_input_new_tag">Tags</label>
                                    <div id="editAccount_input_tags" class="form-control tags">
                                        <span
                                            class="badge badge-pill badge-primary"
                                            v-for="(tag, tagIndex) in account.tags.split(',')"
                                            v-bind:key="tagIndex"
                                            @click="removeTag(tag)">
                                            {{ tag }}
                                            <i class="fa fa-close" v-if="tag"></i>
                                        </span>
                                    </div>

                                    <input id="editAccount_input_new_tag" class="form-control" placeholder="Enter new tag" type="text" @keyup.enter="addTag()" v-model="newTag" />
                                </div>

                                <!-- region_start -- Account type: card -->
                                <div class="form-group col-xs-12 col-md-6 col-lg-6" v-if="account.type == 'card'">
                                    <label for="editAccount_input_card_number">Number</label>
                                    <input id="editAccount_input_card_number" class="form-control" placeholder="Card number" type="text" v-model="account.card_number" @keyup.enter="add()" />
                                </div>

                                <div class="form-group col-xs-6 col-md-6 col-lg-6" v-if="account.type == 'card'">
                                    <label for="editAccount_input_card_name">Name</label>
                                    <input id="editAccount_input_card_name" class="form-control" placeholder="Name on card" type="text" v-model="account.card_name" @keyup.enter="add()" />
                                </div>
                                
                                <div class="form-group col-xs-6 col-md-3 col-lg-3" v-if="account.type == 'card'">
                                    <label for="editAccount_input_card_pin">PIN</label>
                                    <input id="editAccount_input_card_pin" class="form-control" placeholder="PIN" type="text" v-model="account.card_pin" @keyup.enter="add()" />
                                </div>

                                <div class="form-group col-xs-6 col-md-3 col-lg-3" v-if="account.type == 'card'">
                                    <label for="editAccount_input_card_expiracy">Expiracy</label>
                                    <input id="editAccount_input_card_expiracy" class="form-control" placeholder="Expiracy" type="text" v-model="account.card_expiracy" @keyup.enter="add()" />
                                </div>
                                
                                <div class="form-group col-xs-6 col-md-3 col-lg-3" v-if="account.type == 'card'">
                                    <label for="editAccount_input_card_cryptogram">Cryptogram</label>
                                    <input id="editAccount_input_card_cryptogram" class="form-control" placeholder="CVC/CVV" type="text" v-model="account.card_cryptogram" @keyup.enter="add()" />
                                </div>
                                <!-- region_end -- Account type: card -->

                                <div class="form-group col-xs-12 col-md-6 col-lg-6" v-if="account.type == '2fa'">
                                    <label for="editAccount_input_totp_token">TOTP Token</label>
                                    <input id="editAccount_input_totp_token" class="form-control" placeholder="Generated token" type="text" v-model="totpToken" readonly />
                                </div>

                                <div class="form-group col-xs-12 col-md-6 col-lg-6" v-if="account.type == 'account' || account.type == '2fa'">
                                    <label for="editAccount_input_login">Login</label>
                                    <input id="editAccount_input_login" class="form-control" placeholder="Login" type="text" v-model="account.login" @keyup.enter="save()" v-on:dblclick="copyToClipboard('editAccount_input_login_hidden')" />
                                    <input id="editAccount_input_login_hidden" type="hidden" :value="account.login" />
                                </div>
                                
                                <div class="form-group col-xs-12 col-md-6 col-lg-9" v-if="account.type == '2fa'">
                                    <label for="editAccount_input_totp_secret">TOTP Secret</label>
                                    <input id="editAccount_input_totp_secret" class="form-control" placeholder="TOTP Secret" type="text" v-model="account.totp_secret" @keyup.enter="add()" />
                                </div>

                                <div class="form-group col-xs-12 col-md-6 col-lg-6" v-if="account.type == 'account'">
                                    <label for="editAccount_input_password">Password</label>
                                    <div class="input-group">
                                        <input id="editAccount_input_password" class="form-control" type="text" aria-describedby="editAccount_input_passwordHelp" v-model="account.password" @keyup.enter="save()" />
                                        <input id="editAccount_input_password_hidden" type="hidden" :value="account.password" />
                                        <div class="input-group-append">
                                            <button class="btn btn-outline-light" type="button" @click="account.generatePassword()">Generate</button>
                                        </div>
                                    </div>
                                    <small id="editAccount_input_passwordHelp" class="form-text text-muted">Click button to generate password.</small>
                                </div>

                                <div class="form-group col-xs-12 col-md-6 col-lg-3" v-if="account.type == 'account'">
                                    <label for="editAccount_input_password_clue">Password clue</label>
                                    <input id="editAccount_input_password_clue" class="form-control" type="text" v-model="account.password_clue" @keyup.enter="save()" />
                                </div>
								
								<div class="form-group col-xs-12 col-md-6 col-lg-3" v-if="account.type == 'account'">
                                    <label for="editAccount_input_social_login">Social login</label>
                                    <input id="editAccount_input_social_login" class="form-control" type="text" v-model="account.social_login" @keyup.enter="save()" />
                                </div>
								
                                <div class="form-group col-xs-12 col-md-3" :class="account.type == 'account' ? 'col-lg-6' : 'col-lg-3'">
                                    <label for="editAccount_input_icon">Icon</label>
                                    <input id="editAccount_input_icon" class="form-control" placeholder="Icon URL" type="text" v-model="account.icon" @keyup.enter="save()" />
                                </div>

								<div class="form-group col-xs-12 col-md-12 col-lg-12">
                                    <label for="editAccount_input_notes">Notes</label>
                                    <textarea id="editAccount_input_notes" class="form-control" type="text" v-model="account.notes" rows="6"></textarea>
                                </div>
								
                                <div class="form-group col-xs-3 col-md-3 col-lg-3 small">
                                    <label>Created</label>
                                    <input class="form-control" v-model="createdDate" disabled />
                                </div>
                                <div class="form-group col-xs-3 col-md-3 col-lg-3 small">
                                    <label>Modified</label>
                                    <input class="form-control" v-model="lastModifiedDate" disabled />
                                </div>
                                <div class="form-group col-xs-3 col-md-3 col-lg-3 small">
                                    <label>Opened</label>
                                    <input class="form-control" v-model="lastOpenedDate" disabled />
                                </div>
                                
                                
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <div class="col-xs-12 col-md-6">
                            <button type="button" class="btn" :class="isDeleting ? 'btn-dark': 'btn-outline-danger'" @click="remove()">{{ isDeleting ? 'Deleting ...' : 'Delete' }}</button>
                        </div>
                        <div class=" col-xs-12 col-md-6">
                            <button type="button" class="btn" :class="isSaving ? 'btn-dark': 'btn-light'" @click="save()">{{ isSaving ? 'Saving ...' : 'Save' }}</button>
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
    import totpGenerator from 'totp-generator'

    export default {
        props: {
            user: Object,
            account: Account
        },
        data() {
            return {
                accountsService: new AccountsService(this.user, this.$store),
                userService: new UserService(),
                showModalContent: false,
                isSaving: false,
                isDeleting: false,
                newTag: ''
            }
        },
        methods: {
            save: function() {
                if (!this.account.isValid()) {
                    this.showAlert('Error', 'Please fill all fields !', 'danger');
                    return;
                }

                this.isSaving = true;

                this.account.last_modified_date = new Date();

                this.accountsService
                .save(this.account)
                .then(() => {
                    this.updateUI();
                    this.$emit('showAlert', new Alert(this.account.displayPlatform, 'Updated !', 'success', this.account.icon));
                })
                .catch(error => {
                    this.showAlert('Error', error.toString(), 'danger');
                    this.isSaving = false;
                })
            },

            updateUI: function ()
            {
                this.userService.update(this.user);

                this.isSaving = false;
                this.isDeleting = false;

                this.closeModal();
            },
            
            toggleModalContent: function() {
                this.showModalContent = !this.showModalContent;

                // Update the last opened date of this account each time the modal is opened
                if(this.showModalContent) {
                    // Leave this console log here for debugging purpose
                    console.log('debug', this.account);

                    this.account.last_opened_date = new Date();
                    this.account.opened_count = this.account.opened_count ? this.account.opened_count + 1 : 1;
                    this.accountsService.save(this.account);
                }
            },

            remove: function () {
                if (confirm(`Are you sure to delete : ${this.account.displayPlatform } ?`) === true)
                {
                    this.isDeleting = true;

                    this.accountsService
                    .remove(this.account)
                    .then(() => {
                        this.updateUI();
                        this.showAlert(this.account.displayPlatform, 'Removed !', 'success');
                    })
                    .catch(error => {
                        this.showAlert('Error', error.toString(), 'danger');
                        this.isDeleting = false;
                    })
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
        color: #f8f9fa;
    }

    .modal-content {
        color: #f8f9fa;
        background: linear-gradient(141.13deg,#106cde 26.29%,#36a5ef 100%);
        border: none;
    }

    @media (prefers-color-scheme: dark) {
		.modal-content {
            background: linear-gradient(141.69deg,#3077e2 0%,#1b42ab 100%);
		}
	}

    @media only screen and (min-width: 500px) {
        .modal-content {
            border-radius: 15px;
            margin: 10px;
        }
    }

    .text-muted, a {
      color: #99c9ff !important;
    }

    .form-control::placeholder {
        color: #ced4da70;
    }

    .form-control:disabled,
    .form-control[readonly] {
        background: none;
    }

    .form-control#editAccount_input_tags {
        border-bottom-right-radius: 0;
        border-bottom-left-radius: 0;
    }

    .form-control#editAccount_input_new_tag {
        border-top-right-radius: 0;
        border-top-left-radius: 0;
    }

    .modal-footer .btn {
        width:100%;
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
        color: #fff;
        border-color: #fff;
    }

    .btn-group label.btn.active {
        background: #fff;
        color: #000;
        border-color: #fff;
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
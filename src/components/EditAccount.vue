<template>
    <div class="sidebar-wrapper right-sidebar-wrapper" :class="visible ? 'sidebar-wrapper-open' : ''">
        <div class="sidebar right-sidebar bg-gradient-blue">
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
                        <h2 class="sidebar-title" :title="account._id">{{ account.displayPlatform }}</h2>
                    </div>
                        
                    <div class="mb-3 col-xs-3 col-sm-3 col-3 col-md-3 col-lg-3 justify-content-end">
                        <button type="button" class="button--close" @click="closeAccountEditing()">
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

                        <!-- region_start -- Account type: card -->
                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12" v-if="account.type == 'card'">
                            <label
                                v-show="!fieldAttrs.card_number.isExpanded"
                                @click="fieldAttrs.card_number.isExpanded=!fieldAttrs.card_number.isExpanded"
                                class="form-label"
                                for="editAccount_input_card_number">
                                <i class="fa fa-barcode" aria-hidden="true"></i> {{ account.card_number || 'Number' }}
                                <i class="fa fa-chevron-down float-end" aria-hidden="true"></i>
                            </label>
                            <label
                                v-show="fieldAttrs.card_number.isExpanded"
                                @click="fieldAttrs.card_number.isExpanded=!fieldAttrs.card_number.isExpanded"
                                class="form-label"
                                for="editAccount_input_card_number">
                                <i class="fa fa-barcode" aria-hidden="true"></i> Number
                                <i class="fa fa-chevron-up float-end" aria-hidden="true"></i>
                            </label>
                            <input v-show="fieldAttrs.card_number.isExpanded" id="editAccount_input_card_number" class="form-control" placeholder="Card number" type="text" v-model="account.card_number" @keyup.enter="add()" />
                        </div>

                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12" v-if="account.type == 'card'">
                            <label
                                v-show="!fieldAttrs.card_name.isExpanded"
                                @click="fieldAttrs.card_name.isExpanded=!fieldAttrs.card_name.isExpanded"
                                class="form-label"
                                for="editAccount_input_card_name">
                                <i class="fa fa-user" aria-hidden="true"></i> {{ account.card_name || 'Name' }}
                                <i class="fa fa-chevron-down float-end" aria-hidden="true"></i>
                            </label>
                            <label
                                v-show="fieldAttrs.card_name.isExpanded"
                                @click="fieldAttrs.card_name.isExpanded=!fieldAttrs.card_name.isExpanded"
                                class="form-label"
                                for="editAccount_input_card_name">
                                <i class="fa fa-user" aria-hidden="true"></i> Name
                                <i class="fa fa-chevron-up float-end" aria-hidden="true"></i>
                            </label>
                            <input v-show="fieldAttrs.card_name.isExpanded" id="editAccount_input_card_name" class="form-control" placeholder="Name on card" type="text" v-model="account.card_name" @keyup.enter="add()" />
                        </div>
                        
                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12" v-if="account.type == 'card'">
                            <label
                                v-show="!fieldAttrs.card_pin.isExpanded"
                                @click="fieldAttrs.card_pin.isExpanded=!fieldAttrs.card_pin.isExpanded"
                                class="form-label"
                                for="editAccount_input_card_pin">
                                <i class="fa fa-key" aria-hidden="true"></i> {{ account.card_pin || 'PIN' }}
                                <i class="fa fa-chevron-down float-end" aria-hidden="true"></i>
                            </label>
                            <label
                                v-show="fieldAttrs.card_pin.isExpanded"
                                @click="fieldAttrs.card_pin.isExpanded=!fieldAttrs.card_pin.isExpanded"
                                class="form-label"
                                for="editAccount_input_card_pin">
                                <i class="fa fa-key" aria-hidden="true"></i> PIN
                                <i class="fa fa-chevron-up float-end" aria-hidden="true"></i>
                            </label>
                            <input v-show="fieldAttrs.card_pin.isExpanded" id="editAccount_input_card_pin" class="form-control" placeholder="PIN" type="text" v-model="account.card_pin" @keyup.enter="add()" />
                        </div>

                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12" v-if="account.type == 'card'">
                            <label
                                v-show="!fieldAttrs.card_expiracy.isExpanded"
                                @click="fieldAttrs.card_expiracy.isExpanded=!fieldAttrs.card_expiracy.isExpanded"
                                class="form-label"
                                for="editAccount_input_card_expiracy">
                                <i class="fa fa-calendar" aria-hidden="true"></i> {{ account.card_expiracy || 'Expiracy' }}
                                <i class="fa fa-chevron-down float-end" aria-hidden="true"></i>
                            </label>
                            <label
                                v-show="fieldAttrs.card_expiracy.isExpanded"
                                @click="fieldAttrs.card_expiracy.isExpanded=!fieldAttrs.card_expiracy.isExpanded"
                                class="form-label"
                                for="editAccount_input_card_expiracy">
                                <i class="fa fa-calendar" aria-hidden="true"></i> Expiracy
                                <i class="fa fa-chevron-up float-end" aria-hidden="true"></i>
                            </label>
                            <input v-show="fieldAttrs.card_expiracy.isExpanded" id="editAccount_input_card_expiracy" class="form-control" placeholder="Expiracy" type="text" v-model="account.card_expiracy" @keyup.enter="add()" />
                        </div>
                        
                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12" v-if="account.type == 'card'">
                            <label
                                v-show="!fieldAttrs.card_cryptogram.isExpanded"
                                @click="fieldAttrs.card_cryptogram.isExpanded=!fieldAttrs.card_cryptogram.isExpanded"
                                class="form-label"
                                for="editAccount_input_card_cryptogram">
                                <i class="fa fa-lock" aria-hidden="true"></i> {{ account.card_cryptogram || 'Cryptogram (CVV/CVC)' }}
                                <i class="fa fa-chevron-down float-end" aria-hidden="true"></i>
                            </label>
                            <label
                                v-show="fieldAttrs.card_cryptogram.isExpanded"
                                @click="fieldAttrs.card_cryptogram.isExpanded=!fieldAttrs.card_cryptogram.isExpanded"
                                class="form-label"
                                for="editAccount_input_card_cryptogram">
                                <i class="fa fa-lock" aria-hidden="true"></i> Cryptogram (CVV/CVC)
                                <i class="fa fa-chevron-up float-end" aria-hidden="true"></i>
                            </label>
                            <input v-show="fieldAttrs.card_cryptogram.isExpanded" id="editAccount_input_card_cryptogram" class="form-control" placeholder="CVC/CVV" type="text" v-model="account.card_cryptogram" @keyup.enter="add()" />
                        </div>
                        <!-- region_end -- Account type: card -->

                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12" v-if="account.type == 'account' || account.type == '2fa'">
                            <label
                                v-show="!fieldAttrs.login.isExpanded"
                                @click="fieldAttrs.login.isExpanded=!fieldAttrs.login.isExpanded"
                                class="form-label"
                                for="editAccount_input_login">
                                <i class="fa fa-id-badge" aria-hidden="true"></i> {{ account.login || 'Login' }}
                                <i class="fa fa-chevron-down float-end" aria-hidden="true"></i>
                            </label>
                            <label
                                v-show="fieldAttrs.login.isExpanded"
                                @click="fieldAttrs.login.isExpanded=!fieldAttrs.login.isExpanded"
                                class="form-label"
                                for="editAccount_input_login">
                                <i class="fa fa-id-badge" aria-hidden="true"></i> Login
                                <i class="fa fa-chevron-up float-end" aria-hidden="true"></i>
                            </label>
                            <div class="input-group" v-show="fieldAttrs.login.isExpanded">
                                <button class="btn btn-outline-light" type="button" @click="copyToClipboard('editAccount_input_login_hidden')"><i class="fa fa-clipboard"></i></button>
                                <input id="editAccount_input_login" class="form-control" placeholder="Login" type="text" autocomplete="username" v-model="account.login" @keyup.enter="save()" />
                            </div>
                            <input v-show="fieldAttrs.login.isExpanded" id="editAccount_input_login_hidden" type="hidden" :value="account.login" />
                        </div>

                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12" v-if="account.type == '2fa'">
                            <label
                                v-show="!fieldAttrs.totpToken.isExpanded"
                                @click="fieldAttrs.totpToken.isExpanded=!fieldAttrs.totpToken.isExpanded"
                                class="form-label"
                                for="editAccount_input_totp_token">
                                <i class="fa fa-qrcode" aria-hidden="true"></i>
                                {{ totpToken }}
                                <i class="fa fa-chevron-down float-end" aria-hidden="true"></i>
                            </label>
                            <label
                                v-show="fieldAttrs.totpToken.isExpanded"
                                @click="fieldAttrs.totpToken.isExpanded=!fieldAttrs.totpToken.isExpanded"
                                class="form-label"
                                for="editAccount_input_totp_token">
                                <i class="fa fa-qrcode" aria-hidden="true"></i> TOTP Token
                                <i class="fa fa-chevron-up float-end" aria-hidden="true"></i>
                            </label>
                            <input v-show="fieldAttrs.totpToken.isExpanded" id="editAccount_input_totp_token" class="form-control" placeholder="Generated token" type="text" v-model="totpToken" readonly />
                        </div>
                        
                        <div v-show="fieldAttrs.totpToken.isExpanded" class="mb-3 col-xs-12 col-md-12 col-lg-12" v-if="account.type == '2fa'">
                            <label class="form-label" for="editAccount_input_totp_secret"><i class="fa fa-key" aria-hidden="true"></i> TOTP Secret</label>
                            <input id="editAccount_input_totp_secret" class="form-control" placeholder="TOTP Secret" type="text" v-model="account.totp_secret" @keyup.enter="add()" />
                        </div>

                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12" v-if="account.type == 'account'">
                            <label
                                v-show="!fieldAttrs.password.isExpanded"
                                @click="fieldAttrs.password.isExpanded=!fieldAttrs.password.isExpanded"
                                class="form-label tags"
                                for="editAccount_input_password">
                                <i class="fa fa-lock" aria-hidden="true"></i>
                                {{ account.password || account.password_clue || (account.social_login? '' : 'Password') }}
                                <div
                                    class="badge rounded-pill text-bg-danger"
                                    v-for="socialLogin in account.social_login.split(',')"
                                    v-show="account.social_login"
                                    v-bind:key="socialLogin">
                                    {{ socialLogin }}
                                </div>
                                <i class="fa fa-chevron-down float-end" aria-hidden="true"></i>
                            </label>
                            <label
                                v-show="fieldAttrs.password.isExpanded"
                                @click="fieldAttrs.password.isExpanded=!fieldAttrs.password.isExpanded"
                                class="form-label"
                                for="editAccount_input_password">
                                <i class="fa fa-lock" aria-hidden="true"></i>
                                Password
                                <i class="fa fa-chevron-up float-end" aria-hidden="true"></i>
                            </label>
                            <div class="input-group" v-show="fieldAttrs.password.isExpanded">
                                <input id="editAccount_input_password" class="form-control" type="text" autocomplete="new-password" aria-describedby="editAccount_input_passwordHelp" v-model="account.password" @keyup.enter="save()" />
                                <input id="editAccount_input_password_hidden" type="hidden" :value="account.password" />
                                <button class="btn btn-outline-light" type="button" @click="account.generatePassword()"><i class="fa fa-cogs"></i> Generate</button>
                            </div>
                            <small v-show="fieldAttrs.password.isExpanded" id="editAccount_input_passwordHelp" class="form-text text-muted">Click button to generate password.</small>
                        </div>

                        <div v-show="fieldAttrs.password.isExpanded" class="mb-3 col-xs-12 col-md-12 col-lg-12" v-if="account.type == 'account'">
                            <label class="form-label" for="editAccount_input_password_clue"><i class="fa fa-eye" aria-hidden="true"></i> Password clue</label>
                            <input id="editAccount_input_password_clue" class="form-control" type="text" v-model="account.password_clue" @keyup.enter="save()" />
                        </div>

                        <div v-show="fieldAttrs.password.isExpanded" class="mb-3 col-xs-12 col-md-12 col-lg-12" v-if="account.type == 'account'">
                            <label class="form-label" for="editAccount_input_passwordless_generatedPassword" v-show="passwordLess.generatedPassword">
                                <i class="fa fa-bolt" aria-hidden="true"></i> Password less
                            </label>
                            <div class="input-group" v-show="passwordLess.generatedPassword">
                                <input id="editAccount_input_passwordless_generatedPassword" class="form-control" type="text" v-model="passwordLess.generatedPassword" readonly />
                                <button class="btn btn-outline-light" type="button" @click="resetPasswordLess()"><i class="fa fa-undo"></i> Reset</button>
                            </div>

                            <label class="form-label" for="editAccount_input_passwordless_masterPassword" v-show="!passwordLess.generatedPassword">
                                <i class="fa fa-bolt" aria-hidden="true"></i> Password less
                            </label>
                            <div class="input-group" v-show="!passwordLess.generatedPassword">
                                <input id="editAccount_input_passwordless_masterPassword" class="form-control" type="password" autocomplete="current-password" aria-describedby="editAccount_input_passwordlessHelp_masterPassword" v-model="passwordLess.masterPassword" />
                                <button class="btn btn-outline-light" type="button" @click="generatePasswordLess()"><i class="fa fa-cogs"></i> Generate</button>
                            </div>
                            <small id="editAccount_input_passwordlessHelp_masterPassword" class="form-text text-muted" v-show="!passwordLess.generatedPassword">Type your master password to generate the password less.</small>
                        </div>
                        
                        <div v-show="fieldAttrs.password.isExpanded" class="mb-3 col-xs-12 col-md-12 col-lg-12" v-if="account.type == 'account'">
                            <label class="form-label" for="editAccount_input_social_login"><i class="fa fa-users" aria-hidden="true"></i> Social login</label>
                            <input id="editAccount_input_social_login" class="form-control" type="text" v-model="account.social_login" @keyup.enter="save()" />
                        </div>

                        <hr class="my-4">

                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
                            <label
                                v-show="!fieldAttrs.platform.isExpanded"
                                @click="fieldAttrs.platform.isExpanded=!fieldAttrs.platform.isExpanded"
                                class="form-label"
                                for="editAccount_input_platform">
                                <i class="fa fa-globe" aria-hidden="true"></i> {{ account.platform }}
                                <i class="fa fa-chevron-down float-end" aria-hidden="true"></i>
                            </label>
                            <label
                                v-show="fieldAttrs.platform.isExpanded"
                                @click="fieldAttrs.platform.isExpanded=!fieldAttrs.platform.isExpanded"
                                class="form-label"
                                for="editAccount_input_platform">
                                <i class="fa fa-globe" aria-hidden="true"></i> Platform
                                <i class="fa fa-chevron-up float-end" aria-hidden="true"></i>
                            </label>
                            <div v-show="fieldAttrs.platform.isExpanded" class="input-group">
                                <button class="btn btn-outline-light" type="button" @click="copyToClipboard('editAccount_input_platform_hidden')"><i class="fa fa-clipboard"></i></button>
                                <input id="editAccount_input_platform" class="form-control" placeholder="Platform" type="text" v-model="account.platform" autofocus />
                            </div>
                            <input v-show="fieldAttrs.platform.isExpanded" id="editAccount_input_platform_hidden" type="hidden" :value="account.platform" />
                        </div>

                         <div v-show="fieldAttrs.platform.isExpanded" class="mb-3 col-xs-12 col-md-12" :class="account.type == 'account' ? 'col-lg-12' : 'col-lg-12'">
                            <label class="form-label" for="editAccount_input_icon"><i class="fa fa-icons" aria-hidden="true"></i> Icon</label>
                            <input id="editAccount_input_icon" class="form-control" placeholder="Icon URL" type="text" v-model="account.icon" @keyup.enter="save()" />
                        </div>

                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
                            <label
                                v-show="!fieldAttrs.tags.isExpanded"
                                @click="fieldAttrs.tags.isExpanded=!fieldAttrs.tags.isExpanded"
                                class="form-label tags"
                                for="editAccount_input_new_tag">
                                <i class="fa fa-tags" aria-hidden="true"></i>
                                <span
                                    class="badge rounded-pill badge-primary"
                                    v-for="tag in account.tags.split(',')"
                                    v-show="account.tags"
                                    v-bind:key="tag">
                                    {{ tag }}
                                </span>
                                <i class="fa fa-chevron-down float-end" aria-hidden="true"></i>
                            </label>
                            <label
                                v-show="fieldAttrs.tags.isExpanded"
                                @click="fieldAttrs.tags.isExpanded=!fieldAttrs.tags.isExpanded"
                                class="form-label"
                                for="editAccount_input_new_tag">
                                <i class="fa fa-tags" aria-hidden="true"></i> Tags
                                <i class="fa fa-chevron-up float-end" aria-hidden="true"></i>
                            </label>
                            <div v-show="fieldAttrs.tags.isExpanded" class="form-control tags tags-input" @click="focusTagInput()">
                                <span
                                    class="badge rounded-pill badge-primary"
                                    v-for="(tag, tagIndex) in account.tags.split(',')"
                                    v-bind:key="tagIndex"
                                    @click="removeTag(tagIndex)">
                                    {{ tag }}
                                    <i class="fa fa-close" v-if="tag"></i>
                                </span>
                            </div>

                            <input v-show="fieldAttrs.tags.isExpanded" ref="tags" id="editAccount_input_new_tag" class="form-control tags-new-input" placeholder="Enter new tag" type="text" @keyup.enter="addTag()" v-model="newTag" />
                        </div>

                        <hr class="my-4">

                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
                            <label class="form-label" for="editAccount_input_description"><i class="fa fa-message" aria-hidden="true"></i> Description</label>
                            <textarea id="editAccount_input_description" class="form-control" type="text" v-model="account.description" rows="3"></textarea>
                        </div>

                        <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
                            <label class="form-label" for="editAccount_input_notes"><i class="fa fa-marker" aria-hidden="true"></i> Notes</label>
                            <textarea id="editAccount_input_notes" class="form-control" type="text" v-model="account.notes" rows="6"></textarea>
                        </div>

                        <hr class="my-4">

                        <div class="mb-3 col-4 col-xs-4 col-sm-4 col-md-4 col-lg-4 small">
                            <label class="form-label" for="createdDate">
                                <i class="fa fa-clock" aria-hidden="true"></i> Created
                            </label>
                            <input type="text" readonly class="form-control-plaintext" id="createdDate" :value="createdDate">
                        </div>
                        <div class="mb-3 col-4 col-xs-4 col-sm-4 col-md-4 col-lg-4 small">
                            <label class="form-label" for="lastModifiedDate">
                                <i class="fa fa-clock" aria-hidden="true"></i> Modified
                            </label>
                            <input type="text" readonly class="form-control-plaintext" id="lastModifiedDate" :value="lastModifiedDate">
                        </div>
                        <div class="mb-3 col-4 col-xs-4 col-sm-4 col-md-4 col-lg-4 small">
                            <label class="form-label" for="lastOpenedDate">
                                <i class="fa fa-clock" aria-hidden="true"></i> Opened
                            </label>
                            <input type="text" readonly class="form-control-plaintext" id="lastOpenedDate" :value="lastOpenedDate">
                        </div>
                    </div>
                </form>
            </div>

            <div class="sidebar-footer row">
                <hr class="my-4">

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

    import { 
        mapState,
        mapActions
    } from 'pinia'
    import {
        useUiStore,
        useAlertStore,
        useAccountsStore
    } from '@/store'
    import totpGenerator from 'totp-generator'

    export default {
        props: {
            visible: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                showModalContent: false,
                isSaving: false,
                isDeleting: false,
                newTag: '',
                passwordLess: {
                    masterPassword: '',
                    generatedPassword: ''
                },
                fieldAttrs: {
                    login: {
                        isExpanded: false
                    },
                    password: {
                        isExpanded: false
                    },
                    password_clue: {
                        isExpanded: false
                    },
                    passwordless: {
                        isExpanded: false
                    },
                    social_login: {
                        isExpanded: false
                    },
                    platform: {
                        isExpanded: false
                    },
                    tags: {
                        isExpanded: false
                    },
                    icon: {
                        isExpanded: false
                    },
                    description: {
                        isExpanded: false
                    },
                    notes: {
                        isExpanded: false
                    },
                    totpToken: {
                        isExpanded: false
                    },
                    card_number: {
                        isExpanded: false
                    },
                    card_pin: {
                        isExpanded: false
                    },
                    card_expiracy: {
                        isExpanded: false
                    },
                    card_cryptogram: {
                        isExpanded: false
                    },
                    card_name: {
                        isExpanded: false
                    }
                }
            }
        },
        computed: {
            ...mapState(useUiStore, {
                account: 'currentEditingAccount',
                SIDEBAR: 'SIDEBAR'
            }),
    
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
                if (this.account.totp_secret) {
                     // Remove all spaces because spaces are forbidden for TOTP generation
                     // And some websites give the secret with spaces for better human readability
                    return totpGenerator(this.account.totp_secret.replace(/ /g,''));
                }

                return 'Please fill the secret key';
            }
        },
        methods: {
            ...mapActions(useAccountsStore, [
                'updateAccount',
                'removeAccount'
            ]),
            ...mapActions(useUiStore, [
                'closeSidebar',
                'resetCurrentEditingAccount'
            ]),
            ...mapActions(useAlertStore, ['openAlert']),
    
            save: async function() {
                if (!this.account.isValid()) {
                    this.openAlert('Error', 'Please fill all fields !', 'danger');
                    return;
                }

                this.isSaving = true;

                try {
                    await this.updateAccount(this.account);

                    this.openAlert(this.account.displayPlatform, 'Updated !', 'success', this.account.icon);
                    
                    this.isSaving = false;
                    this.isDeleting = false;

                    this.closeAccountEditing();
                }
                catch (error) {
                    this.openAlert('Error', error.toString(), 'danger');
                    this.isSaving = false;
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
                        await this.removeAccount(this.account);

                        this.openAlert(this.account.displayPlatform, 'Removed !', 'success');

                        this.isSaving = false;
                        this.isDeleting = false;

                        this.closeAccountEditing();
                    }
                    catch (error) {
                        this.openAlert('Error', error.toString(), 'danger');
                        this.isDeleting = false;
                    }
                }
            },

            focusTagInput: function () {
                this.$refs.tags.focus();
            },

            addTag: function () {
                this.account.tags += ',' + this.newTag;
                this.newTag = '';
            },

            removeTag: function (index) {
                let newTags = this.account.tags.split(',').map(t => t.trim());
                newTags.splice(index, 1);
                this.account.tags = newTags.join(',');
            },

            copyToClipboard: function (input) {
                let inputToCopy = document.querySelector('#' + input);
                inputToCopy.setAttribute('type', 'text');
                inputToCopy.select();

                document.execCommand('copy');

                /* unselect the range */
                inputToCopy.setAttribute('type', 'hidden');
                window.getSelection().removeAllRanges();

                this.openAlert(inputToCopy.value, 'Copied to clipboard !', 'info');
            },

            formatDate: function (date) {
                return date.getDate() + '/' + (date.getMonth()+1)  + '/' + date.getFullYear();
            },

            closeAccountEditing: function () {
                this.closeSidebar(this.SIDEBAR.EDIT_ACCOUNT);
                this.resetCurrentEditingAccount();
            }
        }
    } 
</script>

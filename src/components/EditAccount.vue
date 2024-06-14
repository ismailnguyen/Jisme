<template>
  <div
    id="edit-account-bottom-sheet"
    class="bottom-sheet"
    :class="visible ? 'show' : ''"
  >
    <div class="sheet-overlay" @click="closeAccountEditing()"></div>
    <div class="content">
      <div class="header row">
        <div class="drag-icon row justify-content-center"><span></span></div>

        <div class="row justify-content-center">
          <div class="col text-center">
            <img
              :src="account.icon"
              loading="lazy"
              :alt="account.displayPlatform"
              :title="account.displayPlatform"
              class="sidebar-large-icon"
            />
          </div>
        </div>
        <div class="row justify-content-center">
          <div class="col-12 text-center">
            <h2 class="sidebar-title" :title="account._id">
              {{ account.displayPlatform }}
            </h2>
          </div>
        </div>
      </div>
      <div class="body">
          <div class="row">
            <div class="mb-3 col-xs-12 col-md-12 col-lg-12 small">
              <div class="btn-group" role="group" aria-label="Account type">
                <input
                  type="radio"
                  class="btn-check"
                  name="account-type"
                  id="editAccount_radiobutton_accounttype_account"
                  v-model="account.type"
                  value="account"
                />
                <label
                  class="btn"
                  for="editAccount_radiobutton_accounttype_account"
                  :class="account.type == 'account' ? 'active' : ''"
                  >Account</label
                >

                <input
                  type="radio"
                  class="btn-check"
                  name="account-type"
                  id="editAccount_radiobutton_accounttype_card"
                  v-model="account.type"
                  value="card"
                />
                <label
                  class="btn"
                  for="editAccount_radiobutton_accounttype_card"
                  :class="account.type == 'card' ? 'active' : ''"
                  >Card</label
                >

                <input
                  type="radio"
                  class="btn-check"
                  name="account-type"
                  id="editAccount_radiobutton_accounttype_2fa"
                  v-model="account.type"
                  value="2fa"
                />
                <label
                  class="btn"
                  for="editAccount_radiobutton_accounttype_2fa"
                  :class="account.type == '2fa' ? 'active' : ''"
                  >2FA</label
                >
              </div>
            </div>

            <!-- region_start -- Account type: card -->
            <div
              class="mb-3 col-xs-12 col-md-12 col-lg-12"
              v-if="account.type == 'card'"
            >
              <label
                v-show="!fieldAttrs.card_number.isExpanded"
                @click="
                  fieldAttrs.card_number.isExpanded =
                    !fieldAttrs.card_number.isExpanded
                "
                class="form-label"
                for="editAccount_input_card_number"
              >
                <i class="fa fa-barcode" aria-hidden="true"></i>
                {{ account.card_number || "Number" }}
                <i class="fa fa-chevron-down float-end" aria-hidden="true"></i>
              </label>
              <label
                v-show="fieldAttrs.card_number.isExpanded"
                @click="
                  fieldAttrs.card_number.isExpanded =
                    !fieldAttrs.card_number.isExpanded
                "
                class="form-label"
                for="editAccount_input_card_number"
              >
                <i class="fa fa-barcode" aria-hidden="true"></i> Number
                <i class="fa fa-chevron-up float-end" aria-hidden="true"></i>
              </label>
              <input
                v-show="fieldAttrs.card_number.isExpanded"
                id="editAccount_input_card_number"
                class="form-control"
                placeholder="Card number"
                type="text"
                v-model="account.card_number"
                @keyup.enter="add()"
              />
            </div>

            <div
              class="mb-3 col-xs-12 col-md-12 col-lg-12"
              v-if="account.type == 'card'"
            >
              <label
                v-show="!fieldAttrs.card_name.isExpanded"
                @click="
                  fieldAttrs.card_name.isExpanded =
                    !fieldAttrs.card_name.isExpanded
                "
                class="form-label"
                for="editAccount_input_card_name"
              >
                <i class="fa fa-user" aria-hidden="true"></i>
                {{ account.card_name || "Name" }}
                <i class="fa fa-chevron-down float-end" aria-hidden="true"></i>
              </label>
              <label
                v-show="fieldAttrs.card_name.isExpanded"
                @click="
                  fieldAttrs.card_name.isExpanded =
                    !fieldAttrs.card_name.isExpanded
                "
                class="form-label"
                for="editAccount_input_card_name"
              >
                <i class="fa fa-user" aria-hidden="true"></i> Name
                <i class="fa fa-chevron-up float-end" aria-hidden="true"></i>
              </label>
              <input
                v-show="fieldAttrs.card_name.isExpanded"
                id="editAccount_input_card_name"
                class="form-control"
                placeholder="Name on card"
                type="text"
                v-model="account.card_name"
                @keyup.enter="add()"
              />
            </div>

            <div
              class="mb-3 col-xs-12 col-md-12 col-lg-12"
              v-if="account.type == 'card'"
            >
              <label
                v-show="!fieldAttrs.card_pin.isExpanded"
                @click="
                  fieldAttrs.card_pin.isExpanded =
                    !fieldAttrs.card_pin.isExpanded
                "
                class="form-label"
                for="editAccount_input_card_pin"
              >
                <i class="fa fa-key" aria-hidden="true"></i>
                {{ account.card_pin || "PIN" }}
                <i class="fa fa-chevron-down float-end" aria-hidden="true"></i>
              </label>
              <label
                v-show="fieldAttrs.card_pin.isExpanded"
                @click="
                  fieldAttrs.card_pin.isExpanded =
                    !fieldAttrs.card_pin.isExpanded
                "
                class="form-label"
                for="editAccount_input_card_pin"
              >
                <i class="fa fa-key" aria-hidden="true"></i> PIN
                <i class="fa fa-chevron-up float-end" aria-hidden="true"></i>
              </label>
              <input
                v-show="fieldAttrs.card_pin.isExpanded"
                id="editAccount_input_card_pin"
                class="form-control"
                placeholder="PIN"
                type="text"
                v-model="account.card_pin"
                @keyup.enter="add()"
              />
            </div>

            <div
              class="mb-3 col-xs-12 col-md-12 col-lg-12"
              v-if="account.type == 'card'"
            >
              <label
                v-show="!fieldAttrs.card_expiracy.isExpanded"
                @click="
                  fieldAttrs.card_expiracy.isExpanded =
                    !fieldAttrs.card_expiracy.isExpanded
                "
                class="form-label"
                for="editAccount_input_card_expiracy"
              >
                <i class="fa fa-calendar" aria-hidden="true"></i>
                {{ account.card_expiracy || "Expiracy" }}
                <i class="fa fa-chevron-down float-end" aria-hidden="true"></i>
              </label>
              <label
                v-show="fieldAttrs.card_expiracy.isExpanded"
                @click="
                  fieldAttrs.card_expiracy.isExpanded =
                    !fieldAttrs.card_expiracy.isExpanded
                "
                class="form-label"
                for="editAccount_input_card_expiracy"
              >
                <i class="fa fa-calendar" aria-hidden="true"></i> Expiracy
                <i class="fa fa-chevron-up float-end" aria-hidden="true"></i>
              </label>
              <input
                v-show="fieldAttrs.card_expiracy.isExpanded"
                id="editAccount_input_card_expiracy"
                class="form-control"
                placeholder="Expiracy"
                type="text"
                v-model="account.card_expiracy"
                @keyup.enter="add()"
              />
            </div>

            <div
              class="mb-3 col-xs-12 col-md-12 col-lg-12"
              v-if="account.type == 'card'"
            >
              <label
                v-show="!fieldAttrs.card_cryptogram.isExpanded"
                @click="
                  fieldAttrs.card_cryptogram.isExpanded =
                    !fieldAttrs.card_cryptogram.isExpanded
                "
                class="form-label"
                for="editAccount_input_card_cryptogram"
              >
                <i class="fa fa-lock" aria-hidden="true"></i>
                {{ account.card_cryptogram || "Cryptogram (CVV/CVC)" }}
                <i class="fa fa-chevron-down float-end" aria-hidden="true"></i>
              </label>
              <label
                v-show="fieldAttrs.card_cryptogram.isExpanded"
                @click="
                  fieldAttrs.card_cryptogram.isExpanded =
                    !fieldAttrs.card_cryptogram.isExpanded
                "
                class="form-label"
                for="editAccount_input_card_cryptogram"
              >
                <i class="fa fa-lock" aria-hidden="true"></i> Cryptogram
                (CVV/CVC)
                <i class="fa fa-chevron-up float-end" aria-hidden="true"></i>
              </label>
              <input
                v-show="fieldAttrs.card_cryptogram.isExpanded"
                id="editAccount_input_card_cryptogram"
                class="form-control"
                placeholder="CVC/CVV"
                type="text"
                v-model="account.card_cryptogram"
                @keyup.enter="add()"
              />
            </div>
            <!-- region_end -- Account type: card -->

            <div
              class="mb-3 col-xs-12 col-md-12 col-lg-12"
              v-if="account.type == 'account' || account.type == '2fa'"
            >
              <label
                v-show="!fieldAttrs.login.isExpanded"
                @click="
                  fieldAttrs.login.isExpanded = !fieldAttrs.login.isExpanded
                "
                class="form-label"
                for="editAccount_input_login"
              >
                <i class="fa fa-id-badge" aria-hidden="true"></i>
                {{ account.login || "Login" }}
                <i class="fa fa-chevron-down float-end" aria-hidden="true"></i>
              </label>
              <label
                v-show="fieldAttrs.login.isExpanded"
                @click="
                  fieldAttrs.login.isExpanded = !fieldAttrs.login.isExpanded
                "
                class="form-label"
                for="editAccount_input_login"
              >
                <i class="fa fa-id-badge" aria-hidden="true"></i> Login
                <i class="fa fa-chevron-up float-end" aria-hidden="true"></i>
              </label>
              <div class="input-group" v-show="fieldAttrs.login.isExpanded">
                <button
                  class="btn btn-outline-light"
                  type="button"
                  @click="copyToClipboard('editAccount_input_login_hidden')"
                >
                  <i class="fa fa-clipboard"></i>
                </button>
                <input
                  id="editAccount_input_login"
                  class="form-control"
                  placeholder="Login"
                  type="text"
                  autocomplete="username"
                  v-model="account.login"
                  @keyup.enter="save()"
                />
              </div>
              <input
                v-show="fieldAttrs.login.isExpanded"
                id="editAccount_input_login_hidden"
                type="hidden"
                :value="account.login"
              />
            </div>

            <div
              class="mb-3 col-xs-12 col-md-12 col-lg-12"
              v-if="account.type == '2fa'"
            >
              <label
                v-show="!fieldAttrs.totpToken.isExpanded"
                @click="
                  fieldAttrs.totpToken.isExpanded =
                    !fieldAttrs.totpToken.isExpanded
                "
                class="form-label"
                for="editAccount_input_totp_token"
              >
                <i class="fa fa-qrcode" aria-hidden="true"></i>
                {{ totpToken }}
                <i class="fa fa-chevron-down float-end" aria-hidden="true"></i>
              </label>
              <label
                v-show="fieldAttrs.totpToken.isExpanded"
                @click="
                  fieldAttrs.totpToken.isExpanded =
                    !fieldAttrs.totpToken.isExpanded
                "
                class="form-label"
                for="editAccount_input_totp_token"
              >
                <i class="fa fa-qrcode" aria-hidden="true"></i> TOTP Token
                <i class="fa fa-chevron-up float-end" aria-hidden="true"></i>
              </label>
              <input
                v-show="fieldAttrs.totpToken.isExpanded"
                id="editAccount_input_totp_token"
                class="form-control"
                placeholder="Generated token"
                type="text"
                v-model="totpToken"
                readonly
              />
            </div>

            <div
              v-show="fieldAttrs.totpToken.isExpanded"
              class="mb-3 col-xs-12 col-md-12 col-lg-12"
              v-if="account.type == '2fa'"
            >
              <label class="form-label" for="editAccount_input_totp_secret"
                ><i class="fa fa-key" aria-hidden="true"></i> TOTP Secret</label
              >
              <input
                id="editAccount_input_totp_secret"
                class="form-control"
                placeholder="TOTP Secret"
                type="text"
                v-model="account.totp_secret"
                @keyup.enter="add()"
              />
            </div>

            <div
              class="mb-3 col-xs-12 col-md-12 col-lg-12"
              v-if="account.type == 'account'"
            >
              <label
                v-show="!fieldAttrs.password.isExpanded"
                @click="
                  fieldAttrs.password.isExpanded =
                    !fieldAttrs.password.isExpanded
                "
                class="form-label tags"
                for="editAccount_input_password"
              >
                <i class="fa fa-lock" aria-hidden="true"></i>
                {{
                  account.password ||
                  account.password_clue ||
                  (account.social_login ? "" : "Password")
                }}
                <div
                  class="badge rounded-pill text-bg-danger"
                  v-for="socialLogin in account.social_login.split(',')"
                  v-show="account.social_login"
                  v-bind:key="socialLogin"
                >
                  {{ socialLogin }}
                </div>
                <i class="fa fa-chevron-down float-end" aria-hidden="true"></i>
              </label>
              <label
                v-show="fieldAttrs.password.isExpanded"
                class="form-label"
                for="editAccount_input_password"
              >
                <i class="fa fa-lock" aria-hidden="true"></i>
                Password
                <i
                  class="fa fa-chevron-up float-end"
                  aria-hidden="true"
                  @click="
                    fieldAttrs.password.isExpanded =
                      !fieldAttrs.password.isExpanded
                  "
                ></i>
              </label>

              <div
                class="input-group mb-3"
                v-if="fieldAttrs.password.isExpanded"
              >
                <button
                  class="btn btn-outline-light dropdown-toggle"
                  type="button"
                  @click.prevent="
                    showPasswordTypeOptions = !showPasswordTypeOptions
                  "
                >
                  {{ account.is_password_less ? "Password less" : "Password" }}
                </button>
                <ul
                  class="dropdown-menu"
                  :class="showPasswordTypeOptions ? 'show' : ''"
                >
                  <li>
                    <a
                      class="dropdown-item"
                      @click.prevent="selectPasswordType('password')"
                      >Password</a
                    >
                  </li>
                  <li>
                    <a
                      class="dropdown-item"
                      @click.prevent="selectPasswordType('passwordLess')"
                      >Password less</a
                    >
                  </li>
                </ul>

                <input
                  id="editAccount_input_password"
                  class="form-control"
                  type="text"
                  autocomplete="new-password"
                  aria-describedby="editAccount_input_passwordHelp"
                  v-model="account.password"
                  @keyup.enter="save()"
                  v-if="!account.is_password_less"
                />
                <button
                  class="btn btn-outline-light"
                  type="button"
                  @click="account.generatePassword()"
                  v-if="!account.is_password_less && !account.password"
                >
                  <i class="fa fa-cogs"></i> Generate
                </button>

                <input
                  id="editAccount_input_passwordless_masterPassword"
                  class="form-control"
                  type="password"
                  placeholder="Master password"
                  autocomplete="current-password"
                  aria-describedby="editAccount_input_passwordlessHelp_masterPassword"
                  v-model="passwordLess.masterPassword"
                  v-if="
                    account.is_password_less && !passwordLess.generatedPassword
                  "
                />
                <button
                  class="btn btn-outline-light"
                  type="button"
                  @click="generatePasswordLess()"
                  v-if="
                    account.is_password_less && !passwordLess.generatedPassword
                  "
                >
                  <i class="fa fa-cogs"></i> Generate
                </button>

                <input
                  id="editAccount_input_passwordless_generatedPassword"
                  class="form-control"
                  type="text"
                  v-model="passwordLess.generatedPassword"
                  v-if="
                    account.is_password_less && passwordLess.generatedPassword
                  "
                  readonly
                />
                <button
                  class="btn btn-outline-light"
                  type="button"
                  @click="resetPasswordLess()"
                  v-if="
                    account.is_password_less && passwordLess.generatedPassword
                  "
                >
                  <i class="fa fa-undo"></i> Reset
                </button>
              </div>

              <small
                id="editAccount_input_passwordHelp"
                class="form-text text-muted"
                v-show="
                  fieldAttrs.password.isExpanded &&
                  !account.is_password_less &&
                  !account.password
                "
              >
                Click button to generate password.
              </small>
              <small
                id="editAccount_input_passwordlessHelp_masterPassword"
                class="form-text text-muted"
                v-show="
                  fieldAttrs.password.isExpanded &&
                  account.is_password_less &&
                  !passwordLess.generatedPassword
                "
              >
                Type your master password to generate the password less.
              </small>

              <!-- <div class="row" v-show="fieldAttrs.password.isExpanded && account.is_password_less && !passwordLess.generatedPassword">
                            <div class="col">
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault">
                                    <label class="form-check-label" for="flexSwitchCheckDefault">a-z</label>
                                </div>
                            </div>
                            <div class="col">
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault">
                                    <label class="form-check-label" for="flexSwitchCheckDefault">A-Z</label>
                                </div>
                            </div>
                            <div class="col">
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault">
                                    <label class="form-check-label" for="flexSwitchCheckDefault">0-9</label>
                                </div>
                            </div>
                        </div>
                        <div class="row" v-show="fieldAttrs.password.isExpanded && account.is_password_less && !passwordLess.generatedPassword">
                            <div class="col">
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckDefault">
                                    <label class="form-check-label" for="flexSwitchCheckDefault">%!@</label>
                                </div>
                            </div>
                            <div class="col">
                                <div class="input-group mb-3">
                                    <button class="btn btn-outline-secondary" type="button" id="button-addon1">-</button>
                                    <input id="tatata" type="text" class="form-control" placeholder="" aria-label="Example text with button addon" aria-describedby="button-addon1">
                                    <button class="btn btn-outline-secondary" type="button" id="button-addon1">+</button>
                                </div>
                            </div>
                            <div class="col">
                                <div class="input-group mb-3">
                                    <button class="btn btn-outline-secondary" type="button" id="button-addon1">-</button>
                                    <input id="tatata" type="text" class="form-control" placeholder="" aria-label="Example text with button addon" aria-describedby="button-addon1">
                                    <button class="btn btn-outline-secondary" type="button" id="button-addon1">+</button>
                                </div>
                            </div>
                        </div> -->
            </div>

            <div
              v-show="fieldAttrs.password.isExpanded"
              class="mb-3 col-xs-12 col-md-12 col-lg-12"
              v-if="account.type == 'account'"
            >
              <label class="form-label" for="editAccount_input_password_clue">
                <i class="fa fa-eye" aria-hidden="true"></i>
                {{
                  account.is_password_less
                    ? "Master password clue"
                    : "Password clue"
                }}
              </label>
              <input
                id="editAccount_input_password_clue"
                class="form-control"
                type="text"
                v-model="account.password_clue"
                @keyup.enter="save()"
              />
            </div>

            <div
              v-show="fieldAttrs.password.isExpanded"
              class="mb-3 col-xs-12 col-md-12 col-lg-12"
              v-if="account.type == 'account'"
            >
              <label class="form-label" for="editAccount_input_social_login"
                ><i class="fa fa-users" aria-hidden="true"></i> Social
                login</label
              >
              <input
                id="editAccount_input_social_login"
                class="form-control"
                type="text"
                v-model="account.social_login"
                @keyup.enter="save()"
              />
            </div>

            <hr class="my-4" />

            <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
              <label
                v-show="!fieldAttrs.platform.isExpanded"
                @click="
                  fieldAttrs.platform.isExpanded =
                    !fieldAttrs.platform.isExpanded
                "
                class="form-label"
                for="editAccount_input_platform"
              >
                <i class="fa fa-globe" aria-hidden="true"></i>
                {{ account.platform }}
                <i class="fa fa-chevron-down float-end" aria-hidden="true"></i>
              </label>
              <label
                v-show="fieldAttrs.platform.isExpanded"
                @click="
                  fieldAttrs.platform.isExpanded =
                    !fieldAttrs.platform.isExpanded
                "
                class="form-label"
                for="editAccount_input_platform"
              >
                <i class="fa fa-globe" aria-hidden="true"></i> Platform
                <i class="fa fa-chevron-up float-end" aria-hidden="true"></i>
              </label>
              <div v-show="fieldAttrs.platform.isExpanded" class="input-group">
                <button
                  class="btn btn-outline-light"
                  type="button"
                  @click="copyToClipboard('editAccount_input_platform_hidden')"
                >
                  <i class="fa fa-clipboard"></i>
                </button>
                <input
                  id="editAccount_input_platform"
                  class="form-control"
                  placeholder="Platform"
                  type="text"
                  v-model="account.platform"
                  autofocus
                />
              </div>
              <input
                v-show="fieldAttrs.platform.isExpanded"
                id="editAccount_input_platform_hidden"
                type="hidden"
                :value="account.platform"
              />
            </div>

            <div
              v-show="fieldAttrs.platform.isExpanded"
              class="mb-3 col-xs-12 col-md-12"
              :class="account.type == 'account' ? 'col-lg-12' : 'col-lg-12'"
            >
              <label class="form-label" for="editAccount_input_icon"
                ><i class="fa fa-icons" aria-hidden="true"></i> Icon</label
              >
              <input
                id="editAccount_input_icon"
                class="form-control"
                placeholder="Icon URL"
                type="text"
                v-model="account.icon"
                @keyup.enter="save()"
              />
            </div>

            <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
              <label
                v-show="!fieldAttrs.tags.isExpanded"
                @click="
                  fieldAttrs.tags.isExpanded = !fieldAttrs.tags.isExpanded
                "
                class="form-label tags"
                for="editAccount_input_new_tag"
              >
                <i class="fa fa-tags" aria-hidden="true"></i>
                <span
                  class="badge rounded-pill badge-primary"
                  v-for="tag in account.tags.split(',')"
                  v-show="account.tags"
                  v-bind:key="tag"
                >
                  {{ tag }}
                </span>
                <i class="fa fa-chevron-down float-end" aria-hidden="true"></i>
              </label>
              <label
                v-show="fieldAttrs.tags.isExpanded"
                @click="
                  fieldAttrs.tags.isExpanded = !fieldAttrs.tags.isExpanded
                "
                class="form-label"
                for="editAccount_input_new_tag"
              >
                <i class="fa fa-tags" aria-hidden="true"></i> Tags
                <i class="fa fa-chevron-up float-end" aria-hidden="true"></i>
              </label>
              <div
                v-show="fieldAttrs.tags.isExpanded"
                class="form-control tags tags-input"
                @click="focusTagInput()"
              >
                <span
                  class="badge rounded-pill badge-primary"
                  v-for="(tag, tagIndex) in account.tags.split(',')"
                  v-bind:key="tagIndex"
                  @click="removeTag(tagIndex)"
                >
                  {{ tag }}
                  <i class="fa fa-close" v-if="tag"></i>
                </span>
              </div>

              <input
                v-show="fieldAttrs.tags.isExpanded"
                ref="tags"
                id="editAccount_input_new_tag"
                class="form-control tags-new-input"
                placeholder="Enter new tag"
                type="text"
                @keyup.enter="addTag()"
                v-model="newTag"
              />
            </div>

            <hr class="my-4" />

            <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
              <label class="form-label" for="editAccount_input_description"
                ><i class="fa fa-message" aria-hidden="true"></i>
                Description</label
              >
              <textarea
                id="editAccount_input_description"
                class="form-control"
                type="text"
                v-model="account.description"
                rows="3"
              ></textarea>
            </div>

            <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
              <label class="form-label" for="editAccount_input_notes"
                ><i class="fa fa-marker" aria-hidden="true"></i> Notes</label
              >
              <textarea
                id="editAccount_input_notes"
                class="form-control"
                type="text"
                v-model="account.notes"
                rows="6"
              ></textarea>
            </div>

            <hr class="my-4" />

            <div class="mb-3 col-4 col-xs-4 col-sm-4 col-md-4 col-lg-4 small">
              <label class="form-label" for="createdDate">
                <i class="fa fa-clock" aria-hidden="true"></i> Created
              </label>
              <input
                type="text"
                readonly
                class="form-control-plaintext"
                id="createdDate"
                :value="createdDate"
              />
            </div>
            <div class="mb-3 col-4 col-xs-4 col-sm-4 col-md-4 col-lg-4 small">
              <label class="form-label" for="lastModifiedDate">
                <i class="fa fa-clock" aria-hidden="true"></i> Modified
              </label>
              <input
                type="text"
                readonly
                class="form-control-plaintext"
                id="lastModifiedDate"
                :value="lastModifiedDate"
              />
            </div>
            <div class="mb-3 col-4 col-xs-4 col-sm-4 col-md-4 col-lg-4 small">
              <label class="form-label" for="lastOpenedDate">
                <i class="fa fa-clock" aria-hidden="true"></i> Opened
              </label>
              <input
                type="text"
                readonly
                class="form-control-plaintext"
                id="lastOpenedDate"
                :value="lastOpenedDate"
              />
            </div>
          </div>

        <hr class="my-4" />

          <div class="row footer">
            <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
            <button
              class="btn btn-light"
              :class="isSaving ? 'btn-dark' : 'btn-light'"
              type="button"
              @click="save()"
            >
              <i class="fa fa-floppy-disk"></i>
              {{ isSaving ? "Saving ..." : "Save" }}
            </button>
          </div>

          <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
            <button
              type="button"
              class="btn btn-red"
              :class="isDeleting ? 'btn-dark' : 'btn-red'"
              @click="remove()"
            >
              <i class="fa fa-trash"></i>
              {{ isDeleting ? "Deleting ..." : "Delete" }}
            </button>
          </div>
            </div>
      </div>
    </div>
  </div>
</template>

<script>
import "../assets/right_sidebar.css";
import "../assets/bottom_sheet.css";

import { mapState, mapActions } from "pinia";
import { useUiStore, useAlertStore, useAccountsStore } from "@/store";
import totpGenerator from "totp-generator";

function initialState() {
  return {
    isSaving: false,
    isDeleting: false,
    newTag: "",
    showPasswordTypeOptions: false,
    isSmallHeader: false,
    passwordLess: {
      masterPassword: "",
      generatedPassword: "",
    },
    fieldAttrs: {
      login: {
        isExpanded: false,
      },
      password: {
        isExpanded: false,
      },
      password_clue: {
        isExpanded: false,
      },
      passwordless: {
        isExpanded: false,
      },
      social_login: {
        isExpanded: false,
      },
      platform: {
        isExpanded: false,
      },
      tags: {
        isExpanded: false,
      },
      icon: {
        isExpanded: false,
      },
      description: {
        isExpanded: false,
      },
      notes: {
        isExpanded: false,
      },
      totpToken: {
        isExpanded: false,
      },
      card_number: {
        isExpanded: false,
      },
      card_pin: {
        isExpanded: false,
      },
      card_expiracy: {
        isExpanded: false,
      },
      card_cryptogram: {
        isExpanded: false,
      },
      card_name: {
        isExpanded: false,
      },
    },
  };
}

export default {
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  data: function () {
    return initialState();
  },
  mounted() {
    this.initBottomSheet("edit-account-bottom-sheet");
  },
  computed: {
    ...mapState(useUiStore, {
      account: "currentEditingAccount",
      SIDEBAR: "SIDEBAR",
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
        return totpGenerator(this.account.totp_secret.replace(/ /g, ""));
      }

      return "Please fill the secret key";
    },
  },
  methods: {
    ...mapActions(useAccountsStore, ["updateAccount", "removeAccount"]),
    ...mapActions(useUiStore, [
      "closeSidebar",
      "resetCurrentEditingAccount",
      "initBottomSheet",
    ]),
    ...mapActions(useAlertStore, ["openAlert"]),

    scrollFunction: function (e) {
      this.isSmallHeader = e.target.scrollTop > 20;
    },

    selectPasswordType: function (passwordType) {
      this.account.is_password_less = passwordType === "passwordLess";
      this.showPasswordTypeOptions = false;
    },

    save: async function () {
      if (!this.account.isValid()) {
        this.openAlert("Error", "Please fill all fields !", "danger");
        return;
      }

      this.isSaving = true;

      try {
        await this.updateAccount(this.account);

        this.openAlert(
          this.account.displayPlatform,
          "Updated !",
          "success",
          this.account.icon
        );

        this.isSaving = false;
        this.isDeleting = false;

        this.closeAccountEditing();
      } catch (error) {
        this.openAlert("Error", error.toString(), "danger");
        this.isSaving = false;
      }
    },

    generatePasswordLess: function () {
      this.account
        .generatePasswordLess(this.passwordLess.masterPassword)
        .then((generatedPassword) => {
          this.passwordLess.generatedPassword = generatedPassword;
        });
    },

    resetPasswordLess: function () {
      this.passwordLess.generatedPassword = "";
    },

    remove: async function () {
      if (
        confirm(
          `Are you sure to delete : ${this.account.displayPlatform} ?`
        ) === true
      ) {
        this.isDeleting = true;

        try {
          await this.removeAccount(this.account);

          this.openAlert(this.account.displayPlatform, "Removed !", "success");

          this.isSaving = false;
          this.isDeleting = false;

          this.closeAccountEditing();
        } catch (error) {
          this.openAlert("Error", error.toString(), "danger");
          this.isDeleting = false;
        }
      }
    },

    focusTagInput: function () {
      this.$refs.tags.focus();
    },

    addTag: function () {
      this.account.tags += "," + this.newTag;
      this.newTag = "";
    },

    removeTag: function (index) {
      let newTags = this.account.tags.split(",").map((t) => t.trim());
      newTags.splice(index, 1);
      this.account.tags = newTags.join(",");
    },

    copyToClipboard: function (input) {
      let inputToCopy = document.querySelector("#" + input);
      inputToCopy.setAttribute("type", "text");
      inputToCopy.select();

      document.execCommand("copy");

      /* unselect the range */
      inputToCopy.setAttribute("type", "hidden");
      window.getSelection().removeAllRanges();

      this.openAlert(inputToCopy.value, "Copied to clipboard !", "info");
    },

    formatDate: function (date) {
      return (
        date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear()
      );
    },

    closeAccountEditing: function () {
      this.closeSidebar(this.SIDEBAR.EDIT_ACCOUNT);
      this.resetCurrentEditingAccount();

      // reset this component's state
      Object.assign(this.$data, initialState());
    },
  },
};
</script>

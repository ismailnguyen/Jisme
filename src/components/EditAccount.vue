<template>
  <div
    id="edit-account-bottom-sheet"
    class="bottom-sheet"
    :class="visible ? 'show' : ''"
  >
    <div class="sheet-overlay" @click="closeAccountEditing()"></div>
    <div class="content">
      <div class="header row" :class="account.icon ? 'hasIcon' : ''" :style="{ 'background-image': 'url(' + account.icon + ')' }">
        <div class="drag-icon row justify-content-center"><span></span></div>

        <div class="row justify-content-center">
          <div class="col text-center">
            <img
              :src="account.icon"
              loading="lazy"
              :alt="account.displayPlatform"
              :title="account.displayPlatform"
              class="bottom-sheet-large-icon"
            />
          </div>
        </div>
        <div class="row justify-content-center">
          <div class="col-12 text-center">
            <h2 class="bottom-sheet-title" :title="account._id">
              {{ account.displayPlatform }}
            </h2>
          </div>
        </div>
      </div>
      <div class="body">
        <div class="row">

            <!-- region_start -- Account type: card -->
            <div class="accordion" v-if="account.type == 'card'">
              
              <div class="accordion-item">
                <h2 class="accordion-header">
                  <button
                    class="accordion-button" :class="fieldAttrs.card_number.isExpanded ? '' : 'collapsed'"
                    type="button"
                    @click="fieldAttrs.card_number.isExpanded = !fieldAttrs.card_number.isExpanded">
                    <div>
                      <div class="fw-medium">
                        <i class="fa fa-barcode" aria-hidden="true"></i>
                        Number
                      </div>
                      <span class="fw-lighter" v-show="!fieldAttrs.card_number.isExpanded">
                        {{ account.card_number }}
                      </span>
                    </div>
                  </button>
                </h2>
                <div class="accordion-collapse" :class="fieldAttrs.card_number.isExpanded ? 'show' : 'collapse'">
                  <div class="accordion-body">
                    <input
                      class="form-control"
                      placeholder="Card number"
                      type="text"
                      v-model="account.card_number"
                    />
                  </div>
                </div>
              </div>

              <div class="accordion-item">
                <h2 class="accordion-header">
                  <button
                    class="accordion-button" :class="fieldAttrs.card_name.isExpanded ? '' : 'collapsed'"
                    type="button"
                    @click="fieldAttrs.card_number.isExpanded = !fieldAttrs.card_name.isExpanded">
                    <div>
                      <div class="fw-medium">
                        <i class="fa fa-user" aria-hidden="true"></i>
                        Name
                      </div>
                      <span class="fw-lighter" v-show="!fieldAttrs.card_name.isExpanded">
                        {{ account.card_name }}
                      </span>
                    </div>
                  </button>
                </h2>
                <div class="accordion-collapse" :class="fieldAttrs.card_name.isExpanded ? 'show' : 'collapse'">
                  <div class="accordion-body">
                    <input
                      class="form-control"
                      placeholder="Name on card (e.g. M Gandhi)"
                      type="text"
                      v-model="account.card_name"
                    />
                  </div>
                </div>
              </div>

              <div class="accordion-item">
                <h2 class="accordion-header">
                  <button
                    class="accordion-button" :class="fieldAttrs.card_pin.isExpanded ? '' : 'collapsed'"
                    type="button"
                    @click="fieldAttrs.card_pin.isExpanded = !fieldAttrs.card_pin.isExpanded">
                    <div>
                      <div class="fw-medium">
                        <i class="fa fa-key" aria-hidden="true"></i>
                        PIN
                      </div>
                      <span class="fw-lighter" v-show="!fieldAttrs.card_pin.isExpanded">
                        {{ account.card_pin }}
                      </span>
                    </div>
                  </button>
                </h2>
                <div class="accordion-collapse" :class="fieldAttrs.card_pin.isExpanded ? 'show' : 'collapse'">
                  <div class="accordion-body">
                    <input
                      class="form-control"
                      placeholder="PIN (e.g. 3252)"
                      type="text"
                      v-model="account.card_pin"
                    />
                  </div>
                </div>
              </div>

              <div class="accordion-item">
                <h2 class="accordion-header">
                  <button
                    class="accordion-button" :class="fieldAttrs.card_expiracy.isExpanded ? '' : 'collapsed'"
                    type="button"
                    @click="fieldAttrs.card_expiracy.isExpanded = !fieldAttrs.card_expiracy.isExpanded">
                    <div>
                      <div class="fw-medium">
                        <i class="fa fa-calendar" aria-hidden="true"></i>
                        Expiracy
                      </div>
                      <span class="fw-lighter" v-show="!fieldAttrs.card_expiracy.isExpanded">
                        {{ account.card_expiracy }}
                      </span>
                    </div>
                  </button>
                </h2>
                <div class="accordion-collapse" :class="fieldAttrs.card_expiracy.isExpanded ? 'show' : 'collapse'">
                  <div class="accordion-body">
                    <input
                      class="form-control"
                      placeholder="Expiracy (e.g. 01/32)"
                      type="text"
                      v-model="account.card_expiracy"
                    />
                  </div>
                </div>
              </div>

              <div class="accordion-item">
                <h2 class="accordion-header">
                  <button
                    class="accordion-button" :class="fieldAttrs.card_cryptogram.isExpanded ? '' : 'collapsed'"
                    type="button"
                    @click="fieldAttrs.card_cryptogram.isExpanded = !fieldAttrs.card_cryptogram.isExpanded">
                    <div>
                      <div class="fw-medium">
                        <i class="fa fa-lock" aria-hidden="true"></i>
                        Cryptogram (CVV/CVC)
                      </div>
                      <span class="fw-lighter" v-show="!fieldAttrs.card_cryptogram.isExpanded">
                        {{ account.card_cryptogram }}
                      </span>
                    </div>
                  </button>
                </h2>
                <div class="accordion-collapse" :class="fieldAttrs.card_cryptogram.isExpanded ? 'show' : 'collapse'">
                  <div class="accordion-body">
                    <input
                      class="form-control"
                      placeholder="Cryptogram (CVV/CVC)"
                      type="text"
                      v-model="account.card_cryptogram"
                    />
                  </div>
                </div>
              </div>

            </div>

            <div class="accordion">
              <div class="accordion-item" v-if="account.type == 'account' || account.type == '2fa'">
                <h2 class="accordion-header ">
                  <button
                    class="accordion-button" :class="fieldAttrs.login.isExpanded ? '' : 'collapsed'"
                    type="button"
                    @click="fieldAttrs.login.isExpanded = !fieldAttrs.login.isExpanded">
                    <div>
                      <div class="fw-medium">
                        <i class="fa fa-id-badge" aria-hidden="true"></i>
                        Login
                      </div>
                      <span class="fw-lighter" v-show="!fieldAttrs.login.isExpanded">
                        {{ account.login }}
                      </span>
                    </div>
                  </button>
                </h2>
                <div class="accordion-collapse" :class="fieldAttrs.login.isExpanded ? 'show' : 'collapse'">
                  <div class="accordion-body">
                    <div class="input-group">
                      <button
                        class="btn btn-outline-secondary"
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
                      />
                    </div>
                    <input
                      id="editAccount_input_login_hidden"
                      type="hidden"
                      :value="account.login"
                    />
                  </div>
                </div>
              </div>

              <div class="accordion-item" v-if="account.type == 'account'">
                <h2 class="accordion-header">
                  <button
                    class="accordion-button" :class="fieldAttrs.password.isExpanded ? '' : 'collapsed'"
                    type="button"
                    @click="fieldAttrs.password.isExpanded = !fieldAttrs.password.isExpanded">
                    <div>
                      <div class="fw-medium">
                        <i class="fa fa-lock" aria-hidden="true"></i>
                        Password
                      </div>
                      <span class="fw-lighter" v-show="!fieldAttrs.password.isExpanded">
                        {{
                          account.password ||
                          account.password_clue ||
                          (account.social_login ? "" : "Password")
                        }}
                        <div
                          class="badge rounded-pill badge-red"
                          v-for="socialLogin in account.social_login.split(',')"
                          v-show="account.social_login"
                          v-bind:key="socialLogin"
                        >
                          {{ socialLogin }}
                        </div>
                      </span>
                    </div>
                  </button>
                </h2>
                <div class="accordion-collapse" :class="fieldAttrs.password.isExpanded ? 'show' : 'collapse'">
                  <div class="accordion-body">
                    <div class="btn-group" role="group" aria-label="Password type">
                      <input
                        type="radio"
                        class="btn-check"
                        name="password-type"
                        id="addAccount_radiobutton_passwordtype_passwordless"
                        v-model="account.is_password_less"
                        v-bind:value="true"
                      />
                      <label
                        class="btn"
                        for="addAccount_radiobutton_passwordtype_passwordless"
                        :class="account.is_password_less ? 'active' : ''"
                      >
                        <i class="fa fa-bolt" aria-hidden="true"></i>
                        Password less
                      </label>
                      
                      <input
                        type="radio"
                        class="btn-check"
                        name="password-type"
                        id="addAccount_radiobutton_passwordtype_password"
                        v-model="account.is_password_less"
                        v-bind:value="false"
                      />
                      <label
                        class="btn"
                        for="addAccount_radiobutton_passwordtype_password"
                        :class="!account.is_password_less ? 'active' : ''"
                      >
                        <i class="fa fa-lock" aria-hidden="true"></i>
                        Password
                      </label>
                    </div>

                    <hr class="my-4" />

                    <div class="input-group mb-3">
                      <input
                        id="editAccount_input_password"
                        class="form-control"
                        type="text"
                        autocomplete="new-password"
                        aria-describedby="editAccount_input_passwordHelp"
                        v-model="account.password"
                        v-if="!account.is_password_less"
                      />
                      <button
                        class="btn btn-outline-secondary"
                        type="button"
                        @click="account.generatePassword()"
                        v-if="!account.is_password_less && !account.password"
                      >
                        <i class="fa fa-cogs"></i> Suggest
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
                        class="btn btn-outline-secondary"
                        type="button"
                        @click="generatePasswordLess()"
                        v-if="
                          account.is_password_less && !passwordLess.generatedPassword
                        "
                      >
                        <i class="fa fa-eye"></i> Reveal
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
                        class="btn btn-outline-secondary"
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
                        !account.is_password_less &&
                        !account.password
                      "
                    >
                      Click button to suggest a password.
                    </small>
                    <small
                      id="editAccount_input_passwordlessHelp_masterPassword"
                      class="form-text text-muted"
                      v-show="
                        account.is_password_less &&
                        !passwordLess.generatedPassword
                      "
                    >
                      Type your master password to reveal the password.
                    </small>
                    
                    <hr class="my-4" />

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
                    />

                    <hr class="my-4" />

                    <label class="form-label" for="editAccount_input_social_login"
                      ><i class="fa fa-users" aria-hidden="true"></i> Social login</label
                    >
                    <input
                      id="editAccount_input_social_login"
                      class="form-control"
                      type="text"
                      v-model="account.social_login"
                    />
                  </div>
                </div>
              </div>

              <div class="accordion-item">
                <h2 class="accordion-header ">
                  <button
                    class="accordion-button" :class="fieldAttrs.totpToken.isExpanded ? '' : 'collapsed'"
                    type="button"
                    @click="fieldAttrs.totpToken.isExpanded = !fieldAttrs.totpToken.isExpanded">
                    <div>
                      <div class="fw-medium">
                        <i class="fa fa-qrcode" aria-hidden="true"></i>
                        Verification code
                      </div>
                      <span class="fw-lighter" v-show="!fieldAttrs.totpToken.isExpanded">
                        {{ totpToken }}
                      </span>
                    </div>
                  </button>
                </h2>
                <div class="accordion-collapse" :class="fieldAttrs.totpToken.isExpanded ? 'show' : 'collapse'">
                  <div class="accordion-body">
                    <div class="input-group" v-show="account.totp_secret">
                      <button
                        class="btn btn-outline-secondary"
                        type="button"
                        @click="copyToClipboard('editAccount_input_totp_token_hidden')"
                      >
                        <i class="fa fa-clipboard"></i>
                      </button>
                      <input
                        class="form-control"
                        placeholder="Generated token"
                        type="text"
                        v-model="totpToken"
                        readonly
                      />
                    </div>
                    <input
                      id="editAccount_input_totp_token_hidden"
                      type="hidden"
                      :value="totpToken"
                    />

                    <hr class="my-4" v-show="account.totp_secret" />

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
                </div>
              </div>
            </div>

            <div class="accordion">
              <div class="accordion-item">
                <h2 class="accordion-header ">
                  <button
                    class="accordion-button" :class="fieldAttrs.platform.isExpanded ? '' : 'collapsed'"
                    type="button"
                    @click="fieldAttrs.platform.isExpanded = !fieldAttrs.platform.isExpanded">
                    <div>
                      <div class="fw-medium">
                        <i class="fa fa-globe" aria-hidden="true"></i>
                        Platform
                      </div>
                      <span class="fw-lighter" v-show="!fieldAttrs.platform.isExpanded">
                        {{ account.platform }}
                      </span>
                    </div>
                  </button>
                </h2>
                <div class="accordion-collapse" :class="fieldAttrs.platform.isExpanded ? 'show' : 'collapse'">
                  <div class="accordion-body">
                    <div class="input-group">
                      <button
                        class="btn btn-outline-secondary"
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
                      />
                    </div>
                    <input
                      id="editAccount_input_platform_hidden"
                      type="hidden"
                      :value="account.platform"
                    />

                    <hr class="my-4" />

                    <label class="form-label" for="editAccount_input_icon"
                      ><i class="fa fa-icons" aria-hidden="true"></i> Icon</label
                    >
                    <input
                      id="editAccount_input_icon"
                      class="form-control"
                      placeholder="Icon URL"
                      type="text"
                      v-model="account.icon"
                    />

                  </div>
                </div>
              </div>

              <div class="accordion-item">
                <h2 class="accordion-header ">
                  <button
                    class="accordion-button" :class="fieldAttrs.tags.isExpanded ? '' : 'collapsed'"
                    type="button"
                    @click="fieldAttrs.tags.isExpanded = !fieldAttrs.tags.isExpanded">
                    <div>
                      <div class="fw-medium">
                        <i class="fa fa-tags" aria-hidden="true"></i>
                        Tags
                      </div>
                      <span class="fw-lighter" v-show="!fieldAttrs.tags.isExpanded">
                        {{ account.tags.split(',').join(', ') }}
                      </span>
                    </div>
                  </button>
                </h2>
                <div class="accordion-collapse" :class="fieldAttrs.tags.isExpanded ? 'show' : 'collapse'">
                  <div class="accordion-body">
                    <div
                      class="form-control tags tags-input"
                      @click="focusTagInput()"
                    >
                      <span
                        class="badge rounded-pill"
                        v-for="(tag, tagIndex) in account.tags.split(',')"
                        v-bind:key="tagIndex"
                        @click="removeTag(tagIndex)"
                      >
                        {{ tag }}
                        <i class="fa fa-close" v-if="tag"></i>
                      </span>
                    </div>

                    <input
                      ref="tags"
                      class="form-control tags-new-input"
                      placeholder="Enter new tag"
                      type="text"
                      @keyup.enter="addTag()"
                      v-model="newTag"
                    />

                  </div>
                </div>
              </div>
            </div>

            <div class="accordion">
              <div class="accordion-item">
                <div class="accordion-collapse show">
                  <div class="accordion-body text-center">
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
                </div>
              </div>
            </div>

            <div class="accordion">
              <div class="accordion-item">
                <h2 class="accordion-header ">
                  <button
                    class="accordion-button" :class="fieldAttrs.description.description ? '' : 'collapsed'"
                    type="button"
                    @click="fieldAttrs.description.isExpanded = !fieldAttrs.description.isExpanded">
                    <div>
                      <div class="fw-medium">
                        <i class="fa fa-message" aria-hidden="true"></i>
                        Description
                      </div>
                      <span class="fw-lighter" v-show="!fieldAttrs.description.isExpanded">
                        {{ shortDescription }}
                      </span>
                    </div>
                  </button>
                </h2>
                <div class="accordion-collapse" :class="fieldAttrs.description.isExpanded ? 'show' : 'collapse'">
                  <div class="accordion-body">
                    <textarea
                      class="form-control"
                      type="text"
                      v-model="account.description"
                      rows="3"
                    ></textarea>
                  </div>
                </div>
              </div>

               <div class="accordion-item">
                <h2 class="accordion-header ">
                  <button
                    class="accordion-button" :class="fieldAttrs.notes.notes ? '' : 'collapsed'"
                    type="button"
                    @click="fieldAttrs.notes.isExpanded = !fieldAttrs.notes.isExpanded">
                    <div>
                      <div class="fw-medium">
                        <i class="fa fa-marker" aria-hidden="true"></i>
                        Notes
                      </div>
                      <span class="fw-lighter" v-show="!fieldAttrs.notes.isExpanded">
                        {{ shortNotes }}
                      </span>
                    </div>
                  </button>
                </h2>
                <div class="accordion-collapse" :class="fieldAttrs.notes.isExpanded ? 'show' : 'collapse'">
                  <div class="accordion-body">
                    <textarea
                      class="form-control"
                      type="text"
                      v-model="account.notes"
                      rows="6"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            <div class="accordion">
              <div class="accordion-item accordion-item--without-body">
                <h2 class="accordion-header ">
                  <button
                    class="accordion-button"
                    type="button">
                    <div>
                      <div class="fw-medium">
                        <i class="fa fa-clock" aria-hidden="true"></i>
                        Created
                      </div>
                      <span class="fw-lighter">
                        {{ createdDate }}
                      </span>
                    </div>
                  </button>
                </h2>
              </div>

              <div class="accordion-item accordion-item--without-body">
                <h2 class="accordion-header">
                  <button
                    class="accordion-button"
                    type="button">
                    <div>
                      <div class="fw-medium">
                        <i class="fa fa-clock" aria-hidden="true"></i>
                        Modified
                      </div>
                      <span class="fw-lighter">
                        {{ lastModifiedDate }}
                      </span>
                    </div>
                  </button>
                </h2>
              </div>

              <div class="accordion-item accordion-item--without-body">
                <h2 class="accordion-header ">
                  <button
                    class="accordion-button"
                    type="button">
                    <div>
                      <div class="fw-medium">
                        <i class="fa fa-clock" aria-hidden="true"></i>
                        Opened
                      </div>
                      <span class="fw-lighter">
                        {{ lastOpenedDate }}
                      </span>
                    </div>
                  </button>
                </h2>
              </div>
            </div>
            

              <!-- 
                
                Passwordless configs
              
              <div class="row" v-show="fieldAttrs.password.isExpanded && account.is_password_less && !passwordLess.generatedPassword">
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

        <div class="row footer">
          <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
            <button
              class="btn btn-action btn-cta"
              :class="isSaving ? 'btn-dark' : 'btn-light'"
              type="button"
              @click="save()"
            >
              <i class="fa fa-floppy-disk"></i>
              {{ isSaving ? 'Updating ...' : 'Update' }}
            </button>
          </div>

          <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
            <button
              type="button"
              class="btn btn-action"
              :class="isDeleting ? 'btn-dark' : 'btn-red'"
              @click="remove()"
            >
              <i class="fa fa-trash"></i>
              {{ isDeleting ? "Removing ..." : "Don't need it anymore" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import "../assets/bottom_sheet.css";

import { mapState, mapActions } from "pinia";
import { useUiStore, useAlertStore, useAccountsStore } from "@/store";
import totpGenerator from "totp-generator";
  import { truncateString } from '../utils/textFormat'


function initialState() {
  return {
    isSaving: false,
    isDeleting: false,
    newTag: "",
    isSmallHeader: false,
    passwordLess: {
      masterPassword: "",
      generatedPassword: "",
    },
    fieldAttrs: {
      type: {
        isExpanded: false,
      },
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

    accountTypeToDisplay: function () {
      switch (this.account.type) {
        case "card":
          return "Card";
        case "2fa":
          return "2FA";
        default:
          return "Account";
      }
    },

    showPasswordTypeOptions: function () {
      return this.account.is_password_less;
    },

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

      return "Not setup";
    },

    shortDescription: function () {
        if (this.account.description && this.account.description.length > 15) {
            return truncateString(this.account.description, 15)
        }

        return this.account.description;
    },

    shortNotes: function () {
        if (this.account.notes && this.account.notes.length > 15) {
            return truncateString(this.account.notes, 15)
        }

        return this.account.notes;
    }
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

<template>
  <div
    id="edit-account-bottom-sheet"
    class="bottom-sheet"
    :class="visible ? 'show' : ''"
  >
    <div class="sheet-overlay" @click="closeAccountEditing"></div>
    <div class="content">
      <div class="header row" :class="account.icon ? 'hasIcon' : ''">
        <div class="drag-icon row justify-content-center"><span></span></div>

        <div class="row justify-content-center">
          <div class="col text-center">
            <img
              :src="account.icon"
              loading="lazy"
              :alt="account.label"
              :title="account.label"
              class="bottom-sheet-large-icon"
            />
          </div>
        </div>
        <div class="row justify-content-center">
          <div class="col-12 text-center">
            <h2 class="bottom-sheet-title" :title="account._id">
              {{ account.label }}
            </h2>
          </div>
        </div>
      </div>
      <div class="body">
        <form class="row">

            <!-- region_start -- Account type: card -->
            <div class="accordion" v-if="account.type == 'card' && (account.subtype == 'loyalty' || account.subtype == 'gift')"> 
              <div class="accordion-item accordion-item--without-body">
                <h1 class="accordion-header text-center">
                  <QrcodeVue
                    v-if="account.card_format == 'qrcode'"
                    :value="account.rawCardNumber"
                    @click="fullscreenBarcodeVisible = true"
                    class="clickable"/>
                  
                  <img
                    v-if="account.card_format == 'barcode'"
                    ref="barcodeEl"
                    id="barcodeEl"
                    @click="fullscreenBarcodeVisible = true"
                    class="clickable"/>

                    <FullscreenBarcode
                      :visible="fullscreenBarcodeVisible"
                      :number="account.rawCardNumber"
                      :format="barcodeFormat"
                      @close="fullscreenBarcodeVisible = false"
                    />
                </h1>
              </div>
            </div>

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
                    <div class="input-group">
                      <button
                        class="btn btn-light"
                        type="button"
                        @click="copyToClipboard('editAccount_input_card_number_hidden')"
                      >
                        <i class="fa fa-clipboard"></i>
                      </button>
                      <input
                        class="form-control"
                        placeholder="Card number"
                        type="text"
                        v-model="account.card_number"
                      />
                    </div>
                    <input
                      id="editAccount_input_card_number_hidden"
                      type="hidden"
                      :value="account.card_number"
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

              <div class="accordion-item" v-if="account.subtype == 'payment' || account.subtype == 'gift'">
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

              <div class="accordion-item" v-if="account.subtype == 'payment'">
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

              <div class="accordion-item">
                <h2 class="accordion-header">
                  <button
                    class="accordion-button" :class="fieldAttrs.card_name.isExpanded ? '' : 'collapsed'"
                    type="button"
                    @click="fieldAttrs.card_name.isExpanded = !fieldAttrs.card_name.isExpanded">
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
            </div>
            
            <!-- region_start -- Card formats -->
            <div class="accordion" v-if="account.type == 'card' && (account.subtype == 'loyalty' || account.subtype == 'gift')">
              <div
                class="accordion-item"
                :class="account.card_format == 'qrcode' ? 'is-active' : 'accordion-item--without-body'">
                <h2 class="accordion-header">
                  <button
                    class="accordion-button collapsed"
                    @click="account.card_format = 'qrcode'"
                    type="button">
                    <div>
                      <span :class="account.card_format == 'qrcode' ? 'fw-medium' : 'fw-lighter'">
                        QR Code
                      </span>
                    </div>
                  </button>
                </h2>
              </div>

              <div
                class="accordion-item"
                :class="account.card_format == 'barcode' ? 'is-active' : 'accordion-item--without-body'">
                <h2 class="accordion-header">
                  <button
                    class="accordion-button collapsed"
                    @click="account.card_format = 'barcode'"
                    type="button">
                    <div>
                      <span :class="account.card_format == 'barcode' ? 'fw-medium' : 'fw-lighter'">
                        Barcode
                      </span>
                    </div>
                  </button>
                </h2>
              </div>
            </div>
            <!-- region_end -- Card formats -->
            <!-- region_end -- Cards -->

            <!-- region_start -- Account type: Document -->
            <div class="accordion" v-if="account.type == 'document'">
              <div class="accordion-item">
                <h2 class="accordion-header">
                  <button
                    class="accordion-button" :class="fieldAttrs.card_name.isExpanded ? '' : 'collapsed'"
                    type="button"
                    @click="fieldAttrs.card_name.isExpanded = !fieldAttrs.card_name.isExpanded">
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
                    <div class="input-group">
                      <button
                        class="btn btn-light"
                        type="button"
                        @click="copyToClipboard('editAccount_input_card_number_hidden')"
                      >
                        <i class="fa fa-clipboard"></i>
                      </button>
                      <input
                        class="form-control"
                        placeholder="Card number"
                        type="text"
                        v-model="account.card_number"
                      />
                    </div>
                    <input
                      id="editAccount_input_card_number_hidden"
                      type="hidden"
                      :value="account.card_number"
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
                      placeholder="DD/MM/YYYY"
                      type="text"
                      v-model="account.card_expiracy"
                    />
                  </div>
                </div>
              </div>

              <div class="accordion-item">
                <h2 class="accordion-header">
                  <button
                    class="accordion-button" :class="fieldAttrs.card_issue_date.isExpanded ? '' : 'collapsed'"
                    type="button"
                    @click="fieldAttrs.card_issue_date.isExpanded = !fieldAttrs.card_issue_date.isExpanded">
                    <div>
                      <div class="fw-medium">
                        <i class="fa fa-calendar" aria-hidden="true"></i>
                        Issued date
                      </div>
                      <span class="fw-lighter" v-show="!fieldAttrs.card_issue_date.isExpanded">
                        {{ account.card_issue_date }}
                      </span>
                    </div>
                  </button>
                </h2>
                <div class="accordion-collapse" :class="fieldAttrs.card_issue_date.isExpanded ? 'show' : 'collapse'">
                  <div class="accordion-body">
                    <input
                      class="form-control"
                      placeholder="DD/MM/YYYY"
                      type="text"
                      v-model="account.card_issue_date"
                    />
                  </div>
                </div>
              </div>

              <div class="accordion-item">
                <h2 class="accordion-header">
                  <button
                    class="accordion-button" :class="fieldAttrs.platform.isExpanded ? '' : 'collapsed'"
                    type="button"
                    @click="fieldAttrs.platform.isExpanded = !fieldAttrs.platform.isExpanded">
                    <div>
                      <div class="fw-medium">
                        <i class="fa fa-building-columns" aria-hidden="true"></i>
                        Issued by
                      </div>
                      <span class="fw-lighter" v-show="!fieldAttrs.platform.isExpanded">
                        {{ account.platform }}
                      </span>
                    </div>
                  </button>
                </h2>
                <div class="accordion-collapse" :class="fieldAttrs.platform.isExpanded ? 'show' : 'collapse'">
                  <div class="accordion-body">
                    <input
                      class="form-control"
                      placeholder="Issued place / authority"
                      type="text"
                      v-model="account.platform"
                    />
                  </div>
                </div>
              </div>
            </div>
            <!-- region_end -- Account type: Document -->

            <!-- region_start -- Account type: Login -->
            <div class="accordion" v-if="account.type == 'account'">
              <div class="accordion-item" v-if="account.subtype == 'login'">
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
                        class="btn btn-light"
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

              <div class="accordion-item" v-if="account.subtype == 'secret_key'">
                <h2 class="accordion-header ">
                  <button
                    class="accordion-button" :class="fieldAttrs.login.isExpanded ? '' : 'collapsed'"
                    type="button"
                    @click="fieldAttrs.login.isExpanded = !fieldAttrs.login.isExpanded">
                    <div>
                      <div class="fw-medium">
                        <i class="fa fa-id-badge" aria-hidden="true"></i>
                        Key identifier
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
                        class="btn btn-light"
                        type="button"
                        @click="copyToClipboard('editAccount_input_login_hidden')"
                      >
                        <i class="fa fa-clipboard"></i>
                      </button>
                      <input
                        id="editAccount_input_login"
                        class="form-control"
                        placeholder="Key ID (e.g. Org ID, Device ID, ...)"
                        type="text"
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

              <div class="accordion-item" v-if="account.subtype == 'wifi'">
                <h2 class="accordion-header ">
                  <button
                    class="accordion-button" :class="fieldAttrs.login.isExpanded ? '' : 'collapsed'"
                    type="button"
                    @click="fieldAttrs.login.isExpanded = !fieldAttrs.login.isExpanded">
                    <div>
                      <div class="fw-medium">
                        <i class="fa fa-wifi" aria-hidden="true"></i>
                        Network name (SSID)
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
                        class="btn btn-light"
                        type="button"
                        @click="copyToClipboard('editAccount_input_login_hidden')"
                      >
                        <i class="fa fa-clipboard"></i>
                      </button>
                      <input
                        id="editAccount_input_login"
                        class="form-control"
                        placeholder="SSID"
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

              <div class="accordion-item" v-if="account.subtype == 'login'">
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
                          passwordPreview
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
                        id="editAccount_radiobutton_passwordtype_passwordless"
                        v-model="account.is_password_less"
                        v-bind:value="true"
                      />
                      <label
                        class="btn"
                        for="editAccount_radiobutton_passwordtype_passwordless"
                        :class="account.is_password_less ? 'active' : ''"
                      >
                        <i class="fa fa-bolt" aria-hidden="true"></i>
                        Password less
                      </label>
                      
                      <input
                        type="radio"
                        class="btn-check"
                        name="password-type"
                        id="editAccount_radiobutton_passwordtype_password"
                        v-model="account.is_password_less"
                        v-bind:value="false"
                      />
                      <label
                        class="btn"
                        for="editAccount_radiobutton_passwordtype_password"
                        :class="!account.is_password_less ? 'active' : ''"
                      >
                        <i class="fa fa-lock" aria-hidden="true"></i>
                        Password
                      </label>
                    </div>

                    <hr class="my-4" />

                    <div class="input-group mb-3" v-if="account.is_password_less && !passwordLess.generatedPassword">
                      <input
                        id="editAccount_input_passwordless_masterPassword"
                        class="form-control"
                        type="password"
                        placeholder="Master password"
                        autocomplete="current-password"
                        aria-describedby="editAccount_input_passwordlessHelp_masterPassword"
                        v-model="passwordLess.masterPassword"
                      />
                      <button
                        class="btn btn-light"
                        :class="passwordLess.masterPassword ? 'is-active' : ''"
                        type="button"
                        @click="generatePasswordLess()"
                      >
                        <i class="fa fa-eye"></i> Reveal
                      </button>
                    </div>

                    <div class="input-group mb-3" v-if="account.is_password_less && passwordLess.generatedPassword">
                      <button
                        class="btn btn-light"
                        type="button"
                        @click="copyToClipboard('editAccount_input_passwordless_generatedPassword_hidden')"
                      >
                        <i class="fa fa-clipboard"></i>
                      </button>

                      <input
                        id="editAccount_input_passwordless_generatedPassword"
                        class="form-control"
                        type="text"
                        v-model="passwordLess.generatedPassword"
                        readonly
                      />
                      <input
                        id="editAccount_input_passwordless_generatedPassword_hidden"
                        type="hidden"
                        :value="passwordLess.generatedPassword"
                      />
                      <button
                        class="btn btn-light"
                        type="button"
                        @click="resetPasswordLess()"
                      >
                        <i class="fa fa-undo"></i> Reset
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
                        class="btn btn-light"
                        type="button"
                        @click="generatePasswordLess()"
                        v-if="
                          account.is_password_less && !passwordLess.generatedPassword
                        "
                      >
                        <i class="fa fa-eye"></i> Reveal
                      </button>
                    </div>
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

                    <div class="input-group mb-3" v-if="!account.is_password_less">
                      <button
                        class="btn btn-light"
                        type="button"
                        @click="copyToClipboard('editAccount_input_password_generatedPassword_hidden')"
                        v-if="account.password"
                      >
                        <i class="fa fa-clipboard"></i>
                      </button>
                      <input
                        id="editAccount_input_password"
                        class="form-control"
                        type="text"
                        autocomplete="new-password"
                        aria-describedby="editAccount_input_passwordHelp"
                        v-model="account.password"
                      />
                      <input
                        id="editAccount_input_password_generatedPassword_hidden"
                        type="hidden"
                        :value="account.password"
                      />
                      <button
                        class="btn btn-light"
                        :class="account.password ? 'is-active' : ''"
                        type="button"
                        @click="account.generatePassword()"
                      >
                        <i class="fa fa-cogs"></i> Suggest
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

                    <label class="form-label" for="editAccount_input_social_login">
                      <i class="fa fa-users" aria-hidden="true"></i> Social login
                    </label>
                    <input
                      id="editAccount_input_social_login"
                      class="form-control"
                      type="text"
                      v-model="account.social_login"
                    />
                  </div>
                </div>
              </div>

              <div class="accordion-item" v-if="account.subtype == 'wifi'">
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
                        {{ account.password }}
                      </span>
                    </div>
                  </button>
                </h2>
                <div class="accordion-collapse" :class="fieldAttrs.password.isExpanded ? 'show' : 'collapse'">
                  <div class="accordion-body">
                    <div class="input-group mb-3">
                      <button
                        class="btn btn-light"
                        type="button"
                        @click="copyToClipboard('editAccount_input_password_hidden')"
                        v-if="account.password"
                      >
                        <i class="fa fa-clipboard"></i>
                      </button>
                      <input
                        id="editAccount_input_password"
                        class="form-control"
                        type="text"
                        autocomplete="new-password"
                        v-model="account.password"
                      />
                      <input
                        id="editAccount_input_password_hidden"
                        type="hidden"
                        :value="account.password"
                      />
                    </div>
                   
                    <hr class="my-4" />

                    <label class="form-label" for="editAccount_input_password_security_mode">
                      <i class="fa fa-key" aria-hidden="true"></i>
                      Security mode
                    </label>
                    <input
                      id="editAccount_input_password_security_mode"
                      class="form-control"
                      type="text"
                      placeholder="WPA, WPA2, WEP, Open"
                      v-model="account.password_clue"
                    />
                  </div>
                </div>
              </div>

              <div class="accordion-item" v-if="account.subtype == 'secret_key'">
                <h2 class="accordion-header">
                  <button
                    class="accordion-button" :class="fieldAttrs.password.isExpanded ? '' : 'collapsed'"
                    type="button"
                    @click="fieldAttrs.password.isExpanded = !fieldAttrs.password.isExpanded">
                    <div>
                      <div class="fw-medium">
                        <i class="fa fa-key" aria-hidden="true"></i>
                        Key
                      </div>
                      <span class="fw-lighter" v-show="!fieldAttrs.password.isExpanded">
                        {{ account.password }}
                      </span>
                    </div>
                  </button>
                </h2>
                <div class="accordion-collapse" :class="fieldAttrs.password.isExpanded ? 'show' : 'collapse'">
                  <div class="accordion-body">
                    <div class="input-group mb-3">
                      <button
                        class="btn btn-light"
                        type="button"
                        @click="copyToClipboard('editAccount_input_password_hidden')"
                        v-if="account.password"
                      >
                        <i class="fa fa-clipboard"></i>
                      </button>
                      <input
                        id="editAccount_input_password"
                        class="form-control"
                        type="text"
                        autocomplete="new-password"
                        v-model="account.password"
                      />
                      <input
                        id="editAccount_input_password_hidden"
                        type="hidden"
                        :value="account.password"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div class="accordion-item" v-if="account.subtype == 'login'">
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
                        class="btn btn-light"
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

              <div class="accordion-item" v-if="account.subtype == 'login' || account.subtype == 'secret_key'">
                <h2 class="accordion-header">
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
                        class="btn btn-light"
                        type="button"
                        @click="openLink(account.platform)"
                      >
                        <i class="fa fa-arrow-up-right-from-square"></i>
                      </button>
                      <input
                        id="editAccount_input_platform"
                        class="form-control"
                        placeholder="Platform"
                        type="text"
                        @change="onPlatformChange()"
                        v-model="account.platform"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="accordion" v-if="account.type == 'card'">
              <div class="accordion-item">
                <h2 class="accordion-header">
                  <button
                    class="accordion-button" :class="fieldAttrs.platform.isExpanded ? '' : 'collapsed'"
                    type="button"
                    @click="fieldAttrs.platform.isExpanded = !fieldAttrs.platform.isExpanded">
                    <div>
                      <div class="fw-medium">
                        <i class="fa fa-building-columns" aria-hidden="true"></i>
                        Provider
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
                        class="btn btn-light"
                        type="button"
                        @click="openLink(account.platform)"
                      >
                        <i class="fa fa-arrow-up-right-from-square"></i>
                      </button>
                      <input
                        id="editAccount_input_platform"
                        class="form-control"
                        placeholder="Provider name (e.g. HSBC bank)"
                        type="text"
                        @change="onPlatformChange()"
                        v-model="account.platform"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="accordion" v-if="account.type == 'bank' && account.subtype == 'iban'">
              <div class="accordion-item">
                <h2 class="accordion-header">
                  <button
                    class="accordion-button" :class="fieldAttrs.platform.isExpanded ? '' : 'collapsed'"
                    type="button"
                    @click="fieldAttrs.platform.isExpanded = !fieldAttrs.platform.isExpanded">
                    <div>
                      <div class="fw-medium">
                        <i class="fa fa-building-columns" aria-hidden="true"></i>
                        BIC / SWIFT code
                      </div>
                      <span class="fw-lighter" v-show="!fieldAttrs.platform.isExpanded">
                        {{ account.platform }}
                      </span>
                    </div>
                  </button>
                </h2>
                <div class="accordion-collapse" :class="fieldAttrs.platform.isExpanded ? 'show' : 'collapse'">
                  <div class="accordion-body">
                    <input
                      id="editAccount_input_platform"
                      class="form-control"
                      placeholder="e.g. BOUS FRPPAR"
                      type="text"
                      @change="onPlatformChange()"
                      v-model="account.platform"
                    />
                  </div>
                </div>
              </div>

              <div class="accordion-item">
                <h2 class="accordion-header">
                  <button
                    class="accordion-button" :class="fieldAttrs.password.isExpanded ? '' : 'collapsed'"
                    type="button"
                    @click="fieldAttrs.password.isExpanded = !fieldAttrs.password.isExpanded">
                    <div>
                      <div class="fw-medium">
                        <i class="fa fa-money-check" aria-hidden="true"></i>
                        International Bank Account Number (IBAN)
                      </div>
                      <span class="fw-lighter" v-show="!fieldAttrs.password.isExpanded">
                        {{ account.password }}
                      </span>
                    </div>
                  </button>
                </h2>
                <div class="accordion-collapse" :class="fieldAttrs.password.isExpanded ? 'show' : 'collapse'">
                  <div class="accordion-body">
                    <div class="input-group mb-3">
                      <button
                        class="btn btn-light"
                        type="button"
                        @click="copyToClipboard('editAccount_input_password_hidden')"
                        v-if="account.password"
                      >
                        <i class="fa fa-clipboard"></i>
                      </button>
                      <input
                        id="editAccount_input_password"
                        class="form-control"
                        type="text"
                        placeholder="IBAN"
                        autocomplete="new-password"
                        v-model="account.password"
                      />
                      <input
                        id="editAccount_input_password_hidden"
                        type="hidden"
                        :value="account.password"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div class="accordion-item">
                <h2 class="accordion-header ">
                  <button
                    class="accordion-button" :class="fieldAttrs.login.isExpanded ? '' : 'collapsed'"
                    type="button"
                    @click="fieldAttrs.login.isExpanded = !fieldAttrs.login.isExpanded">
                    <div>
                      <div class="fw-medium">
                        <i class="fa fa-id-badge" aria-hidden="true"></i>
                        Account holder
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
                        class="btn btn-light"
                        type="button"
                        @click="copyToClipboard('editAccount_input_login_hidden')"
                      >
                        <i class="fa fa-clipboard"></i>
                      </button>
                      <input
                        id="editAccount_input_login"
                        class="form-control"
                        placeholder="Account holder name"
                        type="text"
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
              <div class="accordion-item">
                <h2 class="accordion-header">
                  <button
                    class="accordion-button" :class="fieldAttrs.label.isExpanded ? '' : 'collapsed'"
                    type="button"
                    @click="fieldAttrs.label.isExpanded = !fieldAttrs.label.isExpanded">
                    <div>
                      <div class="fw-medium">
                        <i class="fa fa-tag" aria-hidden="true"></i>
                        Label
                      </div>
                      <span class="fw-lighter" v-show="!fieldAttrs.label.isExpanded">
                        {{ account.label }}
                      </span>
                    </div>
                  </button>
                </h2>
                <div class="accordion-collapse" :class="fieldAttrs.label.isExpanded ? 'show' : 'collapse'">
                  <div class="accordion-body">
                    <input
                      id="editAccount_input_label"
                      class="form-control"
                      placeholder="Label"
                      type="text"
                      v-model="account.label"
                    />

                    <hr class="my-4" />

                    <label class="form-label" for="editAccount_input_icon"
                      ><i class="fa fa-icons" aria-hidden="true"></i> Icon</label
                    >
                    <div class="input-group">
                      <button
                        class="btn btn-light"
                        type="button"
                        :style="'background-image: url(' + account.icon + '); background-size: cover;'"
                      >
                      &nbsp;
                      </button>
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
                <h2 class="accordion-header">
                  <button
                    class="accordion-button" :class="fieldAttrs.type.isExpanded ? '' : 'collapsed'"
                    type="button"
                    @click="fieldAttrs.type.isExpanded = !fieldAttrs.type.isExpanded">
                    <div>
                      <div class="fw-medium">
                        {{ fieldAttrs.type.isExpanded ? 'Type' : account.displayType }}
                      </div>
                    </div>
                  </button>
                </h2>
                <div class="accordion-collapse" :class="fieldAttrs.type.isExpanded ? 'show' : 'collapse'">
                  <div class="accordion-body">
                    <span class="clickable" :class="account.type == 'account' ? 'fw-medium' : 'fw-lighter'" @click="onTypeChange('account')">
                      Credential
                    </span>
                    <hr class="my-4" />
                    <span class="clickable" :class="account.type == 'card' ? 'fw-medium' : 'fw-lighter'" @click="onTypeChange('card')">
                      Card
                    </span>
                    <hr class="my-4" />
                    <span class="clickable" :class="account.type == 'bank' ? 'fw-medium' : 'fw-lighter'" @click="onTypeChange('bank')">
                      Bank
                    </span>
                    <hr class="my-4" />
                    <span class="clickable" :class="account.type == 'document' ? 'fw-medium' : 'fw-lighter'" @click="onTypeChange('document')">
                      Document
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="accordion">
              <div class="accordion-item">
                <h2 class="accordion-header">
                  <button
                    class="accordion-button" :class="fieldAttrs.subtype.isExpanded ? '' : 'collapsed'"
                    type="button"
                    @click="fieldAttrs.subtype.isExpanded = !fieldAttrs.subtype.isExpanded">
                    <div>
                      <span class="fw-medium">
                        {{ fieldAttrs.subtype.isExpanded ? 'Sub Type' : account.displaySubtype }}
                      </span>
                    </div>
                  </button>
                </h2>
                <div class="accordion-collapse" :class="fieldAttrs.subtype.isExpanded ? 'show' : 'collapse'">
                  <div class="accordion-body" v-if="account.type == 'account'">
                    <span class="clickable" :class="account.subtype == 'login' ? 'fw-medium' : 'fw-lighter'" @click="account.subtype = 'login'">
                      Login
                    </span>
                    <hr class="my-4" />
                    <span class="clickable" :class="account.subtype == 'wifi' ? 'fw-medium' : 'fw-lighter'" @click="account.subtype = 'wifi'">
                      Wifi
                    </span>
                    <hr class="my-4" />
                    <span class="clickable" :class="account.subtype == 'secret_key' ? 'fw-medium' : 'fw-lighter'" @click="account.subtype = 'secret_key'">
                      Secret key
                    </span>
                  </div>

                  <div class="accordion-body" v-if="account.type == 'card'">
                    <span class="clickable" :class="account.subtype == 'payment' ? 'fw-medium' : 'fw-lighter'" @click="account.subtype = 'payment'">
                      Payment
                    </span>
                    <hr class="my-4" />
                    <span class="clickable" :class="account.subtype == 'loyalty' ? 'fw-medium' : 'fw-lighter'" @click="account.subtype = 'loyalty'">
                      Loyalty
                    </span>
                    <hr class="my-4" />
                    <span class="clickable" :class="account.subtype == 'gift' ? 'fw-medium' : 'fw-lighter'" @click="account.subtype = 'gift'">
                      Gift
                    </span>
                  </div>

                  <div class="accordion-body" v-if="account.type == 'bank'">
                    <span class="clickable fw-lighter'">
                      IBAN
                    </span>
                  </div>

                  <div class="accordion-body" v-if="account.type == 'document'">
                    <span class="clickable fw-lighter'">
                      Identity
                    </span>
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
                          <button class="btn btn-light" type="button" id="button-addon1">-</button>
                          <input id="tatata" type="text" class="form-control" placeholder="" aria-label="Example text with button addon" aria-describedby="button-addon1">
                          <button class="btn btn-light" type="button" id="button-addon1">+</button>
                      </div>
                  </div>
                  <div class="col">
                      <div class="input-group mb-3">
                          <button class="btn btn-light" type="button" id="button-addon1">-</button>
                          <input id="tatata" type="text" class="form-control" placeholder="" aria-label="Example text with button addon" aria-describedby="button-addon1">
                          <button class="btn btn-light" type="button" id="button-addon1">+</button>
                      </div>
                  </div>
              </div> -->

        </form>

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
              class="btn btn-action btn-outline-danger"
              type="button"
              @click="addToFavorite()"
            >
              <i class="fa fa-thumbtack"></i>
              {{ account.isPinned ? 'Remove from favorite' : 'Add to favorite' }}
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

          <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
            <button
              class="btn btn-action"
              :class="isDuplicating ? 'btn-dark' : 'btn-outline-primary'"
              type="button"
              @click="duplicate()"
            >
              <i class="fa fa-copy"></i>
              {{ isDuplicating ? 'Duplicating ...' : 'Duplicate' }}
            </button>
          </div>

          <br>
          <br>
          <span class="small text-light">
            ID: {{ account._id }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import "../assets/bottom_sheet.css";
import FullscreenBarcode from "./FullscreenBarcode.vue";
import { mapState, mapActions } from "pinia";
import { useUiStore, useAlertStore, useAccountsStore, useNetworkStore } from "@/store";
import totpGenerator from "totp-generator";
import JsBarcode from 'jsbarcode'
import QrcodeVue from 'qrcode.vue'
import { truncateString } from '../utils/textFormat'
import { detectBarcodeSymbology } from '../utils/barcode'

function initialState() {
  return {
    fullscreenBarcodeVisible: false,
    isSaving: false,
    isDeleting: false,
    isDuplicating: false,
    newTag: "",
    isSmallHeader: false,
    passwordLess: {
      masterPassword: "",
      generatedPassword: "",
    },
    fieldAttrs: {
      label: {
        isExpanded: false,
      },
      type: {
        isExpanded: false,
      },
      subtype: {
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
      card_format: {
        isExpanded: false,
      },
      card_issue_date: {
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
  components: {
    FullscreenBarcode,
    QrcodeVue
  },
  data: function () {
    return initialState();
  },
  mounted() {
    this.initBottomSheet("edit-account-bottom-sheet");
  },
  watch: {
    // Watch all field expansion flags; expand sheet when a field opens
    fieldAttrs: {
      deep: true,
      handler() {
        const anyExpanded = Object.values(this.fieldAttrs).some(f => f && f.isExpanded);
        if (anyExpanded) {
          this.expandBottomSheet("edit-account-bottom-sheet");
        }
      }
    }
  },
  updated() {
    // Render barcode once the svg is ready (updated() is called after the DOM is updated)
    this.renderBarcode();
  },
  computed: {
    ...mapState(useUiStore, {
      account: "currentEditingAccount",
      SIDEBAR: "SIDEBAR",
    }),
    ...mapState(useNetworkStore, [
      'isOffline'
    ]),

    showPasswordTypeOptions: function () {
      return this.account.is_password_less;
    },

    passwordPreview: function () {
      // If passwordless, and no social login is used as "password less", display the latest generated pwd or offer to expand to generate
      if (this.account.is_password_less && !this.account.social_login) {
        return this.passwordLess.generatedPassword || "Expand to generate";
      }

      if (this.account.password) {
        return this.account.password;
      }

      if (this.account.password_clue) {
        return this.account.password_clue;
      }

      if (this.account.social_login) {
        return '';
      }

      return 'No password';
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
        try {
          return totpGenerator(this.account.totp_secret.replace(/ /g, ""));
        }
        catch (exception) {
          return "Invalid secret";
        }
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
    },

    barcodeFormat: function () {
      if (this.account.card_format === 'qrcode') {
        return 'QR';
      }

      return detectBarcodeSymbology(this.account.card_number);
    },
  },
  methods: {
    ...mapActions(useAccountsStore, ['updateAccount', 'removeAccount']),
    ...mapActions(useUiStore, [
      'openSidebar',
      'setCurrentAddingAccount',
      'closeSidebar',
      'resetCurrentEditingAccount',
  'initBottomSheet',
  'expandBottomSheet',
  'reduceBottomSheet',
    ]),
    ...mapActions(useAlertStore, ['openAlert']),

    scrollFunction: function (e) {
      this.isSmallHeader = e.target.scrollTop > 20;
    },

    onTypeChange: function (accountType) {
      this.account.type = accountType;

      // if the subtype is not one of the subtypes of the type, set it to the default subtype

      if (this.account.type == 'account' && !['login', 'wifi', 'secret_key'].includes(this.account.subtype)) {
        this.account.subtype = 'login'; // default subtype for account type
      }

      if (this.account.type == 'card' && !['payment', 'loyalty', 'gift'].includes(this.account.subtype)) {
        this.account.subtype = 'payment'; // default subtype for card type
      }
      if (this.account.type == 'document' && this.account.subtype) {
        this.account.subtype = 'identity';
      }
      if (this.account.type == 'bank' && this.account.subtype) {
        this.account.subtype = 'iban';
      }
    },

    renderBarcode: function () {
      if (this.account.card_format === 'qrcode') {
        return;
      }

      if (this.$refs.barcodeEl) {
        JsBarcode(this.$refs.barcodeEl, this.account.rawCardNumber, {
          format: this.barcodeFormat,
          displayValue: true,
          margin: 0,
          flat: true,
          width: 1,
        })
      }
    },

    onPlatformChange: function () {
      // if no label is set but platform is set, use display platform as label
      if ((!this.account.label || this.account.label.length === 0)
          && this.account.platform && this.account.platform.length > 0) {
        this.account.label = this.account.displayPlatform;
      }
      // if no icon is set but platform is set, use icon from Google Favicon API
      if ((!this.account.icon || this.account.icon.length === 0)
          && this.account.platform && this.account.platform.length > 0) {
        this.account.icon = "https://www.google.com/s2/favicons?domain=" + this.account.platform;
      }
    },

    save: async function () {
      // if no label is set, use platform as label
      this.onPlatformChange.call(this);

      if (!this.account.isValid()) {
        this.openAlert("Error", "Please fill all fields !", "danger");
        return;
      }

      this.isSaving = true;

      try {
        await this.updateAccount(this.account);

        const isOffline = this.isOffline;
        this.openAlert(
          isOffline ? 'Saved locally — will sync when back online.' : 'Updated !',
          this.account.label,
          isOffline ? 'info' : 'success',
          this.account.icon
        );

        this.isSaving = false;
        this.isDeleting = false;

        this.closeAccountEditing();
      } catch (error) {
        const isOffline = this.isOffline;
        this.openAlert(
          error.name || (isOffline ? 'Offline' : 'Error'),
          error.message || error.reason || (typeof error === 'string' ? error : ''),
          isOffline ? 'warning' : 'danger'
        );
        this.isSaving = false;
      }
    },

    addToFavorite: function () {
      this.account.isPinned = !this.account.isPinned;
      this.save();
    },

    duplicate: async function () {
      this.isDuplicating = true;

      try {
        let duplicatedAccount = await this.account.duplicate();

        this.setCurrentAddingAccount(duplicatedAccount);

        this.openSidebar(this.SIDEBAR.ADD_ACCOUNT);

        this.isDuplicating = false;

        this.openAlert(
          duplicatedAccount.label,
          "Save to validate duplicate",
          "info",
          duplicatedAccount.icon
        );

        this.closeAccountEditing();
      } catch (error) {
        const isOffline = this.isOffline;
        this.openAlert(
          error.name || (isOffline ? 'Offline' : 'Error'),
          error.message || error.reason || (typeof error === 'string' ? error : ''),
          isOffline ? 'warning' : 'danger'
        );
        this.isDuplicating = false;
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
          `Are you sure to delete : ${this.account.label} ?`
        ) === true
      ) {
        this.isDeleting = true;

        try {
          await this.removeAccount(this.account);

          const isOffline = this.isOffline;
          this.openAlert(
            this.account.label,
            isOffline ? 'Removed locally — will sync when back online.' : 'Removed !',
            isOffline ? 'info' : 'success'
          );

          this.isSaving = false;
          this.isDeleting = false;

          this.closeAccountEditing();
        } catch (error) {
          const isOffline = this.isOffline;
          this.openAlert(
            error.name || (isOffline ? 'Offline' : 'Error'),
            error.message || error.reason || (typeof error === 'string' ? error : ''),
            isOffline ? 'warning' : 'danger'
          );
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

      this.openAlert("Copied to clipboard !", inputToCopy.value, "info");
    },

    openLink: function (url) {
      // if url doesn't start with http or https, add http
      if (!url.startsWith("http") && !url.startsWith("https")) {
        url = "http://" + url;
      }
      window.open(url, "_blank");
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

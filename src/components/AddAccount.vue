<template>
  <div
    id="add-account-bottom-sheet"
    class="bottom-sheet"
    :class="visible ? 'show' : ''"
  >
  <div class="sheet-overlay" @click="closeSidebar(SIDEBAR.ADD_ACCOUNT)"></div>
    <div class="content">
      <div class="header row" :class="account.icon ? 'hasIcon' : ''">
        <div class="drag-icon row justify-content-center"><span></span></div>

        <div class="row justify-content-center">
          <div class="col text-center" v-show="account.icon">
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
              {{ account.label || 'New account' }}
            </h2>
          </div>
        </div>
      </div>
      <div class="body">
        <form class="row">

          <!-- region_start -- Main information -->
          <div class="accordion">
            <div class="accordion-item">
              <h2 class="accordion-header">
                <button
                  class="accordion-button"
                  type="button">
                  <div>
                    <div class="fw-medium">
                      <i class="fa fa-tag" aria-hidden="true"></i>
                      Label
                    </div>
                  </div>
                </button>
              </h2>
              <div class="accordion-collapse show">
                <div class="accordion-body">
                  <input
                    class="form-control"
                    placeholder="e.g. Pokemon"
                    type="text"
                    ref="label"
                    v-model="account.label"
                    required
                  />

                  <hr class="my-4" />

                  <label class="form-label" for="addAccount_input_new_tag"
                    ><i class="fa fa-tags" aria-hidden="true"></i> Tags</label
                  >
                  <div class="form-control tags tags-input" @click="focusTagInput()">
                    <span
                      class="badge rounded-pill"
                      v-for="(tag, tagIndex) in account.tags.split(',')"
                      v-bind:key="tagIndex"
                      @click="removeTag(tag)"
                    >
                      {{ tag }}
                      <i class="fa fa-close" v-if="tag"></i>
                    </span>
                  </div>
                  <input
                    ref="tags"
                    id="addAccount_input_new_tag"
                    class="form-control tags-new-input"
                    placeholder="Tag"
                    type="text"
                    v-model="newTag"
                    @keyup.enter="addTag()"
                    required
                  />

                  <hr class="my-4" />

                  <label class="form-label" for="addAccount_icon"
                    ><i class="fa fa-image" aria-hidden="true"></i> Icon</label
                  >
                  <input
                    id="addAccount_icon"
                    class="form-control"
                    placeholder="Icon URL"
                    type="text"
                    v-model="account.icon"
                  />
                </div>
              </div>
            </div>
          </div>
          <!-- region_end -- Main information -->


          <!-- region_start -- Account types -->
          <div class="accordion">
            <div
              class="accordion-item"
              :class="account.type == 'account' ? 'is-active' : 'accordion-item--without-body'">
              <h2 class="accordion-header">
                <button
                  class="accordion-button collapsed"
                  @click="onTypeChange('account')"
                  type="button">
                  <div>
                    <div class="fw-medium">
                      Credential
                    </div>
                    <span class="fw-lighter">
                      Login, Wifi, Secret key
                    </span>
                  </div>
                </button>
              </h2>
            </div>

            <div
              class="accordion-item"
              :class="account.type == 'card' ? 'is-active' : 'accordion-item--without-body'">
              <h2 class="accordion-header">
                <button
                  class="accordion-button collapsed"
                  @click="onTypeChange('card')"
                  type="button">
                  <div>
                    <div class="fw-medium">
                      Card
                    </div>
                    <span class="fw-lighter">
                      Payment, Loyalty, Gift
                    </span>
                  </div>
                </button>
              </h2>
            </div>

            <div
              class="accordion-item"
              :class="account.type == 'document' ? 'is-active' : 'accordion-item--without-body'">
              <h2 class="accordion-header ">
                <button
                  class="accordion-button collapsed"
                  @click="onTypeChange('document')"
                  type="button">
                  <div>
                    <div class="fw-medium">
                      Document
                    </div>
                    <span class="fw-lighter">
                      ID, Passport
                    </span>
                  </div>
                </button>
              </h2>
            </div>

            <div
              class="accordion-item"
              :class="account.type == 'bank' ? 'is-active' : 'accordion-item--without-body'">
              <h2 class="accordion-header">
                <button
                  class="accordion-button collapsed"
                  @click="onTypeChange('bank')"
                  type="button">
                  <div>
                    <div class="fw-medium">
                      Bank
                    </div>
                    <span class="fw-lighter">
                      IBAN, SWIFT
                    </span>
                  </div>
                </button>
              </h2>
            </div>
          </div>
          <!-- region_end -- Account types -->

          <!-- region_start -- Account sub types for account type Credential (account) -->
          <div class="accordion" v-if="account.type == 'account'">
            <div
              class="accordion-item"
              :class="account.subtype == 'login' ? 'is-active' : 'accordion-item--without-body'">
              <h2 class="accordion-header">
                <button
                  class="accordion-button collapsed"
                  @click="account.subtype = 'login'"
                  type="button">
                  <div>
                    <span :class="account.subtype == 'login' ? 'fw-medium' : 'fw-lighter'">
                      Login
                    </span>
                  </div>
                </button>
              </h2>
            </div>

            <div
              class="accordion-item"
              :class="account.subtype == 'wifi' ? 'is-active' : 'accordion-item--without-body'">
              <h2 class="accordion-header">
                <button
                  class="accordion-button collapsed"
                  @click="account.subtype = 'wifi'"
                  type="button">
                  <div>
                    <span :class="account.subtype == 'wifi' ? 'fw-medium' : 'fw-lighter'">
                      Wifi
                    </span>
                  </div>
                </button>
              </h2>
            </div>

            <div
              class="accordion-item"
              :class="account.subtype == 'secret_key' ? 'is-active' : 'accordion-item--without-body'">
              <h2 class="accordion-header">
                <button
                  class="accordion-button collapsed"
                  @click="account.subtype = 'secret_key'"
                  type="button">
                  <div>
                    <span :class="account.subtype == 'secret_key' ? 'fw-medium' : 'fw-lighter'">
                      Secret key
                    </span>
                  </div>
                </button>
              </h2>
            </div>
          </div>
          <!-- region_end -- Account sub types for account type Credential (account) -->

          <!-- region_start -- Account sub types for account type Card -->
          <div class="accordion" v-if="account.type == 'card'">
            <div
              class="accordion-item"
              :class="account.subtype == 'payment' ? 'is-active' : 'accordion-item--without-body'">
              <h2 class="accordion-header">
                <button
                  class="accordion-button collapsed"
                  @click="account.subtype = 'payment'"
                  type="button">
                  <div>
                    <span :class="account.subtype == 'payment' ? 'fw-medium' : 'fw-lighter'">
                      Payment
                    </span>
                  </div>
                </button>
              </h2>
            </div>

            <div
              class="accordion-item"
              :class="account.subtype == 'loyalty' ? 'is-active' : 'accordion-item--without-body'">
              <h2 class="accordion-header">
                <button
                  class="accordion-button collapsed"
                  @click="account.subtype = 'loyalty'"
                  type="button">
                  <div>
                    <span :class="account.subtype == 'loyalty' ? 'fw-medium' : 'fw-lighter'">
                      Loyalty card
                    </span>
                  </div>
                </button>
              </h2>
            </div>

            <div
              class="accordion-item"
              :class="account.subtype == 'gift' ? 'is-active' : 'accordion-item--without-body'">
              <h2 class="accordion-header">
                <button
                  class="accordion-button collapsed"
                  @click="account.subtype = 'gift'"
                  type="button">
                  <div>
                    <span :class="account.subtype == 'gift' ? 'fw-medium' : 'fw-lighter'">
                      Gift card
                    </span>
                  </div>
                </button>
              </h2>
            </div>
          </div>
          <!-- region_end -- Account sub types for account type Card -->

          <!-- region_start -- Card -->
          <div class="accordion" v-if="account.type == 'card'">
            <div class="accordion-item">
              <h2 class="accordion-header">
                <button
                  class="accordion-button"
                  type="button">
                  <div>
                    <div class="fw-medium">
                      <i class="fa fa-building-columns" aria-hidden="true"></i>
                      Provider
                    </div>
                  </div>
                </button>
              </h2>
              <div class="accordion-collapse show">
                <div class="accordion-body">
                  <input
                    class="form-control"
                    placeholder="Provider name (e.g. HSBC bank)"
                    type="text"
                    v-model="account.platform"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="accordion" v-if="account.type == 'card'">
            <div class="accordion-item">
              <h2 class="accordion-header">
                <button
                  class="accordion-button"
                  type="button">
                  <div>
                    <div class="fw-medium">
                      <i class="fa fa-barcode" aria-hidden="true"></i>
                      Number
                    </div>
                  </div>
                </button>
              </h2>
              <div class="accordion-collapse show">
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
                  class="accordion-button"
                  type="button">
                  <div>
                    <div class="fw-medium">
                      <i class="fa fa-key" aria-hidden="true"></i>
                      PIN
                    </div>
                  </div>
                </button>
              </h2>
              <div class="accordion-collapse show">
                <div class="accordion-body">
                  <input
                    class="form-control"
                    placeholder="PIN"
                    type="text"
                    v-model="account.card_pin"
                  />
                </div>
              </div>
            </div>
            <div class="accordion-item" v-if="account.subtype == 'payment'">
              <h2 class="accordion-header">
                <button
                  class="accordion-button"
                  type="button">
                  <div>
                    <div class="fw-medium">
                      <i class="fa fa-calendar" aria-hidden="true"></i>
                      Expiracy
                    </div>
                  </div>
                </button>
              </h2>
              <div class="accordion-collapse show">
                <div class="accordion-body">
                  <input
                    class="form-control"
                    placeholder="MM/YYYY"
                    type="text"
                    v-model="account.card_expiracy"
                  />
                </div>
              </div>
            </div>
            <div class="accordion-item" v-if="account.subtype == 'payment'">
              <h2 class="accordion-header">
                <button
                  class="accordion-button"
                  type="button">
                  <div>
                    <div class="fw-medium">
                      <i class="fa fa-lock" aria-hidden="true"></i>
                      Cryptogram (CVV/CVC)
                    </div>
                  </div>
                </button>
              </h2>
              <div class="accordion-collapse show">
                <div class="accordion-body">
                  <input
                    class="form-control"
                    placeholder="CVC/CVV"
                    type="text"
                    v-model="account.card_cryptogram"
                  />
                </div>
              </div>
            </div>
            <div class="accordion-item">
              <h2 class="accordion-header">
                <button
                  class="accordion-button"
                  type="button">
                  <div>
                    <div class="fw-medium">
                      <i class="fa fa-user" aria-hidden="true"></i>
                      Name
                    </div>
                  </div>
                </button>
              </h2>
              <div class="accordion-collapse show">
                <div class="accordion-body">
                  <input
                    class="form-control"
                    placeholder="Name on card"
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
          <!-- region_end -- Card -->

          <!-- region_start -- Document -->
          <div class="accordion" v-if="account.type == 'document'">
            <div class="accordion-item">
              <h2 class="accordion-header">
                <button
                  class="accordion-button"
                  type="button">
                  <div>
                    <div class="fw-medium">
                      <i class="fa fa-user" aria-hidden="true"></i>
                      Name
                    </div>
                  </div>
                </button>
              </h2>
              <div class="accordion-collapse show">
                <div class="accordion-body">
                  <input
                    class="form-control"
                    placeholder="Name on card"
                    type="text"
                    v-model="account.card_name"
                  />
                </div>
              </div>
            </div>
            <div class="accordion-item">
              <h2 class="accordion-header">
                <button
                  class="accordion-button"
                  type="button">
                  <div>
                    <div class="fw-medium">
                      <i class="fa fa-hashtag" aria-hidden="true"></i>
                      Number
                    </div>
                  </div>
                </button>
              </h2>
              <div class="accordion-collapse show">
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
                  class="accordion-button"
                  type="button">
                  <div>
                    <div class="fw-medium">
                      <i class="fa fa-calendar" aria-hidden="true"></i>
                      Expiracy
                    </div>
                  </div>
                </button>
              </h2>
              <div class="accordion-collapse show">
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
                  class="accordion-button"
                  type="button">
                  <div>
                    <div class="fw-medium">
                      <i class="fa fa-calendar" aria-hidden="true"></i>
                      Issued date
                    </div>
                  </div>
                </button>
              </h2>
              <div class="accordion-collapse show">
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
                  class="accordion-button"
                  type="button">
                  <div>
                    <div class="fw-medium">
                      <i class="fa fa-building-columns" aria-hidden="true"></i>
                      Issued by
                    </div>
                  </div>
                </button>
              </h2>
              <div class="accordion-collapse show">
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
          <!-- region_end -- Document -->
          
          <div class="accordion" v-if="account.type == 'account'">
            <div class="accordion-item" v-if="account.subtype == 'login' || account.subtype == 'secret_key'">
              <h2 class="accordion-header">
                <button
                  class="accordion-button"
                  type="button">
                  <div>
                    <div class="fw-medium">
                      <i class="fa fa-globe" aria-hidden="true"></i>
                      Platform
                    </div>
                  </div>
                </button>
              </h2>
              <div class="accordion-collapse show">
                <div class="accordion-body">
                  <input
                    class="form-control"
                    placeholder="e.g. bourg-palette.com"
                    type="text"
                    ref="platform"
                    @change="onPlatformChange()"
                    v-model="account.platform"
                    required
                  />
                </div>
              </div>
            </div>
          
            <div class="accordion-item" v-if="account.subtype == 'login'">
              <h2 class="accordion-header">
                <button
                  class="accordion-button"
                  type="button">
                  <div>
                    <div class="fw-medium">
                      <i class="fa fa-id-badge" aria-hidden="true"></i>
                      Login
                    </div>
                  </div>
                </button>
              </h2>
              <div class="accordion-collapse show">
                <div class="accordion-body">
                  <input
                    class="form-control"
                    placeholder="Login"
                    type="text"
                    v-model="account.login"
                  />
                </div>
              </div>
            </div>

            <div class="accordion-item" v-if="account.subtype == 'wifi'">
              <h2 class="accordion-header">
                <button
                  class="accordion-button"
                  type="button">
                  <div>
                    <div class="fw-medium">
                      <i class="fa fa-wifi" aria-hidden="true"></i>
                      SSID
                    </div>
                  </div>
                </button>
              </h2>
              <div class="accordion-collapse show">
                <div class="accordion-body">
                  <input
                    class="form-control"
                    placeholder="SSID"
                    type="text"
                    v-model="account.login"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- region_start -- Bank -->
          <div class="accordion" v-if="account.type == 'bank'">
            <div class="accordion-item">
              <h2 class="accordion-header">
                <button
                  class="accordion-button"
                  type="button">
                  <div>
                    <div class="fw-medium">
                      <i class="fa fa-building-columns" aria-hidden="true"></i>
                      BIC / SWIFT code
                    </div>
                  </div>
                </button>
              </h2>
              <div class="accordion-collapse show">
                <div class="accordion-body">
                  <input
                    class="form-control"
                    placeholder="e.g. BOUS FRPPAR"
                    type="text"
                    ref="platform"
                    v-model="account.platform"
                    required
                  />
                </div>
              </div>
            </div>
          
            <div class="accordion-item">
              <h2 class="accordion-header">
                <button
                  class="accordion-button"
                  type="button">
                  <div>
                    <div class="fw-medium">
                      <i class="fa fa-money-check" aria-hidden="true"></i>
                      International Bank Account Number (IBAN)
                    </div>
                  </div>
                </button>
              </h2>
              <div class="accordion-collapse show">
                <div class="accordion-body">
                  <input
                    class="form-control"
                    placeholder="IBAN"
                    type="text"
                    v-model="account.password"
                  />
                </div>
              </div>
            </div>

            <div class="accordion-item">
              <h2 class="accordion-header">
                <button
                  class="accordion-button"
                  type="button">
                  <div>
                    <div class="fw-medium">
                      <i class="fa fa-id-badge" aria-hidden="true"></i>
                      Account holder
                    </div>
                  </div>
                </button>
              </h2>
              <div class="accordion-collapse show">
                <div class="accordion-body">
                  <input
                    class="form-control"
                    placeholder="Account holder name"
                    type="text"
                    v-model="account.login"
                  />
                </div>
              </div>
            </div>
          </div>
          <!-- region_end -- Bank -->

          <div class="accordion" v-if="account.type == 'account'">
            <div class="accordion-item" v-if="account.subtype == 'login' || account.subtype == 'wifi'">
              <h2 class="accordion-header">
                <button
                  class="accordion-button"
                  type="button">
                  <div>
                    <div class="fw-medium">
                      <i class="fa fa-lock" aria-hidden="true"></i>
                      Password
                    </div>
                  </div>
                </button>
              </h2>
              <div class="accordion-collapse show">
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

                  <br>
                  <small
                    id="addAccount_passwordLessHelp"
                    class="form-text text-muted"
                    v-show="account.is_password_less"
                    >Password less generator will be available once the account will
                    be created.</small
                  >

                <hr class="my-4" />

                <div class="input-group" v-show="!account.is_password_less">
                    <input
                      class="form-control"
                      type="text"
                      aria-describedby="addAccount_passwordHelp"
                      v-model="account.password"
                      placeholder="Password"
                    />
                    <button
                      class="btn btn-light"
                      type="button"
                      @click="account.generatePassword()"
                    >
                      <i class="fa fa-cogs"></i> Generate
                    </button>
                </div>
                <small
                    id="addAccount_passwordHelp"
                    class="form-text text-muted"
                    v-show="!account.is_password_less"
                    >Click button to generate password.</small
                  >
                
                <hr class="my-4" v-show="!account.is_password_less" />

                <label class="form-label" for="password_clue_input">
                <i class="fa fa-eye" aria-hidden="true"></i>
                  {{
                    account.is_password_less
                      ? "Master password clue"
                      : "Password clue"
                  }}
                </label>
                <input
                  id="password_clue_input"
                  class="form-control"
                  type="text"
                  v-model="account.password_clue"
                />

                <hr class="my-4" v-if="account.subtype == 'login'" />

                <label class="form-label" for="addAccount_social_login_input" v-if="account.subtype == 'login'">
                  <i class="fa fa-mobile-screen" aria-hidden="true"></i> Social login
                  </label>
                <input
                  id="addAccount_social_login_input"
                  class="form-control"
                  placeholder="Google, Facebook, LinkedIn, ..."
                  type="text"
                  v-model="account.social_login"
                  v-if="account.subtype == 'login'"
                />
                </div>
              </div>
            </div>

            <div class="accordion-item" v-if="account.subtype == 'secret_key'">
              <h2 class="accordion-header">
                <button
                  class="accordion-button"
                  type="button">
                  <div>
                    <div class="fw-medium">
                      <i class="fa fa-key" aria-hidden="true"></i>
                      Key
                    </div>
                  </div>
                </button>
              </h2>
              <div class="accordion-collapse show">
                <div class="accordion-body">
                  <input
                    class="form-control"
                    type="text"
                    v-model="account.password"
                    placeholder="Secret key"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="accordion" v-if="account.type == 'account' && account.subtype == 'login'">
            <div class="accordion-item">
              <h2 class="accordion-header">
                <button
                  class="accordion-button"
                  type="button">
                  <div>
                    <div class="fw-medium">
                      <i class="fa fa-qrcode" aria-hidden="true"></i>
                      Verification code
                    </div>
                  </div>
                </button>
              </h2>
              <div class="accordion-collapse show">
                <div class="accordion-body">
                  <input
                    class="form-control"
                    placeholder="TOTP Secret"
                    type="text"
                    v-model="account.totp_secret"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="accordion">
            <div class="accordion-item">
              <h2 class="accordion-header">
                <button
                  class="accordion-button"
                  type="button">
                  <div>
                    <div class="fw-medium">
                      <i class="fa fa-message" aria-hidden="true"></i>
                      Description
                    </div>
                  </div>
                </button>
              </h2>
              <div class="accordion-collapse show">
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
              <h2 class="accordion-header">
                <button
                  class="accordion-button"
                  type="button">
                  <div>
                    <div class="fw-medium">
                      <i class="fa fa-marker" aria-hidden="true"></i>
                      Notes
                    </div>
                  </div>
                </button>
              </h2>
              <div class="accordion-collapse show">
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
        </form>

        <div class="row footer">
          <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
            <button
              class="btn btn-action btn-cta"
              :class="isCreating ? 'btn-dark' : 'btn-light'"
              type="button"
              @click="add()"
            >
              <span
                v-if="isCreating"
                class="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
              <span v-else
                ><i class="fa fa-floppy-disk"></i>
                {{ isCreating ? 'Storing ...' : 'Store' }}</span
              >
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import "../assets/bottom_sheet.css";

import {
  mapState,
  mapActions,
  mapWritableState
} from "pinia";
import {
  useUiStore,
  useAlertStore,
  useAccountsStore
} from "@/store";

export default {
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isCreating: false,
      newTag: "",
    };
  },
  mounted() {
    this.initBottomSheet("add-account-bottom-sheet");
  },
  computed: {
    ...mapWritableState(useUiStore, {
      account: "currentAddingAccount",
    }),

    ...mapState(useUiStore, {
      SIDEBAR: "SIDEBAR",
    }),
  },
  methods: {
    ...mapActions(useAlertStore, ["openAlert"]),
    ...mapActions(useAccountsStore, ["addAccount"]),
    ...mapActions(useUiStore, [
      "closeSidebar",
      "resetCurrentAddingAccount",
      "initBottomSheet",
    ]),

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

    onPlatformChange: function () {
      // if no label is set but platform is set, use display platform as label
      if (!this.account.label && this.account.platform) {
        this.account.label = this.account.displayPlatform;
      }
      // if no icon is set but platform is set, use icon from Google Favicon API
      // When there is no platform, the icon will be generated with label initials
      if (!this.account.icon && this.account.platform) {
        this.account.icon = "https://www.google.com/s2/favicons?domain=" + this.account.platform;
      }
    },

    add: async function () {
      if (!this.account.isValid()) {
        this.openAlert("Error", "Please fill all fields !", "danger");
        return;
      }

      this.isCreating = true;

      try {
        await this.addAccount(this.account);

        this.updateUI();
      } catch (error) {
        this.openAlert("Error", error.toString(), "danger");
        this.isCreating = false;
      }
    },

    focusTagInput: function () {
      this.$refs.tags.focus();
    },

    addTag: function () {
      const tags = this.account.tags.split(",").map((t) => t.trim());

      // add the tag only if it wasn't already existing
      if (tags.indexOf(this.newTag) == -1) {
        this.account.tags += (this.account.tags ? "," : "") + this.newTag;
      }

      this.newTag = "";
    },

    removeTag: function (tag) {
      let newTags = this.account.tags.split(",").map((t) => t.trim());
      newTags.splice(newTags.indexOf(tag), 1);
      this.account.tags = newTags.join(",");
    },

    updateUI: function () {
      this.isCreating = false;

      this.closeSidebar(this.SIDEBAR.ADD_ACCOUNT);

      this.openAlert(
        this.account.label,
        "Created !",
        "success",
        this.account.icon
      );

      this.resetCurrentAddingAccount();
    },
  },
};
</script>

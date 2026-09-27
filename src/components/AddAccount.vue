<template>
  <div
    id="add-account-bottom-sheet"
    class="bottom-sheet fullscreen"
    :class="visible ? 'show' : ''"
    role="dialog"
    aria-modal="true"
    aria-labelledby="addAccount_title"
    @sheetdismiss="requestClose"
    @keydown.esc="requestClose"
  >
    <div class="sheet-overlay" @click="requestClose"></div>
    <div class="content">
      <div class="header sheet-bar">
        <button
          type="button"
          class="bar-text-btn"
          @click="requestClose"
        >
          Cancel
        </button>
        <div class="drag-icon"><span></span></div>
        <h2 id="addAccount_title" class="bar-title">
          {{ account.label || 'New item' }}
        </h2>
        <button
          type="button"
          class="bar-text-btn is-strong"
          :disabled="isCreating"
          @click="add()"
        >
          {{ isCreating ? 'Adding…' : 'Add' }}
        </button>
      </div>
      <div class="body">
        <form class="row" @submit.prevent="add()">



          <!-- region_start -- Account types -->
          <h3 class="form-step">What are you saving?</h3>
          <div class="choice-grid is-two" role="group" aria-label="Item type">
            <button
              class="choice"
              :class="account.type == 'account' ? 'is-active' : ''"
              :aria-pressed="account.type == 'account' ? 'true' : 'false'"
              @click="onTypeChange('account')"
              type="button">
              <b>Credential</b><small>Login, Wi-Fi, Secret key</small>
            </button>

            <button
              class="choice"
              :class="account.type == 'card' ? 'is-active' : ''"
              :aria-pressed="account.type == 'card' ? 'true' : 'false'"
              @click="onTypeChange('card')"
              type="button">
              <b>Card</b><small>Payment, Loyalty, Gift</small>
            </button>

            <button
              class="choice"
              :class="account.type == 'document' ? 'is-active' : ''"
              :aria-pressed="account.type == 'document' ? 'true' : 'false'"
              @click="onTypeChange('document')"
              type="button">
              <b>Document</b><small>ID, Passport</small>
            </button>

            <button
              class="choice"
              :class="account.type == 'bank' ? 'is-active' : ''"
              :aria-pressed="account.type == 'bank' ? 'true' : 'false'"
              @click="onTypeChange('bank')"
              type="button">
              <b>Bank</b><small>IBAN, SWIFT</small>
            </button>
          </div>
          <!-- region_end -- Account types -->

          <!-- region_start -- Account sub types for account type Credential (account) -->
          <div class="choice-grid is-three" role="group" aria-label="Kind of credential" v-if="account.type == 'account'">
            <button
              class="choice"
              :class="account.subtype == 'login' ? 'is-active' : ''"
              :aria-pressed="account.subtype == 'login' ? 'true' : 'false'"
              @click="account.subtype = 'login'"
              type="button">
              <b>Login</b>
            </button>

            <button
              class="choice"
              :class="account.subtype == 'wifi' ? 'is-active' : ''"
              :aria-pressed="account.subtype == 'wifi' ? 'true' : 'false'"
              @click="account.subtype = 'wifi'"
              type="button">
              <b>Wi-Fi</b>
            </button>

            <button
              class="choice"
              :class="account.subtype == 'secret_key' ? 'is-active' : ''"
              :aria-pressed="account.subtype == 'secret_key' ? 'true' : 'false'"
              @click="account.subtype = 'secret_key'"
              type="button">
              <b>Secret key</b>
            </button>
          </div>
          <!-- region_end -- Account sub types for account type Credential (account) -->

          <!-- region_start -- Account sub types for account type Card -->
          <div class="choice-grid is-three" role="group" aria-label="Kind of card" v-if="account.type == 'card'">
            <button
              class="choice"
              :class="account.subtype == 'payment' ? 'is-active' : ''"
              :aria-pressed="account.subtype == 'payment' ? 'true' : 'false'"
              @click="account.subtype = 'payment'"
              type="button">
              <b>Payment</b>
            </button>

            <button
              class="choice"
              :class="account.subtype == 'loyalty' ? 'is-active' : ''"
              :aria-pressed="account.subtype == 'loyalty' ? 'true' : 'false'"
              @click="account.subtype = 'loyalty'"
              type="button">
              <b>Loyalty card</b>
            </button>

            <button
              class="choice"
              :class="account.subtype == 'gift' ? 'is-active' : ''"
              :aria-pressed="account.subtype == 'gift' ? 'true' : 'false'"
              @click="account.subtype = 'gift'"
              type="button">
              <b>Gift card</b>
            </button>
          </div>
          <!-- region_end -- Account sub types for account type Card -->

          <!-- region_start -- Card -->
          <div class="form-sheet" v-if="account.type == 'card'">
            <div class="form-field" role="group" aria-labelledby="fl-add-1">
              <span class="field-label" id="fl-add-1"><i class="fa fa-building-columns" aria-hidden="true"></i> Provider</span>
                  <input aria-labelledby="fl-add-1"
                    class="form-control"
                    autocapitalize="off"
                    autocorrect="off"
                    spellcheck="false"
                    placeholder="Provider name (e.g. HSBC bank)"
                    type="text"
                    v-model="account.platform"
                  />
            </div>
          </div>

          <div class="form-sheet" v-if="account.type == 'card'">
            <div class="form-field" role="group" aria-labelledby="fl-add-2">
              <span class="field-label" id="fl-add-2"><i class="fa fa-barcode" aria-hidden="true"></i> Number</span>
                  <input aria-labelledby="fl-add-2"
                    class="form-control"
                    autocapitalize="off"
                    autocorrect="off"
                    spellcheck="false"
                    placeholder="Card number"
                    type="text"
                    v-model="account.card_number"
                  />
            </div>
            <div class="form-field" role="group" aria-labelledby="fl-add-3">
              <span class="field-label" id="fl-add-3"><i class="fa fa-key" aria-hidden="true"></i> PIN</span>
                  <input aria-labelledby="fl-add-3"
                    class="form-control"
                    autocapitalize="off"
                    autocorrect="off"
                    spellcheck="false"
                    placeholder="PIN"
                    type="password"
                    inputmode="numeric"
                    autocomplete="off"
                    v-model="account.card_pin"
                  />
            </div>
            <div class="form-field" role="group" aria-labelledby="fl-add-4" v-if="account.subtype == 'payment' || account.subtype == 'gift'">
              <span class="field-label" id="fl-add-4"><i class="fa fa-calendar" aria-hidden="true"></i> Expiracy</span>
                  <input aria-labelledby="fl-add-4"
                    class="form-control"
                    autocapitalize="off"
                    autocorrect="off"
                    spellcheck="false"
                    placeholder="MM/YYYY"
                    type="text"
                    v-model="account.card_expiracy"
                  />
            </div>
            <div class="form-field" role="group" aria-labelledby="fl-add-5" v-if="account.subtype == 'payment'">
              <span class="field-label" id="fl-add-5"><i class="fa fa-lock" aria-hidden="true"></i> Cryptogram (CVV/CVC)</span>
                  <input aria-labelledby="fl-add-5"
                    class="form-control"
                    autocapitalize="off"
                    autocorrect="off"
                    spellcheck="false"
                    placeholder="CVC/CVV"
                    type="password"
                    inputmode="numeric"
                    autocomplete="off"
                    v-model="account.card_cryptogram"
                  />
            </div>
            <div class="form-field" role="group" aria-labelledby="fl-add-6">
              <span class="field-label" id="fl-add-6"><i class="fa fa-user" aria-hidden="true"></i> Name</span>
                  <input aria-labelledby="fl-add-6"
                    class="form-control"
                    autocapitalize="off"
                    autocorrect="off"
                    spellcheck="false"
                    placeholder="Name on card"
                    type="text"
                    v-model="account.card_name"
                  />
            </div>
          </div>

          <!-- region_start -- Card formats -->
          <div class="form-sheet" v-if="account.type == 'card' && (account.subtype == 'loyalty' || account.subtype == 'gift')">
            <button
              class="choice"
              :class="account.card_format == 'qrcode' ? 'is-active' : ''"
              @click="account.card_format = 'qrcode'"
              type="button">
              <b>QR Code</b>
            </button>

            <button
              class="choice"
              :class="account.card_format == 'barcode' ? 'is-active' : ''"
              @click="account.card_format = 'barcode'"
              type="button">
              <b>Barcode</b>
            </button>
          </div>
          <!-- region_end -- Card formats -->
          <!-- region_end -- Card -->

          <!-- region_start -- Document -->
          <div class="form-sheet" v-if="account.type == 'document'">
            <div class="form-field" role="group" aria-labelledby="fl-add-7">
              <span class="field-label" id="fl-add-7"><i class="fa fa-user" aria-hidden="true"></i> Name</span>
                  <input aria-labelledby="fl-add-7"
                    class="form-control"
                    autocapitalize="off"
                    autocorrect="off"
                    spellcheck="false"
                    placeholder="Name on card"
                    type="text"
                    v-model="account.card_name"
                  />
            </div>
            <div class="form-field" role="group" aria-labelledby="fl-add-8">
              <span class="field-label" id="fl-add-8"><i class="fa fa-hashtag" aria-hidden="true"></i> Number</span>
                  <input aria-labelledby="fl-add-8"
                    class="form-control"
                    autocapitalize="off"
                    autocorrect="off"
                    spellcheck="false"
                    placeholder="Card number"
                    type="text"
                    v-model="account.card_number"
                  />
            </div>
            <div class="form-field" role="group" aria-labelledby="fl-add-9">
              <span class="field-label" id="fl-add-9"><i class="fa fa-calendar" aria-hidden="true"></i> Expiracy</span>
                  <input aria-labelledby="fl-add-9"
                    class="form-control"
                    autocapitalize="off"
                    autocorrect="off"
                    spellcheck="false"
                    placeholder="DD/MM/YYYY"
                    type="text"
                    v-model="account.card_expiracy"
                  />
            </div>
            <div class="form-field" role="group" aria-labelledby="fl-add-10">
              <span class="field-label" id="fl-add-10"><i class="fa fa-calendar" aria-hidden="true"></i> Issued date</span>
                  <input aria-labelledby="fl-add-10"
                    class="form-control"
                    autocapitalize="off"
                    autocorrect="off"
                    spellcheck="false"
                    placeholder="DD/MM/YYYY"
                    type="text"
                    v-model="account.card_issue_date"
                  />
            </div>
            <div class="form-field" role="group" aria-labelledby="fl-add-11">
              <span class="field-label" id="fl-add-11"><i class="fa fa-building-columns" aria-hidden="true"></i> Issued by</span>
                  <input aria-labelledby="fl-add-11"
                    class="form-control"
                    autocapitalize="off"
                    autocorrect="off"
                    spellcheck="false"
                    placeholder="Issued place / authority"
                    type="text"
                    v-model="account.platform"
                  />
            </div>
          </div>
          <!-- region_end -- Document -->
          
          <div class="form-sheet" v-if="account.type == 'account'">
            <div class="form-field" role="group" aria-labelledby="fl-add-12" v-if="account.subtype == 'login' || account.subtype == 'secret_key'">
              <span class="field-label" id="fl-add-12"><i class="fa fa-globe" aria-hidden="true"></i> Platform</span>
                  <input aria-labelledby="fl-add-12"
                    class="form-control"
                    autocapitalize="off"
                    autocorrect="off"
                    spellcheck="false"
                    placeholder="e.g. bourg-palette.com"
                    type="text"
                    ref="platform"
                    @change="onPlatformChange()"
                    v-model="account.platform"
                    required
                  />
            </div>
          
            <div class="form-field" role="group" aria-labelledby="fl-add-13" v-if="account.subtype == 'login'">
              <span class="field-label" id="fl-add-13"><i class="fa fa-id-badge" aria-hidden="true"></i> Login</span>
                  <input aria-labelledby="fl-add-13"
                    class="form-control"
                    autocapitalize="off"
                    autocorrect="off"
                    spellcheck="false"
                    placeholder="name@example.com"
                    type="text"
                    v-model="account.login"
                  />
            </div>

            <div class="form-field" role="group" aria-labelledby="fl-add-14" v-if="account.subtype == 'secret_key'">
              <span class="field-label" id="fl-add-14"><i class="fa fa-hashtag" aria-hidden="true"></i> Key identifier</span>
                  <input aria-labelledby="fl-add-14"
                    class="form-control"
                    autocapitalize="off"
                    autocorrect="off"
                    spellcheck="false"
                    placeholder="Key ID (e.g. Org ID, Device ID, ...)"
                    type="text"
                    v-model="account.login"
                  />
            </div>

            <div class="form-field" role="group" aria-labelledby="fl-add-15" v-if="account.subtype == 'wifi'">
              <span class="field-label" id="fl-add-15"><i class="fa fa-wifi" aria-hidden="true"></i> Network name (SSID)</span>
                  <input aria-labelledby="fl-add-15"
                    class="form-control"
                    autocapitalize="off"
                    autocorrect="off"
                    spellcheck="false"
                    placeholder="SSID"
                    type="text"
                    v-model="account.login"
                  />
            </div>
          </div>

          <!-- region_start -- Bank -->
          <div class="form-sheet" v-if="account.type == 'bank'">
            <div class="form-field" role="group" aria-labelledby="fl-add-16">
              <span class="field-label" id="fl-add-16"><i class="fa fa-building-columns" aria-hidden="true"></i> BIC / SWIFT code</span>
                  <input aria-labelledby="fl-add-16"
                    class="form-control"
                    autocapitalize="off"
                    autocorrect="off"
                    spellcheck="false"
                    placeholder="e.g. BOUS FRPPAR"
                    type="text"
                    ref="platform"
                    v-model="account.platform"
                    required
                  />
            </div>
          
            <div class="form-field" role="group" aria-labelledby="fl-add-17">
              <span class="field-label" id="fl-add-17"><i class="fa fa-money-check" aria-hidden="true"></i> International Bank Account Number (IBAN)</span>
                  <input aria-labelledby="fl-add-17"
                    class="form-control"
                    autocapitalize="off"
                    autocorrect="off"
                    spellcheck="false"
                    placeholder="IBAN"
                    type="text"
                    v-model="account.password"
                  />
            </div>

            <div class="form-field" role="group" aria-labelledby="fl-add-18">
              <span class="field-label" id="fl-add-18"><i class="fa fa-id-badge" aria-hidden="true"></i> Account holder</span>
                  <input aria-labelledby="fl-add-18"
                    class="form-control"
                    autocapitalize="off"
                    autocorrect="off"
                    spellcheck="false"
                    placeholder="Account holder name"
                    type="text"
                    v-model="account.login"
                  />
            </div>
          </div>
          <!-- region_end -- Bank -->

          <div class="form-sheet" v-if="account.type == 'account'">
            <div class="form-field" role="group" aria-labelledby="fl-add-19" v-if="account.subtype == 'login'">
              <span class="field-label" id="fl-add-19"><i class="fa fa-lock" aria-hidden="true"></i> Password</span>
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
                      Passwordless
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
                    >Jisme derives this password from your master password, so nothing is stored. Open the item after saving to reveal it.</small
                  >

                <hr class="my-4" />

                <div class="input-group" v-show="!account.is_password_less">
                    <input
                      class="form-control"
                      autocapitalize="off"
                      autocorrect="off"
                      spellcheck="false"
                      :type="isPasswordRevealed ? 'text' : 'password'"
                      autocomplete="new-password"
                      aria-label="Password"
                      aria-describedby="addAccount_passwordHelp"
                      v-model="account.password"
                      placeholder="Password"
                    />
                    <button
                      class="btn btn-light"
                      type="button"
                      :aria-label="isPasswordRevealed ? 'Hide password' : 'Show password'"
                      :aria-pressed="isPasswordRevealed ? 'true' : 'false'"
                      @click="isPasswordRevealed = !isPasswordRevealed"
                    >
                      <i class="fa" :class="isPasswordRevealed ? 'fa-eye-slash' : 'fa-eye'" aria-hidden="true"></i>
                    </button>
                    <button
                      class="btn btn-light"
                      type="button"
                      @click="onGeneratePassword()"
                    >
                      <i class="fa fa-wand-magic-sparkles" aria-hidden="true"></i> Generate
                    </button>
                </div>
                <small
                    id="addAccount_passwordHelp"
                    class="form-text text-muted"
                    v-show="!account.is_password_less"
                    >Tap Generate for a strong random password.</small>
                
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
                  autocapitalize="off"
                  autocorrect="off"
                  spellcheck="false"
                  type="text"
                  placeholder="A hint only you understand"
                  v-model="account.password_clue"
                />

                <hr class="my-4" />

                <label class="form-label" for="addAccount_social_login_input">
                  <i class="fa fa-mobile-screen" aria-hidden="true"></i> Social login
                  </label>
                <input
                  id="addAccount_social_login_input"
                  class="form-control"
                  autocapitalize="off"
                  autocorrect="off"
                  spellcheck="false"
                  placeholder="Google, Facebook, LinkedIn, ..."
                  type="text"
                  v-model="account.social_login"/>
            </div>

            <div class="form-field" role="group" aria-labelledby="fl-add-20" v-if="account.subtype == 'wifi'">
              <span class="field-label" id="fl-add-20"><i class="fa fa-lock" aria-hidden="true"></i> Password</span>
                  <input
                    class="form-control"
                    autocapitalize="off"
                    autocorrect="off"
                    spellcheck="false"
                    :type="isPasswordRevealed ? 'text' : 'password'"
                    autocomplete="new-password"
                    aria-label="Wi-Fi password"
                    v-model="account.password"
                    placeholder="Password"
                  />

                  <hr class="my-4" />

                  <label class="form-label" for="password_security_mode_input">
                    <i class="fa fa-key" aria-hidden="true"></i>
                    Security mode
                  </label>
                  <input
                    id="password_security_mode_input"
                    class="form-control"
                    autocapitalize="off"
                    autocorrect="off"
                    spellcheck="false"
                    type="text"
                    placeholder="WPA, WEP, None"
                    v-model="account.password_clue"
                  />
            </div>

            <div class="form-field" role="group" aria-labelledby="fl-add-21" v-if="account.subtype == 'secret_key'">
              <span class="field-label" id="fl-add-21"><i class="fa fa-key" aria-hidden="true"></i> Key</span>
                  <input
                    class="form-control"
                    autocapitalize="off"
                    autocorrect="off"
                    spellcheck="false"
                    :type="isPasswordRevealed ? 'text' : 'password'"
                    autocomplete="off"
                    aria-label="Secret key"
                    v-model="account.password"
                    placeholder="Secret key"
                  />
            </div>
          </div>

          <div class="form-sheet" v-if="account.type == 'account' && account.subtype == 'login'">
            <div class="form-field" role="group" aria-labelledby="fl-add-22">
              <span class="field-label" id="fl-add-22"><i class="fa fa-qrcode" aria-hidden="true"></i> Verification code</span>
                  <input
                    class="form-control"
                    autocapitalize="off"
                    autocorrect="off"
                    spellcheck="false"
                    placeholder="TOTP Secret"
                    aria-label="TOTP secret"
                    type="password"
                    autocomplete="off"
                    v-model="account.totp_secret"
                  />
            </div>
          </div>

          <!-- region_start -- Main information -->
          <div class="form-sheet">
            <div class="form-field" role="group" aria-labelledby="fl-add-23">
              <span class="field-label" id="fl-add-23"><i class="fa fa-tag" aria-hidden="true"></i> Name</span>
                  <input
                    id="addAccount_input_label"
                    class="form-control"
                    autocapitalize="off"
                    autocorrect="off"
                    spellcheck="false"
                    placeholder="e.g. Pokemon"
                    aria-label="Name"
                    aria-describedby="addAccount_labelHelp"
                    type="text"
                    ref="label"
                    v-model="account.label"
                    required
                  />
                  <small id="addAccount_labelHelp" class="form-text text-muted">Leave empty to use the platform's name.</small>

                  <hr class="my-4" />

                  <label class="form-label" for="addAccount_input_new_tag"
                    ><i class="fa fa-tags" aria-hidden="true"></i> Tags</label
                  >
                  <div class="form-control tags tags-input" v-show="account.tags" @click="focusTagInput()">
                    <button
                      type="button"
                      class="badge rounded-pill"
                      v-for="(tag, tagIndex) in account.tags.split(',').filter(t => t)"
                      v-bind:key="tagIndex"
                      :aria-label="'Remove tag ' + tag"
                      @click.stop="removeTag(tag)"
                    >
                      {{ tag }}
                      <i class="fa fa-close" aria-hidden="true"></i>
                    </button>
                  </div>
                  <input
                    ref="tags"
                    id="addAccount_input_new_tag"
                    class="form-control tags-new-input"
                    placeholder="Tag"
                    type="text"
                    v-model="newTag"
                    enterkeyhint="done"
                    @keyup.enter="addTag()"
                    @blur="addTag()"
                  />

                  <hr class="my-4" />

                  <label class="form-label" for="addAccount_icon"
                    ><i class="fa fa-image" aria-hidden="true"></i> Icon</label
                  >
                  <input
                    id="addAccount_icon"
                    class="form-control"
                    autocapitalize="off"
                    autocorrect="off"
                    spellcheck="false"
                    placeholder="Icon URL"
                    type="text"
                    v-model="account.icon"
                  />
            </div>
          </div>
          <!-- region_end -- Main information -->

          <div class="form-sheet">
            <div class="form-field" role="group" aria-labelledby="fl-add-24">
              <span class="field-label" id="fl-add-24"><i class="fa fa-message" aria-hidden="true"></i> Description</span>
                  <textarea aria-labelledby="fl-add-24"
                    class="form-control"
                    type="text"
                    v-model="account.description"
                    rows="3"
                  ></textarea>
            </div>

            <div class="form-field" role="group" aria-labelledby="fl-add-25">
              <span class="field-label" id="fl-add-25"><i class="fa fa-marker" aria-hidden="true"></i> Notes</span>
                  <textarea aria-labelledby="fl-add-25"
                    class="form-control"
                    type="text"
                    v-model="account.notes"
                    rows="6"
                  ></textarea>
            </div>
          </div>
        </form>

        <div class="footer is-pinned">
          <div>
            <button
              class="btn btn-action btn-cta"
              :class="isCreating ? 'is-busy' : ''"
              :disabled="isCreating"
              type="button"
              @click="add()"
            >
              <span
                v-if="isCreating"
                class="spinner-border spinner-border-sm"
                aria-hidden="true"
              ></span>
              <span v-if="isCreating">Saving…</span>
              <span v-else
                ><i class="fa fa-lock" aria-hidden="true"></i>
                Save to vault</span
              >
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { faviconUrl, displayIcon } from "../utils/icon.js";
import "../assets/bottom_sheet.css";

import {
  mapState,
  mapActions,
  mapWritableState
} from "pinia";
import {
  useUiStore,
  useAlertStore,
  useAccountsStore,
  useNetworkStore
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
      isPasswordRevealed: false,
    };
  },
  mounted() {
    this.initBottomSheet("add-account-bottom-sheet");
  },
  watch: {
    visible(isVisible) {
      // Move focus into the dialog so Esc, screen readers and keyboards land inside it
      if (isVisible) {
        this.$nextTick(() => {
          const cancel = this.$el.querySelector('.bar-text-btn');
          cancel && cancel.focus({ preventScroll: true });
        });
      }
    },
  },
  computed: {
    ...mapWritableState(useUiStore, {
      account: "currentAddingAccount",
    }),

    ...mapState(useUiStore, {
      SIDEBAR: "SIDEBAR",
    }),
    ...mapState(useNetworkStore, [
      'isOffline'
    ]),
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
        this.account.icon = faviconUrl(this.account.platform);
      }
    },

    // Anything typed that would be lost on close
    isDirty: function () {
      const fields = ['label', 'platform', 'login', 'password', 'totp_secret', 'card_number', 'card_pin', 'card_name', 'description', 'notes'];
      return fields.some(field => this.account[field]) || !!this.newTag;
    },

    requestClose: function () {
      if (!this.visible || this.isCreating) {
        return;
      }

      if (this.isDirty() && !confirm("Discard this new item? What you typed will be lost.")) {
        return;
      }

      this.isPasswordRevealed = false;
      this.newTag = "";
      this.closeSidebar(this.SIDEBAR.ADD_ACCOUNT);
      this.resetCurrentAddingAccount();
    },

    onGeneratePassword: function () {
      this.account.generatePassword();
      // The user asked for it: show what was generated
      this.isPasswordRevealed = true;
    },

    add: async function () {
      // Fill the label/icon from the platform before validating
      this.onPlatformChange();
      this.addTag();

      if (!this.account.isValid()) {
        this.openAlert("Name this item", "Add a name or a platform so you can find it again.", "danger");
        this.$refs.label && this.$refs.label.focus();
        return;
      }

      this.isCreating = true;

      try {
        await this.addAccount(this.account);

        // If offline, message should reflect queued sync
        const isOffline = this.isOffline;
        this.openAlert(
          isOffline ? 'Saved locally — will sync when back online.' : 'Saved to vault',
          this.account.label || 'Account',
          isOffline ? 'info' : 'success',
          this.account.icon
        );

        this.updateUI();
      } catch (error) {
        const isOffline = this.isOffline;
        this.openAlert(
          error.name || (isOffline ? 'Offline' : 'Error'),
          error.message || error.reason || (typeof error === 'string' ? error : ''),
          isOffline ? 'warning' : 'danger'
        );
        this.isCreating = false;
      }
    },

    focusTagInput: function () {
      this.$refs.tags.focus();
    },

    addTag: function () {
      if (!this.newTag || !this.newTag.trim()) {
        this.newTag = "";
        return;
      }

      this.newTag = this.newTag.trim();
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
      this.isPasswordRevealed = false;

      this.closeSidebar(this.SIDEBAR.ADD_ACCOUNT);

      this.resetCurrentAddingAccount();
    },
  },
};
</script>

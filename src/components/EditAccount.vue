<template>
  <div
    id="edit-account-bottom-sheet"
    class="bottom-sheet fullscreen"
    :class="visible ? 'show' : ''"
    role="dialog"
    aria-modal="true"
    aria-labelledby="editAccount_title"
    @sheetdismiss="closeAccountEditing"
    @keydown.esc="closeAccountEditing"
  >
    <div class="sheet-overlay" @click="closeAccountEditing"></div>
    <div class="content">
      <div class="header sheet-bar">
        <button
          type="button"
          class="bottom-sheet-close bottom-sheet-back"
          aria-label="Back"
          @click="closeAccountEditing"
        >
          <i class="fa fa-arrow-left" aria-hidden="true"></i>
        </button>
        <div
          class="bottom-sheet-action-menu"
          ref="actionMenu"
        >
          <button
            type="button"
            class="bottom-sheet-close bottom-sheet-menu-toggle"
            :aria-expanded="isActionMenuOpen ? 'true' : 'false'"
            aria-haspopup="true"
            aria-label="Account options"
            @click.stop="toggleActionMenu"
          >
            <i class="fa fa-ellipsis-h" aria-hidden="true"></i>
          </button>
          <transition name="fade">
            <ul
              v-if="isActionMenuOpen"
              class="action-menu"
              role="menu"
              @click.stop
            >
              <li role="none">
                <button
                  type="button"
                  role="menuitem"
                  @click="addToFavorite()"
                >
                  <i
                    class="fa fa-thumbtack"
                    aria-hidden="true"
                  ></i>
                  {{ account.isPinned ? 'Remove from favorites' : 'Add to favorites' }}
                </button>
              </li>
              <li role="none">
                <button
                  type="button"
                  role="menuitem"
                  :class="isDeleting ? 'is-busy' : ''"
                  @click="remove()"
                >
                  <i class="fa fa-trash" aria-hidden="true"></i>
                  {{ isDeleting ? "Deleting…" : "Delete" }}
                </button>
              </li>
              <li role="none">
                <button
                  type="button"
                  role="menuitem"
                  :class="isDuplicating ? 'is-busy' : ''"
                  @click="duplicate()"
                >
                  <i class="fa fa-copy" aria-hidden="true"></i>
                  {{ isDuplicating ? 'Duplicating…' : 'Duplicate' }}
                </button>
              </li>
            </ul>
          </transition>
        </div>
        <div class="drag-icon"><span></span></div>
      </div>
      <div class="body">
        <section class="hero-env" aria-labelledby="editAccount_title">
          <div class="hero-return">
            <img src="../assets/logo_medium.png" alt="" width="16" height="16">
            Jisme vault
          </div>
          <VaultStatus class="hero-state" />
          <div class="hero-win win">
            <span class="logo-sq hero-logo" aria-hidden="true">
              <img v-if="account.icon && !isIconBroken" :src="displayIcon(account.icon)" alt="" @error="isIconBroken = true">
              <span v-else class="initial">{{ (account.label || '?').trim().charAt(0).toUpperCase() }}</span>
            </span>
            <div class="hero-text">
              <h2 id="editAccount_title" class="bottom-sheet-title">{{ account.label || account.displayPlatform || 'Untitled' }}</h2>
              <small class="carbon">{{ account.displayType }} · {{ account.displaySubtype }}</small>
            </div>
          </div>
        </section>

            <!-- region_start -- Account type: card -->
            <div class="code-plate" v-if="displayCodeImage">
              <div>
                <div class="text-center">
                  <QrcodeVue
                    v-if="account.cardFormat == 'qrcode'"
                    :value="account.rawCardNumber"
                    @click="fullscreenBarcodeVisible = true"
                    role="button"
                    tabindex="0"
                    aria-label="Show code full screen"
                    @keydown.enter="fullscreenBarcodeVisible = true"
                    class="clickable"/>

                  <img
                    v-if="account.cardFormat == 'barcode'"
                    ref="barcodeEl"
                    id="barcodeEl"
                    @click="fullscreenBarcodeVisible = true"
                    role="button"
                    tabindex="0"
                    aria-label="Show code full screen"
                    @keydown.enter="fullscreenBarcodeVisible = true"
                    class="clickable"/>

                    <FullscreenBarcode
                      :visible="fullscreenBarcodeVisible"
                      :number="account.rawCardNumber"
                      :format="barcodeFormat"
                      @close="fullscreenBarcodeVisible = false"
                    />
                </div>
              </div>
              <p class="code-hint">{{ account.subtype == 'wifi' ? 'Let a guest scan this to join the network. Tap to enlarge.' : 'Tap the code to show it full screen at the till.' }}</p>
            </div>


        <section class="quick-sheet" aria-label="Copy and reveal">
          <!-- Credentials: login -->
          <template v-if="account.type == 'account' && account.subtype == 'login'">
            <div class="q-row" v-if="account.login">
              <div class="q-field"><span class="q-label">Login</span><div class="q-value carbon">{{ account.login }}</div></div>
              <button type="button" class="ibtn" aria-label="Copy login" @click="copyValue(account.login, 'Login')"><i class="fa-solid fa-copy" aria-hidden="true"></i></button>
            </div>

            <div class="q-row" v-if="!account.is_password_less && account.password">
              <div class="q-field"><span class="q-label">Password</span><SecretStrip :value="account.password" label="password" /></div>
              <button type="button" class="ibtn" aria-label="Copy password" @click="copyValue(account.password, 'Password')"><i class="fa-solid fa-copy" aria-hidden="true"></i></button>
            </div>

            <div class="q-row" v-else-if="account.is_password_less && !account.social_login">
              <div class="q-field">
                <span class="q-label">Password <span class="q-note">derived on this device</span></span>
                <SecretStrip v-if="passwordLess.generatedPassword" :value="passwordLess.generatedPassword" label="password" />
                <form v-else class="derive-form" @submit.prevent="generatePasswordLess()">
                  <input
                    class="form-control"
                    type="password"
                    autocomplete="current-password"
                    autocapitalize="off"
                    autocorrect="off"
                    spellcheck="false"
                    placeholder="Master password"
                    aria-label="Master password"
                    v-model="passwordLess.masterPassword" />
                  <button type="submit" class="btn btn-primary" :disabled="!passwordLess.masterPassword || passwordLess.isGenerating">
                    {{ passwordLess.isGenerating ? 'Deriving…' : 'Derive' }}
                  </button>
                </form>
              </div>
              <button v-if="passwordLess.generatedPassword" type="button" class="ibtn" aria-label="Copy password" @click="copyValue(passwordLess.generatedPassword, 'Password')"><i class="fa-solid fa-copy" aria-hidden="true"></i></button>
            </div>

            <div class="q-row" v-else-if="!account.is_password_less && account.password_clue">
              <div class="q-field"><span class="q-label">Password <span class="q-note">not saved, clue only</span></span><div class="q-value">{{ account.password_clue }}</div></div>
            </div>

            <div class="q-row" v-else-if="account.social_login">
              <div class="q-field"><span class="q-label">Signs in with</span><div class="q-value">{{ account.social_login.split(',').join(', ') }}</div></div>
            </div>

            <div class="q-row" v-if="account.totp_secret">
              <div class="q-field">
                <span class="q-label">Verification code</span>
                <div class="q-code carbon" :class="{ 'is-invalid': !hasValidTotp }">{{ formattedTotpToken }}</div>
              </div>
              <TotpRing v-if="hasValidTotp" :remaining="totpSecondsRemaining" />
              <button type="button" class="ibtn" aria-label="Copy verification code" :disabled="!hasValidTotp" @click="copyValue(totpToken, 'Verification code')"><i class="fa-solid fa-copy" aria-hidden="true"></i></button>
            </div>

            <div class="q-row" v-if="account.platform">
              <div class="q-field"><span class="q-label">Platform</span><div class="q-value carbon">{{ account.platform }}</div></div>
              <button type="button" class="ibtn" :aria-label="'Open ' + account.platform" @click="openLink(account.platform)"><i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></button>
            </div>
          </template>

          <!-- Credentials: Wi-Fi -->
          <template v-if="account.type == 'account' && account.subtype == 'wifi'">
            <div class="q-row" v-if="account.login">
              <div class="q-field"><span class="q-label">Network (SSID)</span><div class="q-value carbon">{{ account.login }}</div></div>
              <button type="button" class="ibtn" aria-label="Copy network name" @click="copyValue(account.login, 'Network name')"><i class="fa-solid fa-copy" aria-hidden="true"></i></button>
            </div>
            <div class="q-row">
              <div class="q-field"><span class="q-label">Password</span><SecretStrip :value="account.password" label="Wi-Fi password" /></div>
              <button type="button" class="ibtn" aria-label="Copy Wi-Fi password"  v-if="account.password" @click="copyValue(account.password, 'Wi-Fi password')"><i class="fa-solid fa-copy" aria-hidden="true"></i></button>
            </div>
          </template>

          <!-- Credentials: secret key -->
          <template v-if="account.type == 'account' && account.subtype == 'secret_key'">
            <div class="q-row" v-if="account.login">
              <div class="q-field"><span class="q-label">Key identifier</span><div class="q-value carbon">{{ account.login }}</div></div>
              <button type="button" class="ibtn" aria-label="Copy key identifier" @click="copyValue(account.login, 'Key identifier')"><i class="fa-solid fa-copy" aria-hidden="true"></i></button>
            </div>
            <div class="q-row">
              <div class="q-field"><span class="q-label">Key</span><SecretStrip :value="account.password" label="key" /></div>
              <button type="button" class="ibtn" aria-label="Copy key" v-if="account.password" @click="copyValue(account.password, 'Key')"><i class="fa-solid fa-copy" aria-hidden="true"></i></button>
            </div>
          </template>

          <!-- Cards -->
          <template v-if="account.type == 'card'">
            <div class="q-row" v-if="account.card_number">
              <div class="q-field">
                <span class="q-label">Number</span>
                <SecretStrip v-if="account.subtype == 'payment'" :value="account.card_number" label="card number" :hint="mask(account.card_number, 4)" />
                <div v-else class="q-value carbon">{{ account.card_number }}</div>
              </div>
              <button type="button" class="ibtn" aria-label="Copy card number" @click="copyValue(account.card_number, 'Card number')"><i class="fa-solid fa-copy" aria-hidden="true"></i></button>
            </div>
            <div class="q-pair" v-if="account.subtype == 'payment' && (account.card_expiracy || account.card_cryptogram)">
              <div class="q-row" v-if="account.card_expiracy">
                <div class="q-field"><span class="q-label">Expires</span><div class="q-value carbon">{{ account.card_expiracy }}</div></div>
              </div>
              <div class="q-row" v-if="account.card_cryptogram">
                <div class="q-field"><span class="q-label">CVV</span><SecretStrip :value="account.card_cryptogram" label="CVV" hint="Hold" /></div>
              </div>
            </div>
            <div class="q-row" v-if="account.card_pin">
              <div class="q-field"><span class="q-label">PIN</span><SecretStrip :value="account.card_pin" label="PIN" /></div>
            </div>
            <div class="q-row" v-if="account.card_name">
              <div class="q-field"><span class="q-label">Name on card</span><div class="q-value carbon">{{ account.card_name }}</div></div>
            </div>
          </template>

          <!-- Bank -->
          <template v-if="account.type == 'bank'">
            <div class="q-row">
              <div class="q-field"><span class="q-label">IBAN</span><SecretStrip :value="account.password" label="IBAN" :hint="account.password ? mask(account.password, 4) : ''" /></div>
              <button type="button" class="ibtn" aria-label="Copy IBAN" v-if="account.password" @click="copyValue(account.password.replace(/\s+/g, ''), 'IBAN')"><i class="fa-solid fa-copy" aria-hidden="true"></i></button>
            </div>
            <div class="q-row" v-if="account.platform">
              <div class="q-field"><span class="q-label">BIC / SWIFT</span><div class="q-value carbon">{{ account.platform }}</div></div>
              <button type="button" class="ibtn" aria-label="Copy BIC" @click="copyValue(account.platform, 'BIC')"><i class="fa-solid fa-copy" aria-hidden="true"></i></button>
            </div>
            <div class="q-row" v-if="account.login">
              <div class="q-field"><span class="q-label">Account holder</span><div class="q-value carbon">{{ account.login }}</div></div>
            </div>
          </template>

          <!-- Documents -->
          <template v-if="account.type == 'document'">
            <div class="q-row" v-if="account.card_number">
              <div class="q-field"><span class="q-label">Document number</span><SecretStrip :value="account.card_number" label="document number" :hint="mask(account.card_number, 3)" /></div>
              <button type="button" class="ibtn" aria-label="Copy document number" @click="copyValue(account.card_number, 'Document number')"><i class="fa-solid fa-copy" aria-hidden="true"></i></button>
            </div>
            <div class="q-row" v-if="account.card_name">
              <div class="q-field"><span class="q-label">Name</span><div class="q-value carbon">{{ account.card_name }}</div></div>
            </div>
            <div class="q-row" v-if="account.card_expiracy">
              <div class="q-field"><span class="q-label">Expires</span><div class="q-value carbon">{{ account.card_expiracy }}</div></div>
            </div>
          </template>
        </section>

        <button
          type="button"
          class="details-toggle"
          :aria-expanded="isDetailsOpen ? 'true' : 'false'"
          aria-controls="editAccount_details"
          @click="isDetailsOpen = !isDetailsOpen">
          <span class="details-text">
            <b>Details &amp; edit</b>
            <span class="details-sum">
              <template v-if="account.notes">Notes ·</template>
              <span class="chip" v-for="tag in account.tags.split(',').filter(t => t).slice(0, 3)" :key="tag">{{ tag }}</span>
              <template v-if="account.tags">·</template>
              Created {{ createdDate }}
            </span>
          </span>
          <i class="fa-solid fa-chevron-down details-chevron" aria-hidden="true"></i>
        </button>

        <div id="editAccount_details" class="details-body" v-show="isDetailsOpen">
        <form class="row" @submit.prevent>

            <div class="form-sheet" v-if="account.type == 'card'">
              <div class="form-field" role="group" aria-labelledby="fl-edit-1">
                <span class="field-label" id="fl-edit-1"><i class="fa fa-barcode" aria-hidden="true"></i> Number</span>
                    <div class="input-group">
                      <button
                        class="btn btn-light"
                        type="button"
                        @click="copyToClipboard('editAccount_input_card_number_hidden')"
                        aria-label="Copy"
                      >
                        <i class="fa fa-copy" aria-hidden="true"></i>
                      </button>
                      <input aria-labelledby="fl-edit-1"
                        class="form-control"
                        autocapitalize="off"
                        autocorrect="off"
                        spellcheck="false"
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

              <div class="form-field" role="group" aria-labelledby="fl-edit-2">
                <span class="field-label" id="fl-edit-2"><i class="fa fa-key" aria-hidden="true"></i> PIN</span>
                    <div class="input-group">
                      <input aria-labelledby="fl-edit-2"
                        class="form-control"
                        autocapitalize="off"
                        autocorrect="off"
                        spellcheck="false"
                        placeholder="PIN (e.g. 3252)"
                        :type="isRevealed('card_pin') ? 'text' : 'password'"
                        inputmode="numeric"
                        autocomplete="off"
                        v-model="account.card_pin"
                      />
                      <button
                        class="btn btn-light"
                        type="button"
                        :aria-label="isRevealed('card_pin') ? 'Hide PIN' : 'Show PIN'"
                        :aria-pressed="isRevealed('card_pin') ? 'true' : 'false'"
                        @click="toggleReveal('card_pin')"
                      >
                        <i class="fa" :class="isRevealed('card_pin') ? 'fa-eye-slash' : 'fa-eye'" aria-hidden="true"></i>
                      </button>
                    </div>
              </div>

              <div class="form-field" role="group" aria-labelledby="fl-edit-3" v-if="account.subtype == 'payment' || account.subtype == 'gift'">
                <span class="field-label" id="fl-edit-3"><i class="fa fa-calendar" aria-hidden="true"></i> Expiry</span>
                    <input aria-labelledby="fl-edit-3"
                      class="form-control"
                      autocapitalize="off"
                      autocorrect="off"
                      spellcheck="false"
                      placeholder="Expiry (e.g. 01/32)"
                      type="text"
                      v-model="account.card_expiracy"
                    />
              </div>

              <div class="form-field" role="group" aria-labelledby="fl-edit-4" v-if="account.subtype == 'payment'">
                <span class="field-label" id="fl-edit-4"><i class="fa fa-lock" aria-hidden="true"></i> Cryptogram (CVV/CVC)</span>
                    <div class="input-group">
                      <input aria-labelledby="fl-edit-4"
                        class="form-control"
                        autocapitalize="off"
                        autocorrect="off"
                        spellcheck="false"
                        placeholder="Cryptogram (CVV/CVC)"
                        :type="isRevealed('card_cryptogram') ? 'text' : 'password'"
                        inputmode="numeric"
                        autocomplete="off"
                        v-model="account.card_cryptogram"
                      />
                      <button
                        class="btn btn-light"
                        type="button"
                        :aria-label="isRevealed('card_cryptogram') ? 'Hide cryptogram' : 'Show cryptogram'"
                        :aria-pressed="isRevealed('card_cryptogram') ? 'true' : 'false'"
                        @click="toggleReveal('card_cryptogram')"
                      >
                        <i class="fa" :class="isRevealed('card_cryptogram') ? 'fa-eye-slash' : 'fa-eye'" aria-hidden="true"></i>
                      </button>
                    </div>
              </div>

              <div class="form-field" role="group" aria-labelledby="fl-edit-5">
                <span class="field-label" id="fl-edit-5"><i class="fa fa-user" aria-hidden="true"></i> Name</span>
                    <input aria-labelledby="fl-edit-5"
                      class="form-control"
                      autocapitalize="off"
                      autocorrect="off"
                      spellcheck="false"
                      placeholder="Name on card (e.g. M Gandhi)"
                      type="text"
                      v-model="account.card_name"
                    />
              </div>
            </div>
            
            <!-- region_start -- Card formats -->
            <div class="form-sheet" v-if="account.type == 'card' && (account.subtype == 'loyalty' || account.subtype == 'gift')">
              <button
                class="choice"
                :class="account.cardFormat == 'qrcode' ? 'is-active' : ''"
                @click="account.cardFormat = 'qrcode'"
                type="button">
                <b>QR Code</b>
              </button>

              <button
                class="choice"
                :class="account.cardFormat == 'barcode' ? 'is-active' : ''"
                @click="account.cardFormat = 'barcode'"
                type="button">
                <b>Barcode</b>
              </button>
            </div>
            <!-- region_end -- Card formats -->
            <!-- region_end -- Cards -->

            <!-- region_start -- Account type: Document -->
            <div class="form-sheet" v-if="account.type == 'document'">
              <div class="form-field" role="group" aria-labelledby="fl-edit-6">
                <span class="field-label" id="fl-edit-6"><i class="fa fa-user" aria-hidden="true"></i> Name</span>
                    <input aria-labelledby="fl-edit-6"
                      class="form-control"
                      autocapitalize="off"
                      autocorrect="off"
                      spellcheck="false"
                      placeholder="Name on card (e.g. M Gandhi)"
                      type="text"
                      v-model="account.card_name"
                    />
              </div>

              <div class="form-field" role="group" aria-labelledby="fl-edit-7">
                <span class="field-label" id="fl-edit-7"><i class="fa fa-barcode" aria-hidden="true"></i> Number</span>
                    <div class="input-group">
                      <button
                        class="btn btn-light"
                        type="button"
                        @click="copyToClipboard('editAccount_input_card_number_hidden')"
                        aria-label="Copy"
                      >
                        <i class="fa fa-copy" aria-hidden="true"></i>
                      </button>
                      <input aria-labelledby="fl-edit-7"
                        class="form-control"
                        autocapitalize="off"
                        autocorrect="off"
                        spellcheck="false"
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

              <div class="form-field" role="group" aria-labelledby="fl-edit-8">
                <span class="field-label" id="fl-edit-8"><i class="fa fa-calendar" aria-hidden="true"></i> Expiry</span>
                    <input aria-labelledby="fl-edit-8"
                      class="form-control"
                      autocapitalize="off"
                      autocorrect="off"
                      spellcheck="false"
                      placeholder="DD/MM/YYYY"
                      type="text"
                      v-model="account.card_expiracy"
                    />
              </div>

              <div class="form-field" role="group" aria-labelledby="fl-edit-9">
                <span class="field-label" id="fl-edit-9"><i class="fa fa-calendar" aria-hidden="true"></i> Issued date</span>
                    <input aria-labelledby="fl-edit-9"
                      class="form-control"
                      autocapitalize="off"
                      autocorrect="off"
                      spellcheck="false"
                      placeholder="DD/MM/YYYY"
                      type="text"
                      v-model="account.card_issue_date"
                    />
              </div>

              <div class="form-field" role="group" aria-labelledby="fl-edit-10">
                <span class="field-label" id="fl-edit-10"><i class="fa fa-building-columns" aria-hidden="true"></i> Issued by</span>
                    <input aria-labelledby="fl-edit-10"
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
            <!-- region_end -- Account type: Document -->

            <!-- region_start -- Account type: Login -->
            <div class="form-sheet" v-if="account.type == 'account'">
              <div class="form-field" role="group" aria-labelledby="fl-edit-11" v-if="account.subtype == 'login'">
                <span class="field-label" id="fl-edit-11"><i class="fa fa-id-badge" aria-hidden="true"></i> Login</span>
                    <div class="input-group">
                      <button
                        class="btn btn-light"
                        type="button"
                        @click="copyToClipboard('editAccount_input_login_hidden')"
                        aria-label="Copy"
                      >
                        <i class="fa fa-copy" aria-hidden="true"></i>
                      </button>
                      <input
                        id="editAccount_input_login"
                        class="form-control"
                        autocapitalize="off"
                        autocorrect="off"
                        spellcheck="false"
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

              <div class="form-field" role="group" aria-labelledby="fl-edit-12" v-if="account.subtype == 'secret_key'">
                <span class="field-label" id="fl-edit-12"><i class="fa fa-id-badge" aria-hidden="true"></i> Key identifier</span>
                    <div class="input-group">
                      <button
                        class="btn btn-light"
                        type="button"
                        @click="copyToClipboard('editAccount_input_login_hidden')"
                        aria-label="Copy"
                      >
                        <i class="fa fa-copy" aria-hidden="true"></i>
                      </button>
                      <input
                        id="editAccount_input_login"
                        class="form-control"
                        autocapitalize="off"
                        autocorrect="off"
                        spellcheck="false"
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

              <div class="form-field" role="group" aria-labelledby="fl-edit-13" v-if="account.subtype == 'wifi'">
                <span class="field-label" id="fl-edit-13"><i class="fa fa-wifi" aria-hidden="true"></i> Network name (SSID)</span>
                    <div class="input-group">
                      <button
                        class="btn btn-light"
                        type="button"
                        @click="copyToClipboard('editAccount_input_login_hidden')"
                        aria-label="Copy"
                      >
                        <i class="fa fa-copy" aria-hidden="true"></i>
                      </button>
                      <input
                        id="editAccount_input_login"
                        class="form-control"
                        autocapitalize="off"
                        autocorrect="off"
                        spellcheck="false"
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

              <div class="form-field" role="group" aria-labelledby="fl-edit-14" v-if="account.subtype == 'login'">
                <span class="field-label" id="fl-edit-14"><i class="fa fa-lock" aria-hidden="true"></i> Password</span>
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
                        autocapitalize="off"
                        autocorrect="off"
                        spellcheck="false"
                        type="password"
                        placeholder="Master password"
                        autocomplete="current-password"
                        aria-describedby="editAccount_input_passwordlessHelp_masterPassword"
                        v-model="passwordLess.masterPassword"
                        @keyup.enter="generatePasswordLess()"
                      />
                      <button
                        class="btn btn-light"
                        :class="passwordLess.masterPassword ? 'is-active' : ''"
                        type="button"
                        :disabled="!passwordLess.masterPassword || passwordLess.isGenerating"
                        @click="generatePasswordLess()"
                      >
                        <i class="fa" :class="passwordLess.isGenerating ? 'fa-spinner fa-spin' : 'fa-key'" aria-hidden="true"></i>
                        {{ passwordLess.isGenerating ? 'Deriving…' : 'Derive' }}
                      </button>
                    </div>

                    <div class="input-group mb-3" v-if="account.is_password_less && passwordLess.generatedPassword">
                      <button
                        class="btn btn-light"
                        type="button"
                        @click="copyToClipboard('editAccount_input_passwordless_generatedPassword_hidden')"
                        aria-label="Copy"
                      >
                        <i class="fa fa-copy" aria-hidden="true"></i>
                      </button>

                      <input
                        id="editAccount_input_passwordless_generatedPassword"
                        class="form-control"
                        autocapitalize="off"
                        autocorrect="off"
                        spellcheck="false"
                        :type="isRevealed('passwordless') ? 'text' : 'password'"
                        aria-label="Derived password"
                        v-model="passwordLess.generatedPassword"
                        readonly
                      />
                      <button
                        class="btn btn-light"
                        type="button"
                        :aria-label="isRevealed('passwordless') ? 'Hide password' : 'Show password'"
                        :aria-pressed="isRevealed('passwordless') ? 'true' : 'false'"
                        @click="toggleReveal('passwordless')"
                      >
                        <i class="fa" :class="isRevealed('passwordless') ? 'fa-eye-slash' : 'fa-eye'" aria-hidden="true"></i>
                      </button>
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
                        autocapitalize="off"
                        autocorrect="off"
                        spellcheck="false"
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
                      Your master password never leaves this device. Jisme derives this site's password from it, the platform and your login.
                    </small>

                    <div class="input-group mb-3" v-if="!account.is_password_less">
                      <button
                        class="btn btn-light"
                        type="button"
                        @click="copyToClipboard('editAccount_input_password_generatedPassword_hidden')"
                        aria-label="Copy"
                        v-if="account.password"
                      >
                        <i class="fa fa-copy" aria-hidden="true"></i>
                      </button>
                      <input
                        id="editAccount_input_password"
                        class="form-control"
                        autocapitalize="off"
                        autocorrect="off"
                        spellcheck="false"
                        :type="isRevealed('password') ? 'text' : 'password'"
                        autocomplete="new-password"
                        aria-describedby="editAccount_input_passwordHelp"
                        v-model="account.password"
                      />
                      <button
                        class="btn btn-light"
                        type="button"
                        :aria-label="isRevealed('password') ? 'Hide password' : 'Show password'"
                        :aria-pressed="isRevealed('password') ? 'true' : 'false'"
                        @click="toggleReveal('password')"
                      >
                        <i class="fa" :class="isRevealed('password') ? 'fa-eye-slash' : 'fa-eye'" aria-hidden="true"></i>
                      </button>
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
                      Tap Suggest to generate a strong password.
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
                      autocapitalize="off"
                      autocorrect="off"
                      spellcheck="false"
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
                      autocapitalize="off"
                      autocorrect="off"
                      spellcheck="false"
                      type="text"
                      v-model="account.social_login"
                    />
              </div>

              <div class="form-field" role="group" aria-labelledby="fl-edit-15" v-if="account.subtype == 'wifi'">
                <span class="field-label" id="fl-edit-15"><i class="fa fa-lock" aria-hidden="true"></i> Password</span>
                    <div class="input-group mb-3">
                      <button
                        class="btn btn-light"
                        type="button"
                        @click="copyToClipboard('editAccount_input_password_hidden')"
                        aria-label="Copy"
                        v-if="account.password"
                      >
                        <i class="fa fa-copy" aria-hidden="true"></i>
                      </button>
                      <input
                        id="editAccount_input_password"
                        class="form-control"
                        autocapitalize="off"
                        autocorrect="off"
                        spellcheck="false"
                        :type="isRevealed('password') ? 'text' : 'password'"
                        autocomplete="new-password"
                        v-model="account.password"
                      />
                      <button
                        class="btn btn-light"
                        type="button"
                        :aria-label="isRevealed('password') ? 'Hide' : 'Show'"
                        :aria-pressed="isRevealed('password') ? 'true' : 'false'"
                        @click="toggleReveal('password')"
                      >
                        <i class="fa" :class="isRevealed('password') ? 'fa-eye-slash' : 'fa-eye'" aria-hidden="true"></i>
                      </button>
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
                      autocapitalize="off"
                      autocorrect="off"
                      spellcheck="false"
                      type="text"
                      placeholder="WPA, WEP, None"
                      v-model="account.password_clue"
                    />
              </div>

              <div class="form-field" role="group" aria-labelledby="fl-edit-16" v-if="account.subtype == 'secret_key'">
                <span class="field-label" id="fl-edit-16"><i class="fa fa-key" aria-hidden="true"></i> Key</span>
                    <div class="input-group mb-3">
                      <button
                        class="btn btn-light"
                        type="button"
                        @click="copyToClipboard('editAccount_input_password_hidden')"
                        aria-label="Copy"
                        v-if="account.password"
                      >
                        <i class="fa fa-copy" aria-hidden="true"></i>
                      </button>
                      <input
                        id="editAccount_input_password"
                        class="form-control"
                        autocapitalize="off"
                        autocorrect="off"
                        spellcheck="false"
                        :type="isRevealed('password') ? 'text' : 'password'"
                        autocomplete="new-password"
                        v-model="account.password"
                      />
                      <button
                        class="btn btn-light"
                        type="button"
                        :aria-label="isRevealed('password') ? 'Hide' : 'Show'"
                        :aria-pressed="isRevealed('password') ? 'true' : 'false'"
                        @click="toggleReveal('password')"
                      >
                        <i class="fa" :class="isRevealed('password') ? 'fa-eye-slash' : 'fa-eye'" aria-hidden="true"></i>
                      </button>
                      <input
                        id="editAccount_input_password_hidden"
                        type="hidden"
                        :value="account.password"
                      />
                    </div>
              </div>

              <div class="form-field" role="group" aria-labelledby="fl-edit-17" v-if="account.subtype == 'login'">
                <span class="field-label" id="fl-edit-17"><i class="fa fa-qrcode" aria-hidden="true"></i> Verification code</span>
                    <div class="input-group" v-show="account.totp_secret">
                      <button
                        class="btn btn-light"
                        type="button"
                        @click="copyToClipboard('editAccount_input_totp_token_hidden')"
                        aria-label="Copy"
                      >
                        <i class="fa fa-copy" aria-hidden="true"></i>
                      </button>
                      <input
                        class="form-control"
                        autocapitalize="off"
                        autocorrect="off"
                        spellcheck="false"
                        placeholder="Generated token"
                        aria-label="Verification code"
                        type="text"
                        inputmode="numeric"
                        :value="totpToken"
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
                    <div class="input-group">
                      <input
                        id="editAccount_input_totp_secret"
                        class="form-control"
                        autocapitalize="off"
                        autocorrect="off"
                        spellcheck="false"
                        placeholder="TOTP Secret"
                        :type="isRevealed('totp_secret') ? 'text' : 'password'"
                        autocomplete="off"
                        v-model="account.totp_secret"
                        @keyup.enter="save()"
                      />
                      <button
                        class="btn btn-light"
                        type="button"
                        :aria-label="isRevealed('totp_secret') ? 'Hide secret' : 'Show secret'"
                        :aria-pressed="isRevealed('totp_secret') ? 'true' : 'false'"
                        @click="toggleReveal('totp_secret')"
                      >
                        <i class="fa" :class="isRevealed('totp_secret') ? 'fa-eye-slash' : 'fa-eye'" aria-hidden="true"></i>
                      </button>
                    </div>
              </div>

              <div class="form-field" role="group" aria-labelledby="fl-edit-18" v-if="account.subtype == 'login' || account.subtype == 'secret_key'">
                <span class="field-label" id="fl-edit-18"><i class="fa fa-globe" aria-hidden="true"></i> Platform</span>
                    <div class="input-group">
                      <button
                        class="btn btn-light"
                        type="button"
                        @click="openLink(account.platform)"
                      >
                        <i class="fa fa-arrow-up-right-from-square" aria-hidden="true"></i>
                      </button>
                      <input
                        id="editAccount_input_platform"
                        class="form-control"
                        autocapitalize="off"
                        autocorrect="off"
                        spellcheck="false"
                        placeholder="Platform"
                        type="text"
                        @change="onPlatformChange()"
                        v-model="account.platform"
                      />
                    </div>
              </div>
            </div>

            <div class="form-sheet" v-if="account.type == 'card'">
              <div class="form-field" role="group" aria-labelledby="fl-edit-19">
                <span class="field-label" id="fl-edit-19"><i class="fa fa-building-columns" aria-hidden="true"></i> Provider</span>
                    <div class="input-group">
                      <button
                        class="btn btn-light"
                        type="button"
                        @click="openLink(account.platform)"
                      >
                        <i class="fa fa-arrow-up-right-from-square" aria-hidden="true"></i>
                      </button>
                      <input
                        id="editAccount_input_platform"
                        class="form-control"
                        autocapitalize="off"
                        autocorrect="off"
                        spellcheck="false"
                        placeholder="Provider name (e.g. HSBC bank)"
                        type="text"
                        @change="onPlatformChange()"
                        v-model="account.platform"
                      />
                    </div>
              </div>
            </div>

            <div class="form-sheet" v-if="account.type == 'bank' && account.subtype == 'iban'">
              <div class="form-field" role="group" aria-labelledby="fl-edit-20">
                <span class="field-label" id="fl-edit-20"><i class="fa fa-building-columns" aria-hidden="true"></i> BIC / SWIFT code</span>
                    <input
                      id="editAccount_input_platform"
                      class="form-control"
                      autocapitalize="off"
                      autocorrect="off"
                      spellcheck="false"
                      placeholder="e.g. BOUS FRPPAR"
                      type="text"
                      @change="onPlatformChange()"
                      v-model="account.platform"
                    />
              </div>

              <div class="form-field" role="group" aria-labelledby="fl-edit-21">
                <span class="field-label" id="fl-edit-21"><i class="fa fa-money-check" aria-hidden="true"></i> IBAN</span>
                    <div class="input-group mb-3">
                      <button
                        class="btn btn-light"
                        type="button"
                        @click="copyToClipboard('editAccount_input_password_hidden')"
                        aria-label="Copy"
                        v-if="account.password"
                      >
                        <i class="fa fa-copy" aria-hidden="true"></i>
                      </button>
                      <input
                        id="editAccount_input_password"
                        class="form-control"
                        autocapitalize="off"
                        autocorrect="off"
                        spellcheck="false"
                        :type="isRevealed('password') ? 'text' : 'password'"
                        placeholder="IBAN"
                        autocomplete="off"
                        v-model="account.password"
                      />
                      <button
                        class="btn btn-light"
                        type="button"
                        :aria-label="isRevealed('password') ? 'Hide IBAN' : 'Show IBAN'"
                        :aria-pressed="isRevealed('password') ? 'true' : 'false'"
                        @click="toggleReveal('password')"
                      >
                        <i class="fa" :class="isRevealed('password') ? 'fa-eye-slash' : 'fa-eye'" aria-hidden="true"></i>
                      </button>
                      <input
                        id="editAccount_input_password_hidden"
                        type="hidden"
                        :value="account.password"
                      />
                    </div>
              </div>

              <div class="form-field" role="group" aria-labelledby="fl-edit-22">
                <span class="field-label" id="fl-edit-22"><i class="fa fa-id-badge" aria-hidden="true"></i> Account holder</span>
                    <div class="input-group">
                      <button
                        class="btn btn-light"
                        type="button"
                        @click="copyToClipboard('editAccount_input_login_hidden')"
                        aria-label="Copy"
                      >
                        <i class="fa fa-copy" aria-hidden="true"></i>
                      </button>
                      <input
                        id="editAccount_input_login"
                        class="form-control"
                        autocapitalize="off"
                        autocorrect="off"
                        spellcheck="false"
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

            <div class="form-sheet">
              <div class="form-field" role="group" aria-labelledby="fl-edit-23">
                <span class="field-label" id="fl-edit-23"><i class="fa fa-message" aria-hidden="true"></i> Description</span>
                    <textarea aria-labelledby="fl-edit-23"
                      class="form-control"
                      type="text"
                      v-model="account.description"
                      rows="3"
                    ></textarea>
              </div>

               <div class="form-field" role="group" aria-labelledby="fl-edit-24">
                 <span class="field-label" id="fl-edit-24"><i class="fa fa-marker" aria-hidden="true"></i> Notes</span>
                    <textarea aria-labelledby="fl-edit-24"
                      class="form-control"
                      type="text"
                      v-model="account.notes"
                      rows="6"
                    ></textarea>
               </div>
            </div>

            <div class="form-sheet">
              <div class="form-field" role="group" aria-labelledby="fl-edit-25">
                <span class="field-label" id="fl-edit-25"><i class="fa fa-tag" aria-hidden="true"></i> Label</span>
                    <input
                      id="editAccount_input_label"
                      class="form-control"
                      autocapitalize="off"
                      autocorrect="off"
                      spellcheck="false"
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
                        autocapitalize="off"
                        autocorrect="off"
                        spellcheck="false"
                        placeholder="Icon URL"
                        type="text"
                        v-model="account.icon"
                      />
                    </div>
              </div>

              <div class="form-field" role="group" aria-labelledby="fl-edit-26">
                <span class="field-label" id="fl-edit-26"><i class="fa fa-tags" aria-hidden="true"></i> Tags</span>
                    <div
                      class="form-control tags tags-input"
                      v-show="account.tags"
                      @click="focusTagInput()"
                    >
                      <span
                        class="badge rounded-pill"
                        v-for="(tag, tagIndex) in account.tags.split(',')"
                        v-bind:key="tagIndex"
                        @click="removeTag(tagIndex)"
                      >
                        {{ tag }}
                        <i class="fa fa-close" v-if="tag" aria-hidden="true"></i>
                      </span>
                    </div>

                    <input aria-labelledby="fl-edit-26"
                      ref="tags"
                      class="form-control tags-new-input"
                      autocapitalize="off"
                      autocorrect="off"
                      spellcheck="false"
                      placeholder="Enter new tag"
                      type="text"
                      @keyup.enter="addTag()"
                      v-model="newTag"
                    />
              </div>
            </div>

            <div class="form-sheet">
              <div class="form-field" role="group" aria-labelledby="fl-edit-type">
                <span class="field-label" id="fl-edit-type"><i class="fa fa-layer-group" aria-hidden="true"></i> Type</span>
                <div class="choice-grid is-two">
                  <button type="button" class="choice" :class="account.type == 'account' ? 'is-active' : ''" :aria-pressed="account.type == 'account' ? 'true' : 'false'" @click="onTypeChange('account')"><b>Credential</b><small>Login, Wi-Fi, Secret key</small></button>
                  <button type="button" class="choice" :class="account.type == 'card' ? 'is-active' : ''" :aria-pressed="account.type == 'card' ? 'true' : 'false'" @click="onTypeChange('card')"><b>Card</b><small>Payment, Loyalty, Gift</small></button>
                  <button type="button" class="choice" :class="account.type == 'document' ? 'is-active' : ''" :aria-pressed="account.type == 'document' ? 'true' : 'false'" @click="onTypeChange('document')"><b>Document</b><small>ID, Passport</small></button>
                  <button type="button" class="choice" :class="account.type == 'bank' ? 'is-active' : ''" :aria-pressed="account.type == 'bank' ? 'true' : 'false'" @click="onTypeChange('bank')"><b>Bank</b><small>IBAN, SWIFT</small></button>
                </div>
              </div>
              <div class="form-field" role="group" aria-labelledby="fl-edit-kind" v-if="account.type == 'account' || account.type == 'card'">
                <span class="field-label" id="fl-edit-kind">Kind</span>
                <div class="choice-grid is-three" v-if="account.type == 'account'">
                  <button type="button" class="choice" :class="account.subtype == 'login' ? 'is-active' : ''" :aria-pressed="account.subtype == 'login' ? 'true' : 'false'" @click="account.subtype = 'login'"><b>Login</b></button>
                  <button type="button" class="choice" :class="account.subtype == 'wifi' ? 'is-active' : ''" :aria-pressed="account.subtype == 'wifi' ? 'true' : 'false'" @click="account.subtype = 'wifi'"><b>Wi-Fi</b></button>
                  <button type="button" class="choice" :class="account.subtype == 'secret_key' ? 'is-active' : ''" :aria-pressed="account.subtype == 'secret_key' ? 'true' : 'false'" @click="account.subtype = 'secret_key'"><b>Secret key</b></button>
                </div>
                <div class="choice-grid is-three" v-if="account.type == 'card'">
                  <button type="button" class="choice" :class="account.subtype == 'payment' ? 'is-active' : ''" :aria-pressed="account.subtype == 'payment' ? 'true' : 'false'" @click="account.subtype = 'payment'"><b>Payment</b></button>
                  <button type="button" class="choice" :class="account.subtype == 'loyalty' ? 'is-active' : ''" :aria-pressed="account.subtype == 'loyalty' ? 'true' : 'false'" @click="account.subtype = 'loyalty'"><b>Loyalty</b></button>
                  <button type="button" class="choice" :class="account.subtype == 'gift' ? 'is-active' : ''" :aria-pressed="account.subtype == 'gift' ? 'true' : 'false'" @click="account.subtype = 'gift'"><b>Gift</b></button>
                </div>
              </div>
            </div>

            <p class="record-line carbon">
              Created {{ createdDate }} · Modified {{ lastModifiedDate }} · Opened {{ lastOpenedDate }}
            </p>

        </form>

        <div class="footer">
          <div>
            <button
              class="btn btn-action btn-cta"
              :class="isSaving ? 'is-busy' : ''"
              :disabled="isSaving"
              type="button"
              @click="save()"
            >
              <i class="fa fa-floppy-disk"></i>
              {{ isSaving ? 'Saving…' : 'Save changes' }}
            </button>
          </div>
          <span class="small text-muted account-id">
            ID: {{ account._id }}
          </span>
        </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { faviconUrl, displayIcon } from "../utils/icon.js";
import "../assets/bottom_sheet.css";
import FullscreenBarcode from "./FullscreenBarcode.vue";
import SecretStrip from "./SecretStrip.vue";
import TotpRing from "./TotpRing.vue";
import VaultStatus from "./VaultStatus.vue";
import { mapState, mapActions } from "pinia";
import { useUiStore, useAlertStore, useAccountsStore, useNetworkStore } from "@/store";
import totpGenerator from "totp-generator";
import JsBarcode from 'jsbarcode'
import QrcodeVue from 'qrcode.vue'
import { truncateString } from '../utils/textFormat'
import { detectBarcodeSymbology } from '../utils/barcode'
import { copyText } from '../utils/clipboard'
import { maskSecret, REVEAL_DURATION_MS } from '../utils/secrets'

// Human names for the hidden inputs the copy buttons read from
const COPY_FIELD_NAMES = {
  editAccount_input_card_number_hidden: 'Number',
  editAccount_input_login_hidden: 'Login',
  editAccount_input_passwordless_generatedPassword_hidden: 'Password',
  editAccount_input_password_generatedPassword_hidden: 'Password',
  editAccount_input_password_hidden: 'Password',
  editAccount_input_totp_token_hidden: 'Verification code',
};

function initialState() {
  return {
    fullscreenBarcodeVisible: false,
    isSaving: false,
    isDeleting: false,
    isDuplicating: false,
    isActionMenuOpen: false,
    newTag: "",
    isSmallHeader: false,
    passwordLess: {
      masterPassword: "",
      generatedPassword: "",
      isGenerating: false,
    },
    revealed: {},
    now: Date.now(),
    isDetailsOpen: false,
    isIconBroken: false,
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
      cardFormat: {
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
    QrcodeVue,
    SecretStrip,
    TotpRing,
    VaultStatus
  },
  data: function () {
    return initialState();
  },
  created() {
    // Non-reactive timer handles
    this.revealTimers = {};
    this.clockTimer = null;
  },
  mounted() {
    this.initBottomSheet("edit-account-bottom-sheet");
    document.addEventListener('click', this.onGlobalClick);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.onGlobalClick);
    this.stopClock();
    this.hideAllSecrets();
  },
  watch: {
    visible: {
      immediate: true,
      handler(isVisible) {
        if (isVisible) {
          this.startClock();
          // Move focus into the dialog so Esc, screen readers and keyboards land inside it
          this.$nextTick(() => {
            const back = this.$el && this.$el.querySelector && this.$el.querySelector('.bottom-sheet-back');
            back && back.focus({ preventScroll: true });
          });
        } else {
          this.stopClock();
          this.hideAllSecrets();
        }
      }
    },
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

    displayCodeImage: function () {
      if (this.account.type == 'card' && (this.account.subtype == 'loyalty' || this.account.subtype == 'gift')) {
        return true;
      }

      if (this.account.type == 'account' && this.account.subtype == 'wifi') {
        return true;
      }

      return false;
    },

    passwordPreview: function () {
      // If passwordless, and no social login is used as "password less", display the latest generated pwd or offer to expand to generate
      if (this.account.is_password_less && !this.account.social_login) {
        return this.passwordLess.generatedPassword
          ? maskSecret(this.passwordLess.generatedPassword)
          : "Derived from your master password";
      }

      if (this.account.password) {
        return maskSecret(this.account.password);
      }

      if (this.account.password_clue) {
        return "Clue: " + this.account.password_clue;
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
          return totpGenerator(this.account.totp_secret.replace(/ /g, ""), { timestamp: this.now });
        }
        catch (exception) {
          return "Invalid secret";
        }
      }

      return "Not setup";
    },

    hasValidTotp: function () {
      return /^\d{6,8}$/.test(this.totpToken);
    },

    // "123 456" reads faster than "123456" when typing it on another device
    formattedTotpToken: function () {
      if (!this.hasValidTotp) {
        return this.totpToken;
      }

      const middle = Math.ceil(this.totpToken.length / 2);
      return this.totpToken.slice(0, middle) + " " + this.totpToken.slice(middle);
    },

    totpSecondsRemaining: function () {
      return 30 - (Math.floor(this.now / 1000) % 30);
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
      if (this.account.cardFormat === 'qrcode') {
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

    displayIcon,

    mask: function (value, visibleTail = 0) {
      return maskSecret(value, visibleTail);
    },

    isRevealed: function (field) {
      return this.revealed[field] === true;
    },

    toggleReveal: function (field) {
      if (this.isRevealed(field)) {
        this.hideSecret(field);
        return;
      }

      this.revealed = { ...this.revealed, [field]: true };

      // Secrets hide themselves again: assume someone is watching the screen
      clearTimeout(this.revealTimers[field]);
      this.revealTimers[field] = setTimeout(() => this.hideSecret(field), REVEAL_DURATION_MS);
    },

    hideSecret: function (field) {
      clearTimeout(this.revealTimers[field]);
      delete this.revealTimers[field];
      const { [field]: _removed, ...rest } = this.revealed;
      this.revealed = rest;
    },

    hideAllSecrets: function () {
      Object.values(this.revealTimers || {}).forEach(clearTimeout);
      this.revealTimers = {};
      this.revealed = {};
    },

    startClock: function () {
      this.stopClock();
      this.now = Date.now();
      this.clockTimer = setInterval(() => { this.now = Date.now(); }, 1000);
    },

    stopClock: function () {
      clearInterval(this.clockTimer);
      this.clockTimer = null;
    },

    toggleActionMenu: function () {
      this.isActionMenuOpen = !this.isActionMenuOpen;
    },

    closeActionMenu: function () {
      this.isActionMenuOpen = false;
    },

    onGlobalClick: function (event) {
      if (!this.isActionMenuOpen) {
        return;
      }

      const menuEl = this.$refs.actionMenu;

      if (!menuEl || !menuEl.contains(event.target)) {
        this.closeActionMenu();
      }
    },

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
      if (!this.account.cardFormat || this.account.cardFormat !== 'barcode') {
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
        this.account.icon = faviconUrl(this.account.platform);
      }
    },

    save: async function () {
      // if no label is set, use platform as label
      this.onPlatformChange.call(this);

      if (!this.account.isValid()) {
        this.openAlert("Name this item", "Add a label or a platform so you can find it again.", "danger");
        return;
      }

      this.isSaving = true;

      try {
        await this.updateAccount(this.account);

        const isOffline = this.isOffline;
        this.openAlert(
          isOffline ? 'Saved locally — will sync when back online.' : 'Saved',
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
      this.closeActionMenu();
      this.account.isPinned = !this.account.isPinned;
      this.save();
    },

    duplicate: async function () {
      this.closeActionMenu();
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

    generatePasswordLess: async function () {
      if (!this.passwordLess.masterPassword || this.passwordLess.isGenerating) {
        return;
      }

      this.passwordLess.isGenerating = true;

      try {
        this.passwordLess.generatedPassword = await this.account.generatePasswordLess(this.passwordLess.masterPassword);
      }
      catch (error) {
        this.openAlert("Couldn't derive the password", "Check the platform and login, then try again.", "danger");
      }
      finally {
        // Never keep the master password around longer than needed
        this.passwordLess.masterPassword = "";
        this.passwordLess.isGenerating = false;
      }
    },

    resetPasswordLess: function () {
      this.passwordLess.generatedPassword = "";
      this.hideSecret('passwordless');
    },

    remove: async function () {
      this.closeActionMenu();
      if (
        confirm(
          `Delete "${this.account.label}"? This can't be undone.`
        ) === true
      ) {
        this.isDeleting = true;

        try {
          await this.removeAccount(this.account);

          const isOffline = this.isOffline;
          this.openAlert(
            this.account.label,
            isOffline ? 'Deleted locally — will sync when back online.' : 'Deleted',
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

    copyValue: async function (value, fieldName) {
      const isCopied = await copyText(value);

      // Never echo the copied value: the toast is visible to anyone nearby
      if (isCopied) {
        this.openAlert(`${ fieldName } copied`, this.account.label, "info", this.isIconBroken ? null : this.account.icon);
      } else {
        this.openAlert(`Couldn't copy ${ fieldName.toLowerCase() }`, "Your browser blocked clipboard access. Reveal it and copy it by hand.", "danger");
      }
    },

    copyToClipboard: async function (input) {
      const inputToCopy = document.querySelector("#" + input);
      const fieldName = COPY_FIELD_NAMES[input] || "Value";
      const isCopied = await copyText(inputToCopy && inputToCopy.value);

      // Never echo the copied value: the toast is visible to anyone nearby
      if (isCopied) {
        this.openAlert(`${ fieldName } copied`, this.account.label, "info", this.account.icon);
      } else {
        this.openAlert(`Couldn't copy ${ fieldName.toLowerCase() }`, "Your browser blocked clipboard access. Reveal it and copy manually.", "danger");
      }
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
      this.hideAllSecrets();
      this.closeSidebar(this.SIDEBAR.EDIT_ACCOUNT);
      this.resetCurrentEditingAccount();

      // reset this component's state
      Object.assign(this.$data, initialState());
    },
  },
};
</script>

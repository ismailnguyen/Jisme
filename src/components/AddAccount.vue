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
              :alt="account.displayPlatform"
              :title="account.displayPlatform"
              class="bottom-sheet-large-icon"
            />
          </div>
        </div>
        <div class="row justify-content-center">
          <div class="col-12 text-center">
            <h2 class="bottom-sheet-title" :title="account._id">
              {{ account.displayPlatform || 'New account' }}
            </h2>
          </div>
        </div>
      </div>
      <div class="body">
        <div class="row">

          <div class="accordion">
            <div class="accordion-item">
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
                    v-model="account.platform"
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

                  <label class="form-label" for="addAccount_platform_icon"
                    ><i class="fa fa-icons" aria-hidden="true"></i> Icon</label
                  >
                  <input
                    id="addAccount_platform_icon"
                    class="form-control"
                    placeholder="Icon URL"
                    type="text"
                    v-model="account.icon"
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
                      id="addAccount_radiobutton_accounttype_account"
                      v-model="account.type"
                      value="account"
                    />
                    <label
                      class="btn"
                      for="addAccount_radiobutton_accounttype_account"
                      :class="account.type == 'account' ? 'active' : ''"
                    >
                      <i class="fa fa-globe" aria-hidden="true"></i>
                      Login
                    </label>

                    <input
                      type="radio"
                      class="btn-check"
                      name="account-type"
                      id="addAccount_radiobutton_accounttype_card"
                      v-model="account.type"
                      value="card"
                    />
                    <label
                      class="btn"
                      for="addAccount_radiobutton_accounttype_card"
                      :class="account.type == 'card' ? 'active' : ''"
                    >
                      <i class="fa fa-credit-card" aria-hidden="true"></i>
                      Card
                    </label>

                    <input
                      type="radio"
                      class="btn-check"
                      name="account-type"
                      id="addAccount_radiobutton_accounttype_2fa"
                      v-model="account.type"
                      value="2fa"
                    />
                    <label
                      class="btn"
                      for="addAccount_radiobutton_accounttype_2fa"
                      :class="account.type == '2fa' ? 'active' : ''"
                    >
                      <i class="fa fa-qrcode" aria-hidden="true"></i>
                      OTP
                    </label>
                  </div>
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
                    placeholder="Expiracy"
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

          <div class="accordion" v-if="account.type == 'account' || account.type == '2fa'">
            <div class="accordion-item">
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
          </div>

          <div class="accordion" v-if="account.type == 'account'">
            <div class="accordion-item">
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

                <hr class="my-4" />

                <label class="form-label" for="addAccount_social_login_input"
                  ><i class="fa fa-mobile-screen" aria-hidden="true"></i> Social login</label
                >
                <input
                  id="addAccount_social_login_input"
                  class="form-control"
                  placeholder="Google, Facebook, LinkedIn, ..."
                  type="text"
                  v-model="account.social_login"
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
        </div>

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

import { mapWritableState, mapActions, mapState } from "pinia";
import { useUiStore, useAlertStore, useAccountsStore } from "@/store";

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
      account: "currentEditingAccount",
    }),

    ...mapState(useUiStore, ["SIDEBAR"]),
  },
  methods: {
    ...mapActions(useAlertStore, ["openAlert"]),
    ...mapActions(useUiStore, ["closeSidebar", "resetCurrentEditingAccount"]),
    ...mapActions(useAccountsStore, ["addAccount"]),
    ...mapActions(useUiStore, ["initBottomSheet"]),

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
        this.account.displayPlatform,
        "Created !",
        "success",
        this.account.icon
      );

      this.resetCurrentEditingAccount();
    },
  },
};
</script>

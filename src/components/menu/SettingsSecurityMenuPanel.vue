<template>
  <div class="row">
    <Loader v-show="isLoading" />

    <div class="accordion">
      <div class="accordion-item">
        <h2 class="accordion-header ">
          <button
            class="accordion-button" :class="fieldAttrs.autoLogin.isExpanded ? '' : 'collapsed'"
            type="button"
            @click="fieldAttrs.autoLogin.isExpanded = !fieldAttrs.autoLogin.isExpanded">
            <div>
              <div class="fw-medium">
                <i class="fa fa-right-to-bracket" aria-hidden="true"></i>
                Auto login
              </div>
              <span class="fw-lighter" v-show="!fieldAttrs.autoLogin.isExpanded">
                {{ isAutoLoginEnabled ? 'Enabled' : 'Disabled' }}
              </span>
            </div>
          </button>
        </h2>
        <div class="accordion-collapse" :class="fieldAttrs.autoLogin.isExpanded ? 'show' : 'collapse'">
          <div class="accordion-body">
              <div class="form-check form-switch">
                <label class="form-check-label" for="autoLoginCheckbox">{{
                  isAutoLoginEnabled ? "Enabled" : "Disabled"
                }}</label>
                <input
                  class="form-check-input float-end"
                  type="checkbox"
                  role="switch"
                  id="autoLoginCheckbox"
                  v-model="isAutoLoginEnabled"
                />
              </div>
              <small class="form-text text-muted">Applies only to this device.</small>
          </div>
        </div>
      </div>

      <div class="accordion-item">
        <h2 class="accordion-header ">
          <button
            class="accordion-button" :class="fieldAttrs.totpSecret.isExpanded ? '' : 'collapsed'"
            type="button"
            @click="fieldAttrs.totpSecret.isExpanded = !fieldAttrs.totpSecret.isExpanded">
            <div>
              <div class="fw-medium">
                <i class="fa fa-qrcode" aria-hidden="true"></i>
                2FA
              </div>
              <span class="fw-lighter" v-show="!fieldAttrs.totpSecret.isExpanded">
                {{ user.totp_secret ? 'Enabled' : 'Click to setup' }}
              </span>
            </div>
          </button>
        </h2>
        <div class="accordion-collapse" :class="fieldAttrs.totpSecret.isExpanded ? 'show' : 'collapse'">
          <div class="accordion-body">
              <label class="form-label" for="settings_totpSecret">
                <i class="fa fa-key" aria-hidden="true"></i> TOTP Secret
              </label>
              <input
                id="settings_totpSecret"
                class="form-control"
                type="text"
                placeholder="Loading"
                laceholder="MFA TOTP secret"
                v-model="user.totp_secret"
                disabled
              />
          </div>
        </div>
      </div>

      <div class="accordion-item">
        <h2 class="accordion-header ">
          <button
            class="accordion-button" :class="fieldAttrs.passkeys.isExpanded ? '' : 'collapsed'"
            type="button"
            @click="fieldAttrs.passkeys.isExpanded = !fieldAttrs.passkeys.isExpanded">
            <div>
              <div class="fw-medium">
                <i class="fa fa-fingerprint" aria-hidden="true"></i>
                Passkeys
              </div>
              <span class="fw-lighter" v-show="!fieldAttrs.passkeys.isExpanded">
                {{ user.passkeys && user.passkeys.length ? user.passkeys.length + ' active passkeys' : 'Click to setup' }}
              </span>
            </div>
          </button>
        </h2>
        <div class="accordion-collapse" :class="fieldAttrs.passkeys.isExpanded ? 'show' : 'collapse'">
          <div class="accordion-body">
                <div class="input-group-list">
                  <div
                    class="input-group"
                    v-for="passkey in user.passkeys"
                    :key="passkey.passkey.id"
                  >
                    <input
                      :id="'passkey_' + passkey.passkey.id"
                      name="passkey_device"
                      class="form-control"
                      type="text"
                      placeholder="Loading"
                      v-model="passkey.deviceName"
                      disabled
                    />
                    <button
                      class="btn btn-light hover-danger"
                      type="button"
                      @click="onRemovePasskey(passkey)"
                    >
                      <i class="fa fa-trash"></i>
                      <span class="d-none d-lg-inline">&nbsp; Remove</span>
                    </button>
                  </div>
                  <button
                    id="passwordlesslogin_btn"
                    class="btn btn-danger btn-block"
                    @click.prevent="onGeneratePasskey()"
                    v-if="isGeneratePasskeyBtnVisible"
                  >
                    <i class="fa fa-plus"></i> Allow a new device to connect
                  </button>

                  <button
                    id="passwordlesslogin_unsupported_btn"
                    class="btn btn-danger btn-block"
                    v-if="!isGeneratePasskeyBtnVisible"
                    disabled
                  >
                    <i class="fa fa-ban"></i> Passkey not supported in this device
                  </button>
                </div>
          </div>
        </div>
      </div>
    </div>

    <hr class="my-4" />

    <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
      <button
        type="button"
        class="btn btn-action"
        :class="isLoading ? 'btn-dark' : 'btn-cta'"
        @click="onSave()"
      >
        <i class="fa fa-floppy-disk"></i>
        Confirm changes
      </button>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from "pinia";
import {
  useUiStore,
  useAlertStore,
  useUserStore,
  useAccountsStore,
} from "@/store";
import Loader from "../Loader.vue";

export default {
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    Loader,
  },
  data() {
    return {
      isLoading: false,
      totpToken: "",
      isAutoLoginEnabled: false,
      isGeneratePasskeyBtnVisible: false,
      fieldAttrs: {
        autoLogin: {
          isExpanded: false,
        },
        totpSecret: {
          isExpanded: false,
        },
        passkeys: {
          isExpanded: false,
        },
      },
    };
  },
  async mounted() {
    this.isPasskeyCreationSupported(
      this.onPasskeySupported,
      this.onPasskeyUnsupported
    );

    this.isAutoLoginEnabled = await this.storeIsAutoLoginEnabled;
  },
  computed: {
    ...mapState(useUserStore, {
      user: "user",
      storeIsAutoLoginEnabled: "isAutoLoginEnabled",
    }),
    ...mapState(useAccountsStore, ["accounts"]),
    ...mapState(useUiStore, ["SIDEBAR"]),
  },
  methods: {
    ...mapActions(useUserStore, [
      "update",
      "generatePasskey",
      "removePasskey",
      "setAutoLogin",
      "isPasskeyCreationSupported",
    ]),

    ...mapActions(useAlertStore, ["openAlert"]),

    ...mapActions(useUiStore, ["closeSidebar"]),

    ...mapActions(useAccountsStore, ["enableServerEncryption"]),

    onPasskeySupported: function () {
      // Display button
      this.isGeneratePasskeyBtnVisible = true;
    },

    onPasskeyUnsupported: function () {
      this.isGeneratePasskeyBtnVisible = false;
    },

    onGeneratePasskey: async function () {
      const deviceName = prompt("Enter a device name", "Device #1");
      if (deviceName) {
        try {
          await this.generatePasskey(deviceName);

          this.openAlert("Passkey added!", "Save to confirm.");
        } catch (error) {
          console.log(error);
          this.openAlert("Error!", error, "danger");
        }
      }
    },

    onRemovePasskey: function (passkeyToDelete) {
      //need to stringify and parse because Vuejs gives an observer instead of the object
      passkeyToDelete = JSON.parse(JSON.stringify(passkeyToDelete));
      if (
        confirm(
          "Do you want to delete passkey for " +
            passkeyToDelete.deviceName +
            "?"
        )
      ) {
        this.removePasskey(passkeyToDelete);
        this.openAlert("Passkey deleted!", "Save to confirm.");
      }
    },

    onSave: async function () {
      this.isLoading = true;

      try {
        await this.setAutoLogin(this.isAutoLoginEnabled);
        await this.update();

        this.isLoading = false;
        this.openAlert("Saved!", "", "success");
      } catch (error) {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
  .input-group-list > .btn:last-of-type {
    margin-top: 1rem;
  }
</style>
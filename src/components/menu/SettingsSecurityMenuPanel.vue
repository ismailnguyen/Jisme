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
                {{ user && user.passkeys && user.passkeys.length ? user.passkeys.length + ' passkeys' : 'Click to setup' }}
              </span>
            </div>
          </button>
        </h2>
        <div class="accordion-collapse" :class="fieldAttrs.passkeys.isExpanded ? 'show' : 'collapse'">
          <div class="accordion-body">
            <PasskeyManager />
          </div>
        </div>
      </div>

      <div class="accordion-item">
        <h2 class="accordion-header ">
          <button
            class="accordion-button" :class="fieldAttrs.recovery.isExpanded ? '' : 'collapsed'"
            type="button"
            @click="fieldAttrs.recovery.isExpanded = !fieldAttrs.recovery.isExpanded">
            <div>
              <div class="fw-medium">
                <i class="fa fa-life-ring" aria-hidden="true"></i>
                Recovery code
              </div>
              <span class="fw-lighter" v-show="!fieldAttrs.recovery.isExpanded">
                One-time code to recover your account
              </span>
            </div>
          </button>
        </h2>
        <div class="accordion-collapse" :class="fieldAttrs.recovery.isExpanded ? 'show' : 'collapse'">
          <div class="accordion-body">
            <RecoveryCodeSettings />
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
import PasskeyManager from "../PasskeyManager.vue";
import RecoveryCodeSettings from "../RecoveryCodeSettings.vue";

export default {
  components: {
    Loader,
    PasskeyManager,
    RecoveryCodeSettings,
  },
  data() {
    return {
      isLoading: false,
      totpToken: "",
      isAutoLoginEnabled: false,
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
        recovery: {
          isExpanded: false,
        },
      },
    };
  },
  async mounted() {
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
      "setAutoLogin",
    ]),

    ...mapActions(useAlertStore, ["openAlert"]),

    ...mapActions(useUiStore, ["closeSidebar"]),

    ...mapActions(useAccountsStore, ["enableServerEncryption"]),

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
</style>
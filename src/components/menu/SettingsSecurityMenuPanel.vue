<template>
  <div class="row">
    <Loader v-show="isLoading" />

    <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
      <label class="form-label" for="inputEmail"
        ><i class="fa fa-id-badge" aria-hidden="true"></i> Username</label
      >
      <input
        id="inputEmail"
        class="form-control"
        placeholder="Username, email address, phone number"
        type="email"
        v-model="user.email"
        disabled
      />
    </div>

    <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
      <label class="form-label" for="inputAvatar"
        ><i class="fa fa-circle-user" aria-hidden="true"></i> Avatar</label
      >
      <input
        id="inputAvatar"
        class="form-control"
        type="text"
        laceholder="Avatar image URL"
        v-model="user.avatarUrl"
      />
    </div>

    <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
      <h5 class="font-size-16 me-3 mb-0">
        <i class="fa fa-right-to-bracket" aria-hidden="true"></i> Auto login
      </h5>

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

    <hr class="my-4" />

    <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
      <label class="form-label" for="inputTotpSecret">
        <h5 class="font-size-16 me-3 mb-0">
          <i class="fa fa-qrcode" aria-hidden="true"></i> TOTP Secret
        </h5>
      </label>
      <input
        id="inputTotpSecret"
        class="form-control"
        type="text"
        placeholder="Loading"
        laceholder="MFA TOTP secret"
        v-model="user.totp_secret"
        disabled
      />
    </div>

    <hr class="my-4" />

    <div class="mb-3 col-xs-12 col-md-12 col-lg-12 input-group-list">
      <label class="form-label" for="passwordlesslogin_btn">
        <h5 class="font-size-16 me-3 mb-0">
          <i class="fa fa-fingerprint" aria-hidden="true"></i> Passkeys
        </h5>
      </label>

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
          class="btn btn-outline-secondary hover-danger"
          type="button"
          @click="onRemovePasskey(passkey)"
        >
          <i class="fa fa-trash"></i> Remove
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

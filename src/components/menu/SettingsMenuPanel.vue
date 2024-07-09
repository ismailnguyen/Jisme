<template>
  <div class="row">
    <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
      <button
        class="btn btn-action btn-light w-100"
        type="button"
        @click="onOpenSettingsProfile()"
      >
        <i class="fa fa-user"></i>
        Profile
      </button>
    </div>

    <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
      <button
        class="btn btn-action btn-light"
        type="button"
        @click="onOpenSettingsSecurity()"
      >
        <i class="fa fa-bullseye"></i>
        Security Settings
      </button>
    </div>

    <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
      <button
        class="btn btn-action btn-light"
        type="button"
        @click="onOpenSettingsActivities()"
      >
        <i class="fa fa-share-alt"></i>
        Recent Activities
      </button>
    </div>

    <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
      <button
        class="btn btn-action btn-light"
        type="button"
        @click="onOpenSettingsAbout()"
      >
        <i class="fa fa-info"></i>
        About
      </button>
    </div>

    <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
      <button type="button" class="btn btn-action btn-red" @click="onSignOut()">
        <i class="fa fa-power-off"></i>
        Logout
      </button>
    </div>
  </div>
</template>

<script>
import { mapActions } from "pinia";
import { useUserStore } from "@/store";

export default {
  emits: ["panelChanged"],
  mounted() {
    this.getAccountInformation();
  },
  methods: {
    ...mapActions(useUserStore, ['getAccountInformation', 'signOut']),

    onOpenSettingsProfile: function () {
      this.$emit("panelChanged", "settings-profile");
    },

    onOpenSettingsSecurity: function () {
      this.$emit("panelChanged", "settings-security");
    },

    onOpenSettingsActivities: function () {
      this.$emit("panelChanged", "settings-activities");
    },

    onOpenSettingsAbout: function () {
      this.$emit("panelChanged", "settings-about");
    },

    onSignOut: async function () {
      await this.signOut();
    },
  },
};
</script>

<template>
  <Menu :visible="isSidebarOpen(SIDEBAR.MENU)" />

  <AddAccountModal :visible="isSidebarOpen(SIDEBAR.ADD_ACCOUNT)" />

  <EditAccountModal
    :account="currentEditingAccount"
    :visible="isSidebarOpen(SIDEBAR.EDIT_ACCOUNT)"
  />

  <AccountList @menuOpened="onMenuOpened" v-if="!hasAccounts" />
  <NoAccounts v-else />
</template>

<script>
import "../assets/home.css";

import { mapState, mapActions } from "pinia";
import { useAccountsStore, useUserStore, useUiStore } from "@/store";
import Menu from "../components/Menu.vue";
import AddAccountModal from "../components/AddAccount.vue";
import EditAccountModal from "../components/EditAccount.vue";
import AccountList from "../components/AccountList.vue";
import NoAccounts from "../components/NoAccounts.vue";

export default {
  components: {
    Menu,
    AddAccountModal,
    EditAccountModal,
    AccountList,
    NoAccounts
  },
  props: {
    isAnySidebarOpen: {
      type: Boolean,
      default: false,
    },
    sidebarName: {
      type: String,
      default: '',
    },
  },
  async mounted() {
    if (this.isAnySidebarOpen && this.sidebarName) {
      this.openSidebar(this.sidebarName);
    }

    const lastUserUpdate = await this.getLastUpdatedTime();
    console.log("Last user update:", lastUserUpdate, new Date());
  },
  computed: {
    ...mapState(useUserStore, ['user', 'isLoggedIn']),
    ...mapState(useAccountsStore, ['hasAccounts']),
    ...mapState(useUiStore, [
      'currentEditingAccount',
      'isSidebarOpen',
      'SIDEBAR',
    ]),
  },
  methods: {
    ...mapActions(useUiStore, ["toggleSidebar", "openSidebar", "openSidebar"]),

    ...mapActions(useUserStore, ["getLastUpdatedTime"]),

    onMenuOpened: function () {
      this.toggleSidebar(this.SIDEBAR.MENU);
    },
  },
};
</script>

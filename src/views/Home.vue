<template>
  <Menu :visible="isSidebarOpen(SIDEBAR.MENU)" />

  <AddAccountModal :visible="isSidebarOpen(SIDEBAR.ADD_ACCOUNT)" />

  <EditAccountModal
    :account="currentEditingAccount"
    :visible="isSidebarOpen(SIDEBAR.EDIT_ACCOUNT)"
  />

  <div class="home-layout">
    <SummaryPane
        @menuOpened="onMenuOpened"
    />

    <AccountList
      @menuOpened="onMenuOpened"
    />
  </div>

  <!-- Split view: what the detail column shows before an item is opened -->
  <div class="detail-empty" aria-hidden="true">
    <img src="../assets/logo_medium.png" alt="" width="56" height="56">
    <p>Select an item to see its details.</p>
  </div>

  <HomeDock />
</template>

<script>
import "../assets/home.css";

import {
  mapState,
  mapActions
} from "pinia";
import {
  useUserStore,
  useUiStore,
} from "@/store";
import Menu from "../components/Menu.vue";
import AddAccountModal from "../components/AddAccount.vue";
import EditAccountModal from "../components/EditAccount.vue";
import SummaryPane from "../components/SummaryPane.vue";

import AccountList from "../components/AccountList.vue";
import HomeDock from "../components/HomeDock.vue";

export default {
  components: {
    Menu,
    AddAccountModal,
    EditAccountModal,
    SummaryPane,
    AccountList,
    HomeDock
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
  data() {
    return {
      isMobile: window.matchMedia('(max-width: 767px)').matches
    };
  },
  async mounted() {
    window.addEventListener('resize', this.handleResize);

    if (this.isAnySidebarOpen && this.sidebarName) {
      this.openSidebar(this.sidebarName);
    }

    // Touch the session so an expired token signs the user out early
    await this.getLastUpdatedTime().catch(() => {});
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
  },
  computed: {
    ...mapState(useUserStore, [
      'user',
      'isLoggedIn',
      'hasAccounts'
    ]),
    ...mapState(useUiStore, [
      'currentEditingAccount',
      'isSidebarOpen',
      'SIDEBAR',
    ]),
  },
  methods: {
    ...mapActions(useUiStore, [
      'toggleSidebar',
      'openSidebar'
    ]),

    ...mapActions(useUserStore, ['getLastUpdatedTime']),

    onMenuOpened: function () {
      this.toggleSidebar(this.SIDEBAR.MENU);
    },
    handleResize() {
      this.isMobile = window.matchMedia('(max-width: 767px)').matches;
    },
  },
};
</script>


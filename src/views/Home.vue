<template>
  <Menu :visible="isSidebarOpen(SIDEBAR.MENU)" />

  <AddAccountModal :visible="isSidebarOpen(SIDEBAR.ADD_ACCOUNT)" />

  <EditAccountModal
    :account="currentEditingAccount"
    :visible="isSidebarOpen(SIDEBAR.EDIT_ACCOUNT)"
  />

  <div class="home-layout">
    <aside class="summary-pane" :class="{ 'summary-pane--expanded': isSummaryPaneExpanded }">
      <div class="summary-header">
        <h1>Jisme</h1>

        <SearchBar
          @menuOpened="onMenuOpened"
        />
      </div>

      <AccountTypesList
        v-if="shouldDisplaySummaryPane"
        :isLoading="!areAccountsLoaded"
      />
      <hr v-if="shouldDisplaySummaryPane">
      <MostUsedTags
        v-if="shouldDisplaySummaryPane"
        :isLoading="!areAccountsLoaded"
      />
    </aside>
    <main class="account-list-pane">
      <AccountList
        @menuOpened="onMenuOpened"
      />
    </main>
  </div>
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
  useAccountsStore
} from "@/store";
import Menu from "../components/Menu.vue";
import AddAccountModal from "../components/AddAccount.vue";
import EditAccountModal from "../components/EditAccount.vue";
import AccountTypesList from "../components/AccountTypesList.vue";
import MostUsedTags from "../components/MostUsedTags.vue";
import SearchBar from "../components/SearchBar.vue";

import AccountList from "../components/AccountList.vue";

export default {
  components: {
    Menu,
    AddAccountModal,
    EditAccountModal,
    AccountTypesList,
    MostUsedTags,
    SearchBar,
    AccountList
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

    const lastUserUpdate = await this.getLastUpdatedTime();
    console.log("Last user update:", lastUserUpdate, new Date());
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
      'isSummaryPaneExpanded'
    ]),
    ...mapState(useAccountsStore, [
      'areAccountsLoaded',
      'isSearching'
    ]),

    shouldDisplaySummaryPane() {
      return this.hasAccounts // Show summary pane only if there are accounts
            && (!this.isMobile // On desktop always show summary pane
                || (this.isMobile && !this.isSearching)); // On mobile show summary pane only when not searching
    }
  },
  methods: {
    ...mapActions(useUiStore, [
      'toggleSidebar',
      'openSidebar',
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

<style>
.home-layout {
  display: flex;
  flex-direction: row;
  height: 100vh;
}
.summary-header {
  padding: 1rem 1rem 0;
}
@media (prefers-color-scheme: light) {
  .summary-header,
  .summary-pane {
    background: #f8f9fa;
  }
  .summary-pane {
    border-right: 1px solid #eee;
  }
}
@media (prefers-color-scheme: dark) {
  .summary-header,
  .summary-pane {
    background: var(--color-background-soft);
  }
  .summary-pane {
    border-right: 1px solid transparent;
  }
}
@media (max-width: 767px) {
  .summary-header {
    position: fixed;
    z-index: 1;
    width: 100%;
  }
}
@media (min-width: 767px) {
  .summary-header {
    position: relative;
  }
}
.summary-pane {
  width: 350px;
  min-width: 300px;
  transition: all 0.3s;
  overflow-y: auto;
}
@media (min-width: 767px) {
  .summary-pane.summary-pane--expanded {
    width: 500px;
  }
}
.account-list-pane {
  flex: 1;
  overflow-y: auto;
}

/* Responsive for mobile */
@media (max-width: 767px) {
  .home-layout {
    flex-direction: column;
  }
  .summary-pane {
    width: 100%;
    min-width: unset;
    border-right: none;
    border-bottom: 1px solid #eee;
  }
  .account-list-pane {
    width: 100%;
    padding: 0 0.5rem;
  }
}
</style>

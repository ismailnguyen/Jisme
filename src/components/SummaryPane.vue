<script setup>
    // can't be used directly on the template
    const app_name = __APP_NAME__
</script>

<template>
    <aside class="summary-pane" :class="{ 'summary-pane--expanded': isSummaryPaneExpanded }">
        <header class="summary-header">
            <div class="brand-row">
                <h1 class="brand">
                    <img src="../assets/logo_medium.png" alt="" width="34" height="34">
                    {{ app_name }}
                </h1>
                <button
                    type="button"
                    class="avatar-btn"
                    aria-label="Account and settings"
                    :aria-expanded="isSidebarOpen(SIDEBAR.MENU) ? 'true' : 'false'"
                    @click="onMenuOpened">
                    <img v-if="user && user.avatarUrl && !isAvatarBroken" :src="user.avatarUrl" alt="" @error="isAvatarBroken = true">
                    <span v-else aria-hidden="true">{{ userInitial }}</span>
                </button>
            </div>

            <SearchBar
                @menuOpened="onMenuOpened"
            />
        </header>

        <AccountTypesList
            v-if="isSummaryShortcutsEnabled()"
            :isLoading="!areAccountsLoaded"
        />

        <MostUsedTags
            v-if="isSummaryShortcutsEnabled()"
            :isLoading="!areAccountsLoaded"
        />
    </aside>
</template>

<script>
import "../assets/summary_pane.css";

import {
  mapState,
} from "pinia";
import {
  useUserStore,
  useUiStore,
  useAccountsStore,
  useNetworkStore
} from "@/store";
import AccountTypesList from "../components/AccountTypesList.vue";
import MostUsedTags from "../components/MostUsedTags.vue";
import SearchBar from "../components/SearchBar.vue";

export default {
    emits: ['menuOpened'],
  components: {
    AccountTypesList,
    MostUsedTags,
    SearchBar
  },
  data() {
    return {
      isAvatarBroken: false
    };
  },
  computed: {
    ...mapState(useNetworkStore, [
      'isOffline'
    ]),
    ...mapState(useUserStore, [
      'hasAccounts',
      'user'
    ]),
    ...mapState(useUiStore, [
      'isSummaryPaneExpanded',
      'isAdvancedSearchMode',
      'isSummaryShortcutsEnabled',
      'isSidebarOpen',
      'SIDEBAR'
    ]),

    userInitial: function () {
      const email = this.user && this.user.email || '';
      return (email.trim()[0] || '?').toUpperCase();
    },
    ...mapState(useAccountsStore, [
      'areAccountsLoaded',
      'isSearching'
    ]),
  },
  methods: {
    onMenuOpened: function () {
      this.$emit('menuOpened');
    }
  }
};
</script>

<script setup>
    // can't be used directly on the template
    const app_name = __APP_NAME__
</script>

<template>
    <aside class="summary-pane" :class="{ 'summary-pane--expanded': isSummaryPaneExpanded }">
        <header class="summary-header">
            <div class="brand-row">
                <h1 class="brand">
                    <img src="../assets/logo_medium.png" alt="" width="30" height="30">
                    {{ app_name }}
                </h1>
                <VaultStatus />
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
import VaultStatus from "../components/VaultStatus.vue";

export default {
    emits: ['menuOpened'],
  components: {
    AccountTypesList,
    MostUsedTags,
    SearchBar,
    VaultStatus
  },
  computed: {
    ...mapState(useNetworkStore, [
      'isOffline'
    ]),
    ...mapState(useUserStore, [
      'hasAccounts'
    ]),
    ...mapState(useUiStore, [
      'isSummaryPaneExpanded',
      'isAdvancedSearchMode',
      'isSummaryShortcutsEnabled'
    ]),
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

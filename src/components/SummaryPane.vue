<script setup>
    // can't be used directly on the template
    const app_name = __APP_NAME__
</script>

<template>
    <aside class="summary-pane" :class="{ 'summary-pane--expanded': isSummaryPaneExpanded }">
        <div class="summary-header">
            <h1>{{ app_name }}</h1>

            <SearchBar
                @menuOpened="onMenuOpened"
            />
        </div>

        <AccountTypesList
            v-if="isSummaryShortcutsEnabled()"
            :isLoading="!areAccountsLoaded"
        />

        <hr v-if="isSummaryShortcutsEnabled()">

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
  mapActions
} from "pinia";
import {
  useUserStore,
  useUiStore,
  useAccountsStore
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
  computed: {
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

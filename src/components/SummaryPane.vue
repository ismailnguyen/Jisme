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
            v-if="shouldDisplaySummaryPane"
            :isLoading="!areAccountsLoaded"
        />

        <hr v-if="shouldDisplaySummaryPane">

        <MostUsedTags
            v-if="shouldDisplaySummaryPane"
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
  data() {
    return {
      isMobile: window.matchMedia('(max-width: 767px)').matches
    };
  },
  computed: {
    ...mapState(useUserStore, [
      'hasAccounts'
    ]),
    ...mapState(useUiStore, [
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
    ]),

    onMenuOpened: function () {
      this.$emit('menuOpened');
    }
  }
};
</script>

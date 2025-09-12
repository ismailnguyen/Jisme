<script setup>
    // can't be used directly on the template
    const app_name = __APP_NAME__
</script>

<template>
    <aside class="summary-pane" :class="{ 'summary-pane--expanded': isSummaryPaneExpanded }">
        <div class="summary-header">
            <h1 class="d-flex align-items-center">
                {{ app_name }}
                
                <span class="badge badge-red" v-if="isOffline">
                  <i
                    class="fa fa-link-slash"
                    aria-hidden="true"
                    title="Offline"
                  ></i>
                  Offline
                </span>
            </h1>

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
  data() {
    return {
      isOffline: !navigator.onLine,
    };
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
  mounted() {
    window.addEventListener('online', this.updateNetworkStatus);
    window.addEventListener('offline', this.updateNetworkStatus);
  },
  beforeUnmount() {
    window.removeEventListener('online', this.updateNetworkStatus);
    window.removeEventListener('offline', this.updateNetworkStatus);
  },
  methods: {
    onMenuOpened: function () {
      this.$emit('menuOpened');
    },
    updateNetworkStatus: function () {
      this.isOffline = !navigator.onLine;
    }
  }
};
</script>

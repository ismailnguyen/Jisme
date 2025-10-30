<template>
  <div
    class="progress"
    v-show="accountsFetchingProgression.isFetching"
    role="progressbar"
    aria-label="Fetching accounts..."
    :aria-valuenow="accountsFetchingProgression.totalFetched"
    aria-valuemin="0"
    :aria-valuemax="accountsFetchingProgression.total"
  >
    <div
      class="progress-bar"
      :style="
        'width: ' + accountsFetchingProgression.progressionPercentage + '%'
      "
    ></div>
  </div>

  <main class="account-list-pane container-fluid" :class="{ 'summary-pane--expanded': isSummaryPaneExpanded, 'advanced-search--opened': isAdvancedSearchMode }">
    <NoAccounts v-if="!hasAccounts" />

    <FavoriteAccountList
      v-if="hasAccounts && !isSearching"
      :isLoading="!areAccountsLoaded"  />

    <RecentAccountList
      v-if="hasAccounts && !isSearching"
      :isLoading="!areAccountsLoaded"  />

    <FilteredAccountList
      :searchQuery="searchQuery"
      :filteredAccounts="filteredAccounts"
      :isLoading="!areAccountsLoaded"
      v-if="hasAccounts && isSearching"
    />
  </main>
</template>

<script>
import "../assets/accounts_pane.css";

import { SessionExpiredException } from '../utils/errors'
import {
  mapState,
  mapActions,
  mapStores
} from "pinia";
import { 
  useUserStore,
  useAccountsStore,
  useAlertStore,
  useUiStore,
  useNetworkStore
} from "@/store";
import LoadingAccountItem from "../components/LoadingAccountItem.vue";
import AccountItem from "../components/AccountItem.vue";
import RecentAccountList from "../components/RecentAccountList.vue";
import FavoriteAccountList from "../components/FavoriteAccountList.vue";
import FilteredAccountList from "../components/FilteredAccountList.vue";
import NoAccounts from "../components/NoAccounts.vue";
import SearchBar from "../components/SearchBar.vue";

export default {
  emits: ['menuOpened'],
  components: {
    LoadingAccountItem,
    AccountItem,
    RecentAccountList,
    FavoriteAccountList,
    FilteredAccountList,
    NoAccounts,
    SearchBar
  },
  data() {
    return {
      accountsFetchingProgression: {
        isFetching: false,
        totalFetched: 0,
        total: 0,
      }
    };
  },
  async created() {
    await this.loadCache();

    this.accountsStore.$subscribe(this.onAccountsLoaded);
  },
  async mounted() {
    await this.fetchLatestAccounts();
  },
  computed: {
    ...mapStores(useAccountsStore),
    ...mapState(useUserStore, [
      'user',
      'hasAccounts'
    ]),
    ...mapState(useAccountsStore, [
      'searchQuery',
      'filteredAccounts',
      'totalFetchedAccounts',
      'totalAccounts',
      'areAccountsLoaded',
      'fetchAccounts',
      'isSearching'
    ]),
    ...mapState(useUiStore, [
      'isSidebarOpen',
      'SIDEBAR',
      'isSummaryPaneExpanded',
      'isAdvancedSearchMode',
    ]),
    ...mapState(useNetworkStore, [
      'isOffline'
    ])
  },
  methods: {
    ...mapActions(useAccountsStore, [
      'loadCache'
    ]),

    ...mapActions(useUiStore, [
        'openSidebar',
        'setCurrentEditingAccount'
    ]),

    ...mapActions(useAlertStore, ["openAlert"]),

    onMenuOpened: function () {
      this.$emit('menuOpened');
    },

    removeTag: function (tag) {
        let newTags = this.$route.query.tags.split(',').map(x => x.trim());
        newTags.splice(newTags.indexOf(tag), 1);
        
        this.$router.push({ name: 'Home', query: { 
            tags: newTags.join(','),
            search: this.$route.query.search,
            type: this.$route.query.type
        } });
    },

    removeType: function (type) {
        let newTypes = this.$route.query.type.split(',').map(x => x.trim());
        newTypes.splice(newTypes.indexOf(type), 1);
        
        this.$router.push({ name: 'Home', query: { 
            type: newTypes.join(','),
            search: this.$route.query.search,
            tags: this.$route.query.tags
        } });
    },

    onAccountsLoaded: function (mutation, state) {
      if (state.totalAccounts >= state.totalFetchedAccounts) {
        this.displayProgress(state.totalFetchedAccounts, state.totalAccounts);

        if (state.totalFetchedAccounts == state.totalAccounts) {
          setTimeout(() => {
            this.accountsFetchingProgression.isFetching = false;
          }, 1000);
        }
      }
    },

    displayProgress: function (current, total) {
      this.accountsFetchingProgression = {
        isFetching: true,
        totalFetched: current,
        total: total,
        progressionPercentage: Math.round((current / total) * 100),
      };
    },

    fetchLatestAccounts: async function () {
      try {
        await this.fetchAccounts();
      } catch (error) {
        if (error instanceof SessionExpiredException) {
          this.openAlert("Session expired", error.message, "danger");
          this.$router.go("/");
        } else {
          const offline = this.isOffline;
          this.openAlert(
            error.name || (offline ? 'Offline' : 'Error while loading accounts'),
            error.message,
            offline ? 'warning' : 'danger'
          );
        }
      }
    },
  },
};
</script>

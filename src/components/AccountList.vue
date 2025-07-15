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

  <div id="page-content-wrapper" class="container-fluid">
    <SearchBar
      :currentSearchMode="currentSearchMode"
      :searchQuery="searchQuery"
      :selectedTags="selectedTags"
      :selectedTypes="selectedTypes"
      :searchFilters="searchFilters"
      :areAccountsLoaded="areAccountsLoaded"
      :isSidebarOpen="isSidebarOpen"
      :SIDEBAR="SIDEBAR"
      @update:searchQuery="searchQuery = $event; updateFilteredAccounts(isSearching)"
      @menuOpened="onMenuOpened"
      @removeTag="removeTag"
      @removeType="removeType"
      @filtersChange="onFiltersChange"
      @addSearchFilter="addSearchFilter"
      @removeSearchFilter="removeSearchFilter"
      @changeSearchMode="changeSearchMode"
    />

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

  </div>
</template>

<script>
import { SessionExpiredException } from '../utils/errors'
import {
  mapState,
  mapWritableState,
  mapActions,
  mapStores
} from "pinia";
import { 
  useUserStore,
  useAccountsStore,
  useAlertStore,
  useUiStore
} from "@/store";
import LoadingAccountItem from "../components/LoadingAccountItem.vue";
import AccountItem from "../components/AccountItem.vue";
import RecentAccountList from "../components/RecentAccountList.vue";
import FavoriteAccountList from "../components/FavoriteAccountList.vue";
import FilteredAccountList from "../components/FilteredAccountList.vue";
import NoAccounts from "../components/NoAccounts.vue";
import SearchBar from "../components/SearchBar.vue";

const MIN_SEARCH_QUERY_LENGTH = 3;

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
      currentSearchMode: 'text',
      searchQuery: this.$route.query.search || "", // Default search query is looked up from query string,
      searchFilters: this.$route.query.filters ? JSON.parse(this.$route.query.filters) : [],
      filteredAccounts: [],
      accountsFetchingProgression: {
        isFetching: false,
        totalFetched: 0,
        total: 0,
      },
      lastScrollTop: 0,
    };
  },
  async created() {
    await this.loadCache();

    this.accountsStore.$subscribe(this.onAccountsLoaded);

    const urlQueryTags = this.$route.query.tags
      ? this.$route.query.tags.split(",").map((x) => x.trim())
      : [];
    this.applyFilters(this.searchQuery, urlQueryTags, true);

    if (this.$route.query.filters) {
      this.currentSearchMode = 'advanced';
    }

    this.$watch(
      'searchQuery',
      (newSearchQuery, oldSearchQuery) => {
        this.searchQuery = newSearchQuery; // This line helps to speed the query update on the input field

        if (this.$route.query.search != newSearchQuery) {
          this.$router.push({
            name: 'Home',
            query: {
              search: newSearchQuery,
              tags: this.$route.query.tags,
              type: this.$route.query.type,
            },
          });
        }

        this.updateFilteredAccounts(this.isSearching);
      },
      {
        immediate: true,
      }
    );

    this.$watch(
      '$route.query.tags',
      (newTags, oldTags) => {
        this.selectedTags =
          newTags && newTags.length
            ? newTags.split(",").map((x) => x.trim())
            : [];

        if (this.selectedTags.length) {
          this.currentSearchMode = 'tags';
        }

        this.updateFilteredAccounts(this.isSearching);
      },
      {
        immediate: true,
      }
    );

    this.$watch(
      '$route.query.type',
      (newTypes, oldTypes) => {
        this.selectedTypes =
          newTypes && newTypes.length
            ? newTypes.split(",").map((x) => x.trim())
            : [];

        if (this.selectedTypes.length) {
          this.currentSearchMode = 'tags';
        }

        this.updateFilteredAccounts(this.isSearching);
      },
      {
        immediate: true,
      }
    );
  },
  async mounted() {
    await this.fetchLatestAccounts();
  },
  computed: {
    ...mapStores(useAccountsStore),
    ...mapWritableState(useAccountsStore, ['selectedTags', 'selectedTypes']),
    ...mapState(useUserStore, ['user', 'hasAccounts']),
    ...mapState(useAccountsStore, [
      'totalFetchedAccounts',
      'totalAccounts',
      'areAccountsLoaded'
    ]),
    ...mapState(useUiStore, [
      'isSidebarOpen',
      'SIDEBAR',
    ]),

    isSearching: function () {
      return (
        (this.searchQuery &&
          this.searchQuery.length >= MIN_SEARCH_QUERY_LENGTH) ||
        this.selectedTags.length > 0 ||
        this.selectedTypes.length > 0 ||
        this.searchFilters.length > 0
      );
    }
  },
  methods: {
    ...mapActions(useAccountsStore, [
      'loadCache',
      'getAccountsFilteredByQuery',
      'applyFilters',
      'fetchAccounts',
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

    changeSearchMode: function (mode) {
      this.currentSearchMode = mode;

      if (mode == 'text' || mode == 'tags') {
        this.searchFilters = [];
      
        this.$router.push({
          name: 'Home',
          query: {
            search: this.searchQuery,
            tags: this.$route.query.tags,
            type: this.$route.query.type,
            filters: [],
          },
        });
      }

      if (mode == 'advanced') {
        this.searchQuery = '';

        // If no filters are set, add a default one
        if (!this.searchFilters.length) {
          this.addSearchFilter();
        }

        this.$router.push({
          name: 'Home',
          query: {
            search: this.searchQuery,
            tags: this.$route.query.tags,
            type: this.$route.query.type,
            filters: [],
          },
        });
      }
    },
    
    addSearchFilter: function () {
      this.searchFilters.push({
        field: 'label',
        comparison: 'includes',
        value: '',
      });
    },

    removeSearchFilter: function (filter) {
      this.searchFilters.splice(this.searchFilters.indexOf(filter), 1);

      this.onFiltersChange();
    },

    onFiltersChange: function () {
      const filledFilters = this.searchFilters.filter(f => f.value);

      if (filledFilters && filledFilters.length) {
        //Reset the search query to use the advanced search instead
        this.searchQuery = '';

        this.$router.push({
          name: 'Home',
          query: {
            search: this.searchQuery,
            tags: this.$route.query.tags,
            type: this.$route.query.type,
            filters: JSON.stringify(filledFilters),
          },
        });
      }

      this.updateFilteredAccounts(true);
    },

    displayProgress: function (current, total) {
      this.accountsFetchingProgression = {
        isFetching: true,
        totalFetched: current,
        total: total,
        progressionPercentage: Math.round((current / total) * 100),
      };
    },

    updateFilteredAccounts: function (applyFilters = true) {
      if (applyFilters) {
        this.accountsStore.updateFilters(
          this.searchQuery,
          this.selectedTags,
          this.selectedTypes, 
          this.searchFilters,
          true
        );
        this.filteredAccounts = this.accountsStore.filteredAccounts;
      } else {
        this.filteredAccounts = [];
      }
    },

    fetchLatestAccounts: async function () {
      try {
        await this.fetchAccounts();
      } catch (error) {
        if (error instanceof SessionExpiredException) {
          this.openAlert("Session expired", error.message, "danger");
          this.$router.go("/");
        } else {
          this.openAlert(
            error.name || "Error while loading accounts",
            error.message,
            "danger"
          );
        }
      }
    },
  },
};
</script>

<style>
.search-input-container {
  color: var(--color-text);
  margin: 20px auto 20px auto;
  padding: .2rem 0rem .2rem .5rem;
  border-radius: 2rem;
  z-index: 10;
  position: fixed;
  left: 0;
  right: 0;
  flex-direction: column;
  transition: all 0.5s;
}

@media (prefers-color-scheme: light) {
  .search-input-container {
    background-color: #FFFFFF;
  }

  .search-input-container.search-input-container--large {
    box-shadow: 2px 4px 12px rgb(0 0 0 / 8%);
  }
}

.search-input-container .btn-group {
  background: none;
}

@media (prefers-color-scheme: dark) {
  .search-input-container  {
    background-color: #453f4b;
  }
}

@media (min-width: 767.98px) {
  .search-input-container {
    top: 0.2rem;
    width: fit-content;
    min-width: 40%;
  }
}

@media (max-width: 767.98px) {
  .search-input-container {
    bottom: 2rem;
    width: fit-content;
    min-width: 80%;
  }
}

.search-input-container label.btn.active:hover {
  animation-name: jiggle;
  animation-iteration-count: infinite;
  animation-delay: -0.75;
  animation-duration: .25s
}

.search-input-container .btn-group {
  width: 100%;
}

.search-input {
  border-radius: var(--btn-border-radius);
  color: #000;
  line-height: 2.5;
  font-weight: 100;
  margin-right: .5rem;
  height: 2rem;
  background-color: #FFFFFF;
  backdrop-filter: blur(18px);
}

@media (prefers-color-scheme: dark) {
  .search-input {
    box-shadow: none;
    background-color: #57535e;
    color: rgb(162, 162, 162);
    border: 1px solid transparent;
  }
}

.search-input::placeholder {
  color: #818182;
}

@media (prefers-color-scheme: dark) {
  .search-input::placeholder {
    color: rgb(162, 162, 162);
  }
}

.search-input:hover,
.search-input:active,
.search-input:focus {
  background-color: var(--btn-color-background);
  box-shadow: 2px 4px 16px rgb(0 0 0 / 16%);
  transform: scale3d(1.01, 1.01, 1.01);
}

@media (prefers-color-scheme: light) {
  .search-input:hover,
  .search-input:focus-within,
  .search-input:active,
  .search-input:focus {
    border: none !important;
  }
}

@media (prefers-color-scheme: dark) {
  .search-input:hover,
  .search-input:focus-within,
  .search-input:active,
  .search-input:focus {
    border-color: gray;
    color: rgb(162, 162, 162);
    background: #464646;
    transform: none;
  }
}

.search-filters-container {
  padding: 0 0.5rem;
  align-items: center;
  transition: all 0.5s;
  display: flex;
  flex-direction: column;
  height: fit-content;
}

.search-filters-container .btn-filter,
.search-filters-container .filter {
  padding: 0.5rem;
  border-radius: 1rem;
  align-items: center;
  width: 100%;
  font-weight: 400;
}

@media (prefers-color-scheme: light) {
  .search-filters-container .btn-filter,
  .search-filters-container .filter {
    color: var(--color-text-mute);
  }
}

@media (prefers-color-scheme: dark) {
  .search-filters-container .btn-filter,
  .search-filters-container .filter {
    color: var(--color-text-mute);
  }
}

.search-filters-container .filter.input-group {
  display: flex;
  margin-bottom: .5rem;
}

.search-filters-container .btn-filter {
  margin-top: .5rem;
}

.search-filters-container .filter .btn {
  border: none;
}

.search-filters-container .btn-filter:hover {
  font-weight: 500;
  color: #0b84fe;
}

@media (prefers-color-scheme: light) {
  .search-filters-container .btn-filter,
  .search-filters-container .filter {
    background-color: #FFFFFF;
    box-shadow: 2px 4px 12px rgb(0 0 0 / 8%);
  }
}

@media (prefers-color-scheme: dark) {
  .search-filters-container .btn-filter,
  .search-filters-container .filter {
    background-color: #000000;
  }
}

@media (min-width: 767.98px) {
  .search-filters-container .btn-filter {
    min-width: 20rem;
  }
}

@media (max-width: 767.98px) {
  .search-filters-container .btn-filter {
    min-width: 10rem;
  }
}
</style>

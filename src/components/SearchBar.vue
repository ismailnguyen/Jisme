<template>
  <header class="search-input-container justify-content-center">
    <div class="btn-group" role="group">
      <i class="fa-solid fa-magnifying-glass search-glyph" aria-hidden="true" v-show="searchMode != 'advanced'"></i>

      <button
        type="button"
        v-show="searchMode != 'advanced'"
        class="btn active"
        v-for="(tag, tagIndex) in selectedTags"
        :key="tagIndex"
        :aria-label="'Remove tag filter ' + tag"
        @click="removeTag(tag)">
        {{ tag }}
        <i class="fa fa-close" aria-hidden="true"></i>
      </button>

      <button
        type="button"
        v-show="searchMode != 'advanced'"
        class="btn btn-secondary active"
        v-for="(type, typeIndex) in selectedTypes"
        :key="typeIndex"
        :aria-label="'Remove type filter ' + type"
        @click="removeType(type)">
        <i class="fa fa-user-secret" aria-hidden="true" v-if="type == 'account'"></i>
        <i class="fa fa-credit-card" aria-hidden="true" v-if="type == 'card'"></i>
        <i class="fa fa-building-columns" aria-hidden="true" v-if="type == 'bank'"></i>
        <i class="fa fa-id-card" aria-hidden="true" v-if="type == 'document'"></i>
        {{ type }}
        <i class="fa fa-close" aria-hidden="true"></i>
      </button>

      <input
        class="form-control search-input"
        type="search"
        name="search"
        v-model="localSearchQuery"
        :placeholder="searchPlaceholder"
        aria-label="Search your vault"
        autocapitalize="off"
        autocorrect="off"
        spellcheck="false"
        enterkeyhint="search"
        :disabled="!areAccountsLoaded"
        v-show="searchMode != 'advanced'"
      />

      <div class="search-filters-container" v-show="searchMode == 'advanced'">
        <div class="filter input-group" v-show="selectedTags.length || selectedTypes.length">
          <button
            type="button"
            class="btn active"
            v-for="(tag, tagIndex) in selectedTags"
            :key="tagIndex"
            :aria-label="'Remove tag filter ' + tag"
            @click="removeTag(tag)">
            {{ tag }}
            <i class="fa fa-close" aria-hidden="true"></i>
          </button>

          <button
            type="button"
            class="btn btn-secondary active"
            v-for="(type, typeIndex) in selectedTypes"
            :key="typeIndex"
            :aria-label="'Remove type filter ' + type"
            @click="removeType(type)">
            <i class="fa fa-user-secret" aria-hidden="true" v-if="type == 'account'"></i>
            <i class="fa fa-credit-card" aria-hidden="true" v-if="type == 'card'"></i>
            <i class="fa fa-building-columns" aria-hidden="true" v-if="type == 'bank'"></i>
            <i class="fa fa-id-card" aria-hidden="true" v-if="type == 'document'"></i>
            {{ type }}
            <i class="fa fa-close" aria-hidden="true"></i>
          </button>
        </div>

        <div
          v-for="(filter, filterIndex) in selectedFilters"
          :key="filterIndex"
          class="filter input-group">
          <select name="filterFields" aria-label="Field" class="custom-select form-control" v-model="filter.field" @change="onFiltersChange">
            <option value="_id">ID</option>
            <option selected value="label">Label</option>
            <option value="tags">Tags</option>
            <option value="platform" v-show="!selectedTypes.length || selectedTypes.includes('account')">Platform</option>
            <option value="login" v-show="!selectedTypes.length || selectedTypes.includes('account')">Login</option>
            <option value="login" v-show="!selectedTypes.length || selectedTypes.includes('account')">SSID</option>
            <option value="login" v-show="!selectedTypes.length || selectedTypes.includes('account')">Key ID</option>
            <option value="password" v-show="!selectedTypes.length || selectedTypes.includes('account')">Secret Key</option>
            <option value="password" v-show="!selectedTypes.length || selectedTypes.includes('account')">Password</option>
            <option value="is_password_less" v-show="!selectedTypes.length || selectedTypes.includes('account')">Is password less</option>
            <option value="password_clue" v-show="!selectedTypes.length || selectedTypes.includes('account')">Password clue</option>
            <option value="social_login" v-show="!selectedTypes.length || selectedTypes.includes('account')">Social login</option>
            <option value="platform" v-show="!selectedTypes.length || selectedTypes.includes('card')">Provider</option>
            <option value="card_number" v-show="!selectedTypes.length || selectedTypes.includes('card')">Card number</option>
            <option value="card_name" v-show="!selectedTypes.length || selectedTypes.includes('card')">Name on card</option>
            <option value="card_expiracy" v-show="!selectedTypes.length || selectedTypes.includes('card')">Card expiry</option>
            <option value="card_cryptogram" v-show="!selectedTypes.length || selectedTypes.includes('card')">Card cryptogram</option>
            <option value="card_pin" v-show="!selectedTypes.length || selectedTypes.includes('card')">Card PIN</option>
            <option value="password" v-show="!selectedTypes.length || selectedTypes.includes('bank')">IBAN</option>
            <option value="login" v-show="!selectedTypes.length || selectedTypes.includes('document')">Account holder</option>
            <option value="platform" v-show="!selectedTypes.length || selectedTypes.includes('document')">BIC/SWIFT</option>
            <option value="card_number" v-show="!selectedTypes.length || selectedTypes.includes('document')">Card number</option>
            <option value="card_name" v-show="!selectedTypes.length || selectedTypes.includes('document')">Name on card</option>
            <option value="card_expiracy" v-show="!selectedTypes.length || selectedTypes.includes('document')">Card expiry</option>
            <option value="platform" v-show="!selectedTypes.length || selectedTypes.includes('document')">Issued by</option>
            <option value="description">Description</option>
            <option value="notes">Notes</option>
          </select>
          <select aria-label="Comparison" class="custom-select form-control" v-model="filter.comparison" @change="onFiltersChange">
            <option selected value="includes">Includes</option>
            <option value="equals">Equals</option>
            <option value="excludes">Excludes</option>
          </select>
          <input :name="'filterValue'+filterIndex" placeholder="Value (e.g. Simpson)" aria-label="Value" type="text" class="form-control" v-model="filter.value" @change="onFiltersChange">
          <button class="btn btn-light" type="button" aria-label="Remove filter" @click="removeSearchFilter(filter)" v-show="selectedFilters.length > 1">
            <i class="fa fa-close" aria-hidden="true"></i>
          </button>
        </div>

        <button class="btn btn-filter" @click="addSearchFilter()">
          <i class="fa fa-plus"></i>
          Add filter
        </button>
      </div>
     
      <button
        type="button"
        v-show="searchMode != 'advanced' && (localSearchQuery || selectedTags.length || selectedTypes.length)"
        class="btn"
        aria-label="Clear search and filters"
        @click="clearSearch()">
        <i class="fa fa-close" aria-hidden="true"></i>
      </button>

      <button
        type="button"
        v-show="searchMode == 'advanced'"
        class="btn"
        aria-label="Back to simple search"
        @click="changeSearchMode('text')">
        <i class="fa fa-search" aria-hidden="true"></i>
      </button>

      <button
        type="button"
        v-show="searchMode != 'advanced'"
        class="btn"
        aria-label="Filters"
        :aria-pressed="searchMode == 'advanced' ? 'true' : 'false'"
        @click="changeSearchMode('advanced')">
        <i class="fa fa-filter" aria-hidden="true"></i>
      </button>
    </div>
  </header>
</template>

<script>
import "../assets/search_bar.css";

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

export default {
  emits: ['menuOpened'],
  data() {
    return {
      localSearchQuery: this.$route.query.search || '', // Default search query is looked up from query string
      searchMode: 'text',
      filteredAccounts: []
    };
  },
  async created() {
    this.$watch(
      '$route.query.tags',
      (newTags, oldTags) => {
        this.selectedTags =
          newTags && newTags.length
            ? newTags.split(",").map((x) => x.trim())
            : [];

        this.updateFilteredAccounts(this.isSearching);
      },
      {
        immediate: true
      }
    );

    this.$watch(
      '$route.query.type',
      (newTypes, oldTypes) => {
        this.selectedTypes =
          newTypes && newTypes.length
            ? newTypes.split(",").map((x) => x.trim())
            : [];

        this.updateFilteredAccounts(this.isSearching);
      },
      {
        immediate: true,
      }
    );
  },
  watch: {
    localSearchQuery(newSearchQuery) {
        this.searchQuery = newSearchQuery; // This line helps to speed the query update on the input field

        // replace, not push: Back should leave the search, not undo it one letter at a time
        if (this.$route.query.search != newSearchQuery) {
          this.$router.replace({
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
  },
  async mounted() {
    this.searchQuery = this.localSearchQuery;
    this.selectedTags = this.$route.query.tags
      ? this.$route.query.tags.split(',').map((x) => x.trim())
      : [];
    this.selectedTypes = this.$route.query.type
      ? this.$route.query.type.split(',').map((x) => x.trim())
      : [];;
    this.selectedFilters = this.$route.query.filters
      ? JSON.parse(this.$route.query.filters)
      : [];

    this.updateFilteredAccounts(true);

    if (this.$route.query.filters) {
      this.changeSearchMode('advanced');
    }
  },
  computed: {
    ...mapStores(useAccountsStore),
    ...mapWritableState(useAccountsStore, [
        'searchQuery',
        'selectedTags',
        'selectedTypes',
        'selectedFilters',
        'isSearching'
    ]),
    ...mapState(useUserStore, [
        'user',
        'hasAccounts'
    ]),
    ...mapState(useAccountsStore, [
      'totalFetchedAccounts',
      'totalAccounts',
      'areAccountsLoaded'
    ]),
    ...mapState(useUiStore, [
      'isSidebarOpen',
      'SIDEBAR'
    ]),

    searchPlaceholder() {
      const names = { account: 'credentials', card: 'cards', document: 'documents', bank: 'banks' };

      if (this.selectedTypes.length === 1 && names[this.selectedTypes[0]]) {
        return 'Search ' + names[this.selectedTypes[0]];
      }

      return (this.selectedTypes.length || this.selectedTags.length) ? 'Search within filters' : 'Search';
    }
  },
  methods: {
    ...mapActions(useAlertStore, ['openAlert']),
    ...mapActions(useUiStore, [
        'toggleAdvancedSearchMode'
    ]),

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

    clearSearch: function () {
      this.localSearchQuery = '';

      this.$router.push({ name: 'Home', query: {} });
    },

    changeSearchMode: function (mode) {
      let previousMode = this.searchMode;
      this.searchMode = mode;

      if (mode === 'text' || mode === 'tags') {
        this.toggleAdvancedSearchMode(false);


        // When coming from the advanced search mode, reset the search query
        if (previousMode == 'advanced') {
            // if selected filters contained just one filter, it was probably a search query
            if (this.selectedFilters.length === 1) {
              this.localSearchQuery = this.selectedFilters[0].value;
            } else {
            // Otherwise if there were many filters, reset the search query,
            // because unable to know which field to use for query
              this.localSearchQuery = '';
            }
        }

        // Reset the selected filters
        this.selectedFilters = [];
      
        this.$router.push({
          name: 'Home',
          query: {
            search: this.localSearchQuery,
            tags: this.$route.query.tags,
            type: this.$route.query.type,
            filters: [],
          },
        });
      }

      if (mode === 'advanced') {
        this.toggleAdvancedSearchMode(true);

        // If no filters are set, add a default one with the current search query in Label field
        if (!this.selectedFilters.length) {
          this.addSearchFilter(this.localSearchQuery);
        }

        this.localSearchQuery = '';

        this.$router.push({
          name: 'Home',
          query: {
            search: this.localSearchQuery,
            tags: this.$route.query.tags,
            type: this.$route.query.type,
            filters: [],
          },
        });
      }
    },
    
    addSearchFilter: function (defaultQuery = '') {
      this.selectedFilters.push({
        field: 'label',
        comparison: 'includes',
        value: defaultQuery,
      });
    },

    removeSearchFilter: function (filter) {
      this.selectedFilters.splice(this.selectedFilters.indexOf(filter), 1);

      this.onFiltersChange();
    },

    onSearchQueryChanged: function (mutation, state) {
      if (this.$route.query.search != state.searchQuery) {
          this.$router.push({
            name: 'Home',
            query: {
              search: state.searchQuery,
              tags: this.$route.query.tags,
              type: this.$route.query.type,
            },
          });
        }

        if (this.$route.query.tags != state.selectedTags.join(',')) {
          this.$router.push({
            name: 'Home',
            query: {
              search: state.searchQuery,
              tags: state.selectedTags && state.selectedTags.length
              ? state.selectedTags.split(',').map((x) => x.trim())
              : [],
              type: this.$route.query.type,
            },
          });
        }

        if (this.$route.query.tags != state.selectedTypes.join(',')) {
          this.$router.push({
            name: 'Home',
            query: {
              search: state.searchQuery,
              tags: this.$route.query.tags,
              type: state.selectedTypes && state.selectedTypes.length
              ? state.selectedTypes.split(',').map((x) => x.trim())
              : [],
            },
          });
        }

        this.updateFilteredAccounts(this.isSearching);
    },

    onFiltersChange: function (event) {
      const filledFilters = this.selectedFilters.filter(f => f.value);

      if (filledFilters && filledFilters.length) {
        //Reset the search query to use the advanced search instead
        this.localSearchQuery = '';

        this.$router.push({
          name: 'Home',
          query: {
            search: this.localSearchQuery,
            tags: this.$route.query.tags,
            type: this.$route.query.type,
            filters: JSON.stringify(filledFilters),
          },
        });
      }

      this.updateFilteredAccounts(true);
    },

    updateFilteredAccounts: function (applyFilters = true) {
      if (applyFilters) {
        this.filteredAccounts = this.accountsStore.filteredAccounts;
      } else {
        this.filteredAccounts = [];
      }
    },

    triggerSearchFilter() {
      this.updateFilteredAccounts(true);
    },
  },
};
</script>

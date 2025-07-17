<template>
  <header class="search-input-container justify-content-center">
    <div class="btn-group" role="group">
      <label
        class="btn"
        :class="isSidebarOpen(SIDEBAR.MENU) ? 'active' : ''"
        for="navbar_toggle-menu"
        @click="onMenuOpened">
        <i class="fa fa-bars-staggered"></i>
      </label>

      <label
        v-show="searchMode == 'tags'"
        class="btn active"
        v-for="(tag, tagIndex) in selectedTags"
        :key="tagIndex"
        @click="removeTag(tag)"
        :for="'navbar_tag'+tag">
        {{ tag }}
        <i class="fa fa-close"></i>
      </label>

      <label
        v-show="searchMode == 'tags'"
        class="btn btn-secondary active"
        v-for="(type, typeIndex) in selectedTypes"
        :key="typeIndex"
        @click="removeType(type)"
        :for="'navbar_type'+type">
        <i class="fa fa-user-secret" aria-hidden="true" v-if="type == 'account'"></i>
        <i class="fa fa-credit-card" aria-hidden="true" v-if="type == 'card'"></i>
        <i class="fa fa-building-columns" aria-hidden="true" v-if="type == 'bank'"></i>
        <i class="fa fa-id-card" aria-hidden="true" v-if="type == 'document'"></i>
        {{ type }}
        <i class="fa fa-close"></i>
      </label>

      <input
        class="form-control search-input"
        type="search"
        name="search"
        v-model="localSearchQuery"
        placeholder="Search"
        :disabled="!areAccountsLoaded"
        v-show="searchMode == 'text'"
      />

      <div class="search-filters-container" v-show="searchMode == 'advanced'">
        <div class="filter input-group" v-show="selectedTags.length || selectedTypes.length">
          <label
            class="btn active"
            v-for="(tag, tagIndex) in selectedTags"
            :key="tagIndex"
            @click="removeTag(tag)"
            :for="'navbar_tag'+tag">
            {{ tag }}
            <i class="fa fa-close"></i>
          </label>

          <label
            class="btn btn-secondary active"
            v-for="(type, typeIndex) in selectedTypes"
            :key="typeIndex"
            @click="removeType(type)"
            :for="'navbar_type'+type">
            <i class="fa fa-user-secret" aria-hidden="true" v-if="type == 'account'"></i>
            <i class="fa fa-credit-card" aria-hidden="true" v-if="type == 'card'"></i>
            <i class="fa fa-building-columns" aria-hidden="true" v-if="type == 'bank'"></i>
            <i class="fa fa-id-card" aria-hidden="true" v-if="type == 'document'"></i>
            {{ type }}
            <i class="fa fa-close"></i>
          </label>
        </div>

        <div
          v-for="(filter, filterIndex) in selectedFilters"
          :key="filterIndex"
          class="filter input-group">
          <select name="filterFields" class="custom-select form-control" v-model="filter.field" @change="onFiltersChange">
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
            <option value="card_expiracy" v-show="!selectedTypes.length || selectedTypes.includes('card')">Card expiracy</option>
            <option value="card_cryptogram" v-show="!selectedTypes.length || selectedTypes.includes('card')">Card cryptogram</option>
            <option value="card_pin" v-show="!selectedTypes.length || selectedTypes.includes('card')">Card PIN</option>
            <option value="password" v-show="!selectedTypes.length || selectedTypes.includes('bank')">IBAN</option>
            <option value="login" v-show="!selectedTypes.length || selectedTypes.includes('document')">Account holder</option>
            <option value="platform" v-show="!selectedTypes.length || selectedTypes.includes('document')">BIC/SWIFT</option>
            <option value="card_number" v-show="!selectedTypes.length || selectedTypes.includes('document')">Card number</option>
            <option value="card_name" v-show="!selectedTypes.length || selectedTypes.includes('document')">Name on card</option>
            <option value="card_expiracy" v-show="!selectedTypes.length || selectedTypes.includes('document')">Card expiracy</option>
            <option value="platform" v-show="!selectedTypes.length || selectedTypes.includes('document')">Issued by</option>
            <option value="description">Description</option>
            <option value="notes">Notes</option>
          </select>
          <select class="custom-select form-control" v-model="filter.comparison" @change="onFiltersChange">
            <option selected value="includes">Includes</option>
            <option value="equals">Equals</option>
            <option value="excludes">Excludes</option>
          </select>
          <input :name="'filterValue'+filterIndex" placeholder="Field value (i.e; Simpson)" type="text" class="form-control" v-model="filter.value" @change="onFiltersChange">
          <button class="btn btn-light" type="button" @click="removeSearchFilter(filter)" v-show="selectedFilters.length > 1">
            <i class="fa fa-close"></i>
          </button>
        </div>

        <button class="btn btn-filter" @click="addSearchFilter()">
          <i class="fa fa-plus"></i>
          Add filter
        </button>
      </div>
     
      <label
        v-show="searchMode == 'text' && (selectedTags.length || selectedTypes.length)"
        class="btn"
        @click="changeSearchMode('tags')"
        for="navbar_close-search">
        <i class="fa fa-close"></i>
      </label>

      <label
        v-show="searchMode == 'tags' || searchMode == 'advanced'"
        class="btn"
        @click="changeSearchMode('text')"
        for="navbar_show-search">
        <i class="fa fa-search"></i>
      </label>

       <label
        v-show="searchMode == 'text' || searchMode == 'tags'"
        class="btn"
        @click="changeSearchMode('advanced')"
        for="navbar_close-search">
        <i class="fa fa-filter"></i>
      </label>
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

        if (this.selectedTags.length && this.selectedTags.length < 3) {
          this.changeSearchMode('tags');
        }
        else if (this.selectedTags.length && this.selectedTags.length > 2) {
          this.changeSearchMode('advanced');
        }

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

        if (this.selectedTypes.length) {
          this.changeSearchMode('tags');
        }

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
    ])
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

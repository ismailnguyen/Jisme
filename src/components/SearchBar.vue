<template>
  <header class="search-input-container justify-content-center" :class="currentSearchMode == 'advanced' ? 'search-input-container--large' : ''">
    <div class="btn-group" role="group">
      <label
        class="btn"
        :class="isSidebarOpen(SIDEBAR.MENU) ? 'active' : ''"
        for="navbar_toggle-menu"
        @click="$emit('menuOpened')">
        <i class="fa fa-bars-staggered"></i>
      </label>

      <label
        v-show="currentSearchMode == 'tags'"
        class="btn active"
        v-for="(tag, tagIndex) in selectedTags"
        :key="tagIndex"
        @click="$emit('removeTag', tag)"
        :for="'navbar_tag'+tag">
        {{ tag }}
        <i class="fa fa-close"></i>
      </label>

      <label
        v-show="currentSearchMode == 'tags'"
        class="btn btn-secondary active"
        v-for="(type, typeIndex) in selectedTypes"
        :key="typeIndex"
        @click="$emit('removeType', type)"
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
        :value="searchQuery"
        @input="$emit('update:searchQuery', $event.target.value)"
        placeholder="Search"
        :disabled="!areAccountsLoaded"
        v-show="currentSearchMode == 'text'"
      />

      <div class="search-filters-container" v-show="currentSearchMode == 'advanced'">
        <div class="filter input-group" v-show="selectedTags.length || selectedTypes.length">
          <label
            class="btn active"
            v-for="(tag, tagIndex) in selectedTags"
            :key="tagIndex"
            @click="$emit('removeTag', tag)"
            :for="'navbar_tag'+tag">
            {{ tag }}
            <i class="fa fa-close"></i>
          </label>

          <label
            class="btn btn-secondary active"
            v-for="(type, typeIndex) in selectedTypes"
            :key="typeIndex"
            @click="$emit('removeType', type)"
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
          v-for="(filter, filterIndex) in searchFilters"
          :key="filterIndex"
          class="filter input-group">
          <select class="custom-select form-control" v-model="filter.field" @change="$emit('filtersChange')">
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
          <select class="custom-select form-control" v-model="filter.comparison" @change="$emit('filtersChange')">
            <option selected value="includes">Includes</option>
            <option value="equals">Equals</option>
            <option value="excludes">Excludes</option>
          </select>
          <input placeholder="Field value (i.e; Simpson)" type="text" class="form-control" v-model="filter.value" @input="$emit('filtersChange')">
          <button class="btn btn-light" type="button" @click="$emit('removeSearchFilter', filter)">
            <i class="fa fa-close"></i>
          </button>
        </div>

        <button class="btn btn-filter" @click="$emit('addSearchFilter')">
          <i class="fa fa-plus"></i>
          Add filter
        </button>
      </div>

      <label
        v-show="currentSearchMode == 'text'"
        class="btn"
        @click="$emit('changeSearchMode', 'advanced')"
        for="navbar_close-search">
        <i class="fa fa-filter"></i>
      </label>
     
      <label
        v-show="currentSearchMode == 'text' && (selectedTags.length || selectedTypes.length)"
        class="btn"
        @click="$emit('changeSearchMode', 'tags')"
        for="navbar_close-search">
        <i class="fa fa-close"></i>
      </label>

      <label
        v-show="currentSearchMode == 'tags' || currentSearchMode == 'advanced'"
        class="btn"
        @click="$emit('changeSearchMode', 'text')"
        for="navbar_show-search">
        <i class="fa fa-search"></i>
      </label>
    </div>
  </header>
</template>

<script>
export default {
  props: {
    currentSearchMode: String,
    searchQuery: String,
    selectedTags: Array,
    selectedTypes: Array,
    searchFilters: Array,
    areAccountsLoaded: Boolean,
    isSidebarOpen: Function,
    SIDEBAR: Object
  }
};
</script>

<style scoped>
@import "../assets/auth.css";
@import "../assets/base.css";
@import "../assets/bottom_sheet.css";
@import "../assets/card.css";
@import "../assets/home.css";
@import "../assets/tray.css";
</style>

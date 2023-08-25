import 'core-js/stable';

import Vue from 'vue'
import App from './App.vue'

import router from './router'
import store from './store'
import registerServiceWorker from './service-worker'

if (process.env.NODE_ENV === 'production') {
  registerServiceWorker();
}

new Vue({
    el: '#app',
    router,
    store,
    beforeCreate() {
      this.$store.commit('initialiseStore');
    },
    render: h => h(App)
});
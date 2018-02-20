import Vue from 'vue'
import App from './components/App.vue'

import router from './router'
import store from './store'

if ('serviceWorker' in navigator)
{
    if (navigator.serviceWorker.controller)
    {
        console.log('[PWA Builder] active service worker found, no need to register')
    }
    else
    {
        //Register the ServiceWorker
        navigator.serviceWorker.register('service-worker.js', 
        {
            scope: './'
        }).then(function(reg) {
            console.log('Service worker has been registered for scope:' + reg.scope);
        });
    }
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
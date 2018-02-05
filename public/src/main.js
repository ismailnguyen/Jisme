import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter);

import App from './components/App.vue'
import Dashboard from './components/Dashboard.vue'
import Login from './components/Login.vue'
import Register from './components/Register.vue'

import { requireAuth } from './utils/auth'

const router = new VueRouter({
    mode: 'history',
    routes: [
        { 
            path: '/',
            beforeEnter: requireAuth,
            component: Dashboard },
        //{ path: '/tag/:tag', component: Tag },
        { path: '/login', component: Login },
        { path: '/register', component: Register }
    ]
});

new Vue({
    el: '#app',
    router,
    render: h => h(App)
});
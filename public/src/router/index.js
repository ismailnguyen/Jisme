import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter);

import Dashboard from '../components/Dashboard.vue'
import Login from '../components/Login.vue'
import Register from '../components/Register.vue'

import { requireAuth } from '../utils/auth'

const router = new VueRouter({
    mode: 'history',
    routes: [
        {
            name: 'Dashboard',
            path: '/',
            beforeEnter: requireAuth,
            component: Dashboard 
        },
        {
            name: 'Tag',
            path: '/t/:tag', 
            component: Dashboard 
        },
        {
            name: 'Login',
            path: '/login', 
            component: Login 
        },
        {
            name: 'Register',
            path: '/register', 
            component: Register 
        }
    ]
});

export default router;
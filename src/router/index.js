import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter);

import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import JsonPrint from '../views/JsonPrint.vue'

import { requireAuth } from '../utils/auth'

const router = new VueRouter({
    mode: 'history',
    routes: [
        {
            path: '*',
            redirect: '/'
        },
		{
            name: 'Home',
            path: '/',
            beforeEnter: requireAuth,
            component: Home 
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
        },
        {
            name: 'JsonPrint',
            path: '/json',
            component: JsonPrint 
        }
    ]
});

export default router;
import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter);

import AccountList from '../views/AccountList.vue'
import TagList from '../views/TagList.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'

import { requireAuth } from '../utils/auth'

const router = new VueRouter({
    mode: 'history',
    routes: [
        {
            name: 'AccountList',
            path: '/',
            beforeEnter: requireAuth,
            component: AccountList 
        },
        {
            name: 'Tag',
            path: '/tag/:tag', 
            component: AccountList 
        },
        {
            name: 'TagList',
            path: '/tags', 
            component: TagList 
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
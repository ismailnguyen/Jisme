import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter);

import AccountList from '../components/AccountList.vue'
import TagList from '../components/TagList.vue'
import Login from '../components/Login.vue'
import Register from '../components/Register.vue'

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
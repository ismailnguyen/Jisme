import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter);

import AccountList from '../views/AccountList.vue'
import Login from '../views/Login.vue'
import VerifyMFA from '../views/VerifyMFA.vue'
import Register from '../views/Register.vue'
import JsonPrint from '../views/JsonPrint.vue'
import Settings from '../views/Settings.vue'

import { requireAuth } from '../utils/auth'

const router = new VueRouter({
    mode: 'history',
    routes: [
        {
            path: '*',
            redirect: '/'
        },
		{
            name: 'AccountList',
            path: '/',
            beforeEnter: requireAuth,
            component: AccountList,
            props: { menubar: true }
        },
        {
            name: 'Settings',
            path: '/Settings',
            beforeEnter: requireAuth,
            component: Settings,
            props: { menubar: false }

        },
        {
            name: 'Login',
            path: '/login', 
            component: Login,
            props: { menubar: false }
        },
        {
            name: 'VerifyMFA',
            path: '/VerifyMFA',
            component: VerifyMFA,
            props: { menubar: false }
        },
        {
            name: 'Register',
            path: '/register', 
            component: Register,
            props: { menubar: false }
        },
        {
            name: 'JsonPrint',
            path: '/json',
            beforeEnter: requireAuth,
            component: JsonPrint,
            props: { menubar: false }
        }
    ]
});

export default router;
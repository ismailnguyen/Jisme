import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/:pathMatch(.*)*',
      redirect: '/home',
      meta: { requiresAuth: true, showFooter: false }
    },
    {
      name: 'Home',
      path: '/home',
      component: () => import('../views/Home.vue'),
      meta: { requiresAuth: true, showFooter: false }
    },
    {
      name: 'Settings',
      path: '/settings',
      component: () => import('../views/Home.vue'),
      meta: { requiresAuth: true, showFooter: false },
      props: { isAnySidebarOpen: true, sidebarName: 'settings' }
    },
    {
      name: 'SettingsProfile',
      path: '/settings/profile',
      component: () => import('../views/Home.vue'),
      meta: { requiresAuth: true, showFooter: false },
      props: { isAnySidebarOpen: true, sidebarName: 'settings_profile' }
    },
    {
      name: 'SettingsSecurity',
      path: '/settings/security',
      component: () => import('../views/Home.vue'),
      meta: { requiresAuth: true, showFooter: false },
      props: { isAnySidebarOpen: true, sidebarName: 'settings_security' }
    },
    {
      name: 'SettingsRecentActivities',
      path: '/settings/recent-activities',
      component: () => import('../views/Home.vue'),
      meta: { requiresAuth: true, showFooter: false },
      props: { isAnySidebarOpen: true, sidebarName: 'settings_recent-activities' }
    },
    {
      name: 'TagsList',
      path: '/tags',
      component: () => import('../views/Home.vue'),
      meta: { requiresAuth: true, showFooter: false },
      props: { isAnySidebarOpen: true, sidebarName: 'tags-list' }
    },
    {
      name: 'TagsTree',
      path: '/tagsTree',
      component: () => import('../views/Home.vue'),
      meta: { requiresAuth: true, showFooter: false },
      props: { isAnySidebarOpen: true, sidebarName: 'tags-tree' }
    },
    {
      name: 'AddAccount',
      path: '/add-account',
      component: () => import('../views/Home.vue'),
      meta: { requiresAuth: true, showFooter: false },
      props: { isAnySidebarOpen: true, sidebarName: 'add-account' }
    },
    {
      name: 'Menu',
      path: '/menu',
      component: () => import('../views/Home.vue'),
      meta: { requiresAuth: true, showFooter: false },
      props: { isAnySidebarOpen: true, sidebarName: 'menu' }
    },
    {
      name: 'Login',
      path: '/login', 
      component: () => import('../views/login/RequestLogin.vue'),
      meta: { requiresAuth: false, showFooter: true }
    },
    {
      name: 'VerifyPasskey',
      path: '/login/passkey', 
      component: () => import('../views/login/VerifyPasskey.vue'),
      meta: { requiresAuth: false, showFooter: true }
    },
    {
      name: 'VerifyPassword',
      path: '/login/password',
      component: () => import('../views/login/VerifyPassword.vue'),
      meta: { requiresAuth: false, showFooter: true }
    },
    {
      name: 'VerifyOTP',
      path: '/login/otp',
      component: () => import('../views/login/VerifyOTP.vue'),
      meta: { requiresAuth: false, showFooter: true }
    },
    {
      name: 'Register',
      path: '/register', 
      component: () => import('../views/Register.vue'),
      meta: { requiresAuth: false, showFooter: true }
    },
    {
      name: 'JsonPrint',
      path: '/json',
      component: () => import('../views/JsonPrint.vue'),
      meta: { requiresAuth: true, showFooter: false }
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  // If authentication is required and user is not logged in redirect to login page
  if (to.meta.requiresAuth && !useUserStore()?.isLoggedIn) {
    next({
      path: '/login',
    });
  }
  // If a logged in used tries to access the login page redirect to home
  else if (!to.meta.requiresAuth && useUserStore()?.isLoggedIn) {
    next({
      path: '/home',
    });
  }
  else
    {
        next();
    }
})

export default router

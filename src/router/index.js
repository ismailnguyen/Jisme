import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/:pathMatch(.*)*',
      redirect: '/home',
      meta: { requiresAuth: true }
    },
    {
      name: 'Home',
      path: '/home',
      component: () => import('../views/Home.vue'),
      meta: { requiresAuth: true }
    },
    {
      name: 'Login',
      path: '/login', 
      component: () => import('../views/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      name: 'VerifyMFA',
      path: '/VerifyMFA',
      component: () => import('../views/VerifyMFA.vue'),
      meta: { requiresAuth: false }
    },
    {
      name: 'Register',
      path: '/register', 
      component: () => import('../views/Register.vue'),
      meta: { requiresAuth: false }
    },
    {
      name: 'Tags',
      path: '/tags',
      component: () => import('../views/TagsList.vue'),
      meta: { requiresAuth: true }
    },
    {
      name: 'JsonPrint',
      path: '/json',
      component: () => import('../views/JsonPrint.vue'),
      meta: { requiresAuth: true }
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

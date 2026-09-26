import { createApp } from 'vue'
import { createPinia } from 'pinia'

import { useUserStore } from '@/store'

import App from './App.vue'
import router from './router'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
// initialize the user before mounting the routes to avoid redirecting to login
await useUserStore().init()

app.use(router)

app.mount('#app')

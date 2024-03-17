import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

const store = defineStore('alert', () => {
    const currentAlert = ref(null)

    const hasAlert = computed(() => currentAlert.value !== null)

    const openAlert = (alert) => {
        currentAlert.value = alert
    }

    const clearAlert = () => {
        currentAlert.value = null
    }

    return {    
        currentAlert,

        hasAlert,
        openAlert,
        clearAlert

    }
})

export default store
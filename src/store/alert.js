import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import Alert from '../models/Alert'

const store = defineStore('alert', () => {
    const currentAlert = ref(null);

    const hasAlert = computed(() => currentAlert.value !== null);

    const openAlert = (title, message, type = 'info', image = null) => {
        currentAlert.value = new Alert(title, message, type, image);
    };

    const clearAlert = () => {
        currentAlert.value = null;
    };

    return {
        currentAlert,

        hasAlert,
        openAlert,
        clearAlert
    };
});

export default store;
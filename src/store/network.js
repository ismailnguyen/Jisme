import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

const store = defineStore('network', () => {
  const isOnline = ref(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const lastChangedAt = ref(Date.now());

  const isOffline = computed(() => !isOnline.value);

  function setOnline(status = true) {
    isOnline.value = !!status;
    lastChangedAt.value = Date.now();
  }

  function setOffline() {
    isOnline.value = false;
    lastChangedAt.value = Date.now();
  }

  function initNetworkListeners() {
    if (typeof window === 'undefined') return;
    // Initialize current state
    setOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);

    const onOnline = () => setOnline(true);
    const onOffline = () => setOffline();

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
  }

  return {
    // state
    isOnline,
    isOffline,
    lastChangedAt,

    // actions
    setOnline,
    setOffline,
    initNetworkListeners,
  };
});

export default store;


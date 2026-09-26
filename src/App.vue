<template>
    <RouterView />

    <AlertBox v-if="hasAlert" />

    <Footer v-if="$route.meta.showFooter" />
</template>

<script>
    import '@fortawesome/fontawesome-free/css/all.css';
    import './assets/base.css';
    import './assets/pwa.css';

    import {
        useAlertStore,
        useUserStore,
        useAccountsStore,
        useNetworkStore
    } from '@/store';
    import { 
        mapState,
        mapActions,
        mapStores
    } from 'pinia'
    import AlertBox from './components/AlertBox.vue';
    import Footer from './components/Footer.vue';
    import { AUTO_LOCK_BACKGROUND_MS, AUTO_LOCK_IDLE_MS } from './utils/secrets';

    const ACTIVITY_EVENTS = ['pointerdown', 'keydown', 'touchstart', 'wheel'];

    export default {
        components: {
            AlertBox,
            Footer
        },
        created() {
            // alertStore is accessible from mapStores(useAlertStore)
            // Restart the dismiss timer only when a new alert replaces the current one
            this.$watch(() => this.alertStore.currentAlert, (alert) => {
                if (alert) {
                    this.showAlert(alert);
                }
            });

            this.hiddenAt = null;
            this.idleTimer = null;
            this.alertTimer = null;

            // If anytime user logs out, redirect to login page
            this.userStore.$subscribe((mutation, state) => {
                if (!state.isLoggedIn) {
                    this.$router.push({ name: 'Login' });
                }
            })

            // Initialize network listeners
            if (this.networkStore && this.networkStore.initNetworkListeners) {
                this.networkStore.initNetworkListeners();
            }

            // Initialize offline sync listeners
            if (this.accountsStore && this.accountsStore.initSyncListeners) {
                this.accountsStore.initSyncListeners();
            }
            // Try processing any pending outbox on startup if online
            if (this.accountsStore && this.accountsStore.processOutbox && this.networkStore.isOnline) {
                this.accountsStore.processOutbox();
            }
        },
        mounted() {
            document.addEventListener('visibilitychange', this.onVisibilityChange);
            ACTIVITY_EVENTS.forEach(name => window.addEventListener(name, this.onActivity, { passive: true }));
            this.resetIdleTimer();
        },
        beforeUnmount() {
            document.removeEventListener('visibilitychange', this.onVisibilityChange);
            ACTIVITY_EVENTS.forEach(name => window.removeEventListener(name, this.onActivity));
            clearTimeout(this.idleTimer);
            clearTimeout(this.alertTimer);
        },
        computed: {
            ...mapStores(useAlertStore, useUserStore, useAccountsStore, useNetworkStore),
            ...mapState(useAlertStore, ['hasAlert']),
            ...mapState(useUserStore, ['isLoggedIn']),
        },
        methods: {
            ...mapActions(useAlertStore, [
                'openAlert',
                'clearAlert'
            ]),

            showAlert: function (alert) {
                // Errors stay longer: they usually need reading
                const duration = alert.type === 'danger' || alert.type === 'warning' ? 8000 : 4000;

                clearTimeout(this.alertTimer);
                this.alertTimer = setTimeout(() => {
                    this.clearAlert();
                }, duration);
            },

            // Auto-lock: a phone left unlocked must not leave the vault unlocked
            onVisibilityChange: function () {
                if (document.visibilityState === 'hidden') {
                    this.hiddenAt = Date.now();
                    return;
                }

                if (this.hiddenAt && Date.now() - this.hiddenAt >= AUTO_LOCK_BACKGROUND_MS) {
                    this.userStore.lock('Locked while Jisme was in the background.');
                }

                this.hiddenAt = null;
                this.resetIdleTimer();
            },

            onActivity: function () {
                this.resetIdleTimer();
            },

            resetIdleTimer: function () {
                clearTimeout(this.idleTimer);
                this.idleTimer = setTimeout(() => {
                    this.userStore.lock('Locked after 10 minutes without activity.');
                }, AUTO_LOCK_IDLE_MS);
            },
        }
    }
</script>

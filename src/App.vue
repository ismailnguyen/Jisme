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

    export default {
        components: {
            AlertBox,
            Footer
        },
        created() {
            // alertStore is accessible from mapStores(useAlertStore)
            this.alertStore.$subscribe((mutation, state) => {
                if (this.hasAlert) {
                    this.showAlert();
                }
            })

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

            showAlert: function () {
                // After few seconds, clear the alert
                setTimeout(() => {
                    this.clearAlert();
                }
                , 5000);
            },
        }
    }
</script>

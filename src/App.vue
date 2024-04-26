<template>
    <RouterView />

    <AlertBox v-if="hasAlert" />
</template>

<script>
    import '@fortawesome/fontawesome-free/css/all.css';
    // import './assets/dotted_white_theme.css'; // Optional theme (Work in progress)
    import './assets/base.css';
    import './assets/sidebar.css';

    import {
        useAlertStore,
        useUserStore
    } from '@/store';
    import { 
        mapState,
        mapActions,
        mapStores
    } from 'pinia'
    import AlertBox from './components/AlertBox.vue';

    export default {
        components: {
            AlertBox
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
                if (!this.isLoggedIn) {
                    this.$router.push({ name: 'Login' });
                }
            })
        },
        computed: {
            ...mapStores(useAlertStore, useUserStore),
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

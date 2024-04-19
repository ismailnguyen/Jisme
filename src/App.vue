<template>
    <RouterView />

    <AlertBox v-if="hasAlert" />
</template>

<script>
    import '@fortawesome/fontawesome-free/css/all.css';
    import './assets/base.css';
    import './assets/sidebar.css';

    import { useAlertStore } from '@/store';
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
        },
        computed: {
            ...mapStores(useAlertStore),
            ...mapState(useAlertStore, ['hasAlert']),
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

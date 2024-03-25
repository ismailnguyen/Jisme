<template>
    <div>
        <RouterView />

        <AlertBox v-if="hasAlert" />
    </div>
</template>

<script>
    import './assets/base.css';

    import { useAlertStore } from '@/store'
    import { storeToRefs } from 'pinia'
    import AlertBox from './components/AlertBox.vue'

    export default {
        data () {
            return {
            }
        },
        setup() {
            const alertStore = useAlertStore()
            const { hasAlert } = storeToRefs(alertStore)
            const { openAlert, clearAlert } = alertStore

            return {
                alertStore,
                hasAlert,
                openAlert,
                clearAlert
            }
        },
        components: {
            AlertBox
        },
        created() {
            this.alertStore.$subscribe((mutation, state) => {
                if (this.hasAlert) {
                    this.showAlert();
                }
            })
        },
        methods: {
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

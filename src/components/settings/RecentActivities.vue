<template>
    <div class="row align-items-center">
        <div class="col table-responsive">
            <table class="table border bg-white">
                <thead>
                    <tr>
                        <th>Event</th>
                        <th>Device</th>
                        <th>Location</th>
                        <th>IP</th>
                        <th>Time</th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="(activity, i) in user.activities" :key="i">
                        <th scope="col">{{ capitalizeFirstLetter(activity.action) }}</th>
                        <td>{{ activity.agent }}</td>
                        <td>{{ activity.referer }}</td>
                        <td>{{ activity.ip }}0</td>
                        <td :title="new Date(activity.activity_date)">{{ toDaysAgo(activity.activity_date) }}</td>
                    </tr>
                    <tr>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
    import {
        mapState,
        mapActions
    } from 'pinia'
    import {
        useUserStore,
        useUiStore
    } from '@/store'

    export default {
        computed: {
            ...mapState(useUserStore, [
                'user',
            ]),
        },
        methods: {
            ...mapActions(useUiStore, [
                'resetActiveSidebarPanel'
            ]),

            capitalizeFirstLetter (word) {
                return word.charAt(0).toUpperCase() + word.slice(1);
            },

            toDaysAgo: function (dateString) {
                const date = new Date(dateString);
                const now = new Date();
                const diff = now - date;
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));

                if (days === 0) {
                    return 'Today';
                }

                if (days === 1) {
                    return 'Yesterday';
                }

                return days + ' days ago';
            },
        }
    }
</script>

<template>
    <div class="row">
        <Loader v-show="isLoading" />

        <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
            <div class="list-group">
                <a href="#" class="list-group-item list-group-item-action" v-for="(activity, i) in sortedActivities" :key="i">
                    <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">{{ capitalizeFirstLetter(activity.action) }}</h5>
                    <small>{{ toDaysAgo(activity.activity_date) }}</small>
                    </div>
                    <p class="mb-1">{{ extractClient(activity.agent) }}</p>
                    <small>{{ activity.ip }} ({{ activity.referer }})</small>
                </a>
            </div>
        </div>
    </div>
</template>

<script>
    import parser from 'ua-parser-js';
    import Loader from './Loader.vue'

    import {
        mapState,
    } from 'pinia'
    import {
        useUserStore,
    } from '@/store'

    export default {
        props: {
            visible: {
                type: Boolean,
                default: false
            }
        },
        components: {
            Loader,
        },
        data() {
            return {
                isLoading: false,
            }
        },
        computed: {
            ...mapState(useUserStore, [
                'user',
            ]),
            sortedActivities() {
                return this.user && this.user.activities && this.user.activities.sort((a, b) => new Date(b.activity_date) - new Date(a.activity_date));
            }
        },
        methods: {
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

            extractClient: function (agent) {
                if (!agent) {
                    return 'Unknown';
                }
                const parsedAgent = parser(agent);

                const browser = parsedAgent.browser.name;
                const device = parsedAgent.device;

                return `${ browser.charAt(0).toUpperCase() }${ browser.slice(1) } ${ parsedAgent.os.name } (${ device.vendor } ${ device.model })`;
            }
        }
    }
</script>

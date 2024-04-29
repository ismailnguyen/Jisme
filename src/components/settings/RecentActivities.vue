<template>
    <div class="sidebar-wrapper right-sidebar-wrapper" :class="visible ? 'sidebar-wrapper-open' : ''">
        <div class="sidebar right-sidebar">
            <div class="sidebar-header">
                <div class="row">
                    <div class="mb-3 col-xs-3 col-sm-3 col-3 col-md-3 col-lg-3">
                        <img
                            class="rounded-circle mb-3 sidebar-icon"
                            :src="user && user.avatarUrl ? user.avatarUrl : '../../assets/logo_medium.png'"
                            alt="" width="72" height="72"
                            loading="lazy"
                            v-show="!isLoading">
                    </div>

                    <div class="mb-3 col-xs-6 col-sm-6 col-6 col-md-6 col-lg-6">
                        <h2 class="sidebar-title">Recent Activities</h2>
                    </div>

                    <div class="mb-3 col-xs-3 col-sm-3 col-3 col-md-3 col-lg-3 justify-content-end">
                        <button type="button" class="button--close" @click="closeSidebar(SIDEBAR.SETTINGS_RECENT_ACTIVITIES)">
                            <i class="fa fa-solid fa-close"></i>
                        </button>
                    </div>
                </div>
            </div>

            <div class="sidebar-body">
                <Loader v-show="isLoading" />

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
                                    v-for="(activity, i) in sortedActivities" :key="i">
                                    <th scope="col">{{ capitalizeFirstLetter(activity.action) }}</th>
                                    <td>{{ extractClient(activity.agent) }}</td>
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
            </div>
        </div>
    </div>
</template>

<script>
    import parser from 'ua-parser-js';
    import {
        mapState,
        mapActions
    } from 'pinia'
    import {
        useUserStore,
        useUiStore
    } from '@/store'
    import Loader from '../Loader.vue'

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
            ...mapState(useUiStore, [
                'SIDEBAR'
            ]),
            sortedActivities() {
                return this.user && this.user.activities && this.user.activities.sort((a, b) => new Date(b.activity_date) - new Date(a.activity_date));
            }
        },
        methods: {
            ...mapActions(useUiStore, [
                'closeSidebar'
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

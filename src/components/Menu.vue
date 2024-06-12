<template>
    <div class="tray-wrapper" :class="visible ? 'tray-wrapper-open' : ''">
        <div class="tray-overlay" @click="closeSidebar(SIDEBAR.MENU)"></div>
        <div class="tray">
            <div class="tray-header">
                <div class="row">
                    <div class="mb-3 col-xs-4 col-sm-4 col-4 col-md-4 col-lg-4">
                        <img
                            :src="user && user.avatarUrl"
                            loading="lazy"
                            :alt="user.email"
                            :title="user.email"
                            class="sidebar-icon" />
                    </div>

                    <div class="mb-3" :class="user && user.avatarUrl ? 'col-xs-4 col-sm-4 col-4 col-md-4 col-lg-4' : 'col-xs-8 col-sm-8 col-8 col-md-8 col-lg-8'">
                    </div>
                    
                    <div class="mb-3 col-xs-4 col-sm-4 col-4 col-md-4 col-lg-4 justify-content-end" v-if="user && user.avatarUrl">
                        <button type="button" class="button--close" @click="closeSidebar(SIDEBAR.MENU)">
                            <i class="fa fa-solid fa-close"></i>
                        </button>
                    </div>
                </div>
            </div>

            <div class="tray-body">
                <div class="row">
                    <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
                        <button class="btn btn-light w-100" type="button" @click="onOpenTagsList()">
                            <i class="fa fa-tags"></i>
                            Tags list
                        </button>
                    </div>

                    <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
                        <button class="btn btn-light" type="button" @click="onOpenTagsTree()">
                            <i class="fa fa-chart-gantt"></i>
                            Tags hierarchy
                        </button>
                    </div>

                    <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
                        <button class="btn btn-light" type="button" @click="onOpenSettings()">
                            <i class="fa fa-gear"></i>
                            Settings
                        </button>
                    </div>

                    <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
                        <button type="button" class="btn btn-red" @click="onAddAccount()">
                            <i class="fa fa-plus"></i>
                            Add account
                        </button>
                    </div>
               </div>
            </div>
        </div>
    </div>
</template>

<script>
    import '../assets/tray.css'

    import {
        mapState,
        mapActions
    } from 'pinia'
    import {
        useUiStore,
        useUserStore
    } from '@/store'

    export default {
        props: {
            visible: {
                type: Boolean,
                default: false
            }
        },
        computed: {
            ...mapState(useUserStore, [
                'user'
            ]),

            ...mapState(useUiStore, [
                'SIDEBAR'
            ])
        },
        methods: {
            ...mapActions(useUiStore, [
                'openSidebar',
                'closeSidebar',
            ]),

            onAddAccount: function () {
                this.$router.push({ name: 'AddAccount' });

                this.openSidebar(this.SIDEBAR.ADD_ACCOUNT);
                this.closeSidebar(this.SIDEBAR.MENU);
            },

            onOpenSettings: function () {
                this.$router.push({ name: 'Settings' });

                this.openSidebar(this.SIDEBAR.SETTINGS);
                this.closeSidebar(this.SIDEBAR.MENU);
            },

            onOpenTagsList: function () {
                this.$router.push({ name: 'TagsList' });

                this.openSidebar(this.SIDEBAR.TAGS_LIST);
                this.closeSidebar(this.SIDEBAR.MENU);
            },

            onOpenTagsTree: function () {
                this.$router.push({ name: 'TagsTree' });
                this.openSidebar(this.SIDEBAR.TAGS_TREE);
                this.closeSidebar(this.SIDEBAR.MENU);
            }
        }
    }
</script>

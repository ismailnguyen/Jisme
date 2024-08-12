<template>
    <div class="row">
        <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
            <button class="btn btn-action btn-light" type="button" @click="onOpenTagsList()">
                <i class="fa fa-tags"></i>
                Tags
            </button>
        </div>

        <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
            <button class="btn btn-action btn-light" type="button" @click="onOpenSettings()">
                <i class="fa fa-gear"></i>
                Settings
            </button>
        </div>

        <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
            <button type="button" class="btn btn-action btn-cta" @click="onAddAccount()">
                <i class="fa fa-plus"></i>
                Store a new account
            </button>
        </div>
    </div>
</template>

<script>
    import {
        mapState,
        mapActions
    } from 'pinia'
    import {
        useUiStore,
    } from '@/store'

    export default {
        emits: ['panelChanged'],
        computed: {
            ...mapState(useUiStore, [
                'SIDEBAR'
            ])
        },
        methods: {
            ...mapActions(useUiStore, [
                'openSidebar',
                'closeSidebar',
            ]),

            onOpenTagsList: function () {
                this.$emit('panelChanged', 'tags-list');
            },

            onOpenSettings: function () {
                this.$emit('panelChanged', 'settings');
            },

            onAddAccount: function () {
                // first close the menu before opening the add account sidebar
                // otherwise body scroll will be enabled when the menu is closed
                this.closeSidebar(this.SIDEBAR.MENU);
                this.openSidebar(this.SIDEBAR.ADD_ACCOUNT);
            },
        }
    }
</script>

<template>
    <div id="menu-sidebar-wrapper">
        <ul class="sidebar-nav">
            <img :src="user.avatarUrl" class="rounded-circle mb-3" style="width: 150px;" alt="Avatar" />
            <p class="text-muted">{{ user.email }}</p>
            <li class="menu-actions">
                <a class="menu-actions-settings" @click="onOpenSettings()">
                    <i class="fa fa-gear"></i>
                </a>

                <a class="menu-actions-tags" @click="onOpenTags()">
                    <i class="fa fa-tags"></i>
                </a>

                <a class="menu-actions-add" @click="onAddAccount()">
                    <i class="fa fa-plus"></i>
                </a>
            </li>
        </ul>
    </div>
</template>

<script>
    import '../assets/menubar.css'

    import {
        mapState,
        mapActions
    } from 'pinia'
    import {
        useUiStore,
        useUserStore
    } from '@/store'

    export default {
        computed: {
            ...mapState(useUserStore, [
                'user'
            ])
        },
        methods: {
            ...mapActions(useUiStore, [
                'openAddAccountModal',
                'toggleMenu',
                'openSettings',
                'openTags'
            ]),

            onAddAccount: function () {
                this.openAddAccountModal()
                this.toggleMenu()
            },

            onOpenSettings: function () {
                this.toggleMenu()
                this.openSettings();
            },

            onOpenTags: function () {
                this.openTags();
                this.toggleMenu()
            }
        }
    }
</script>

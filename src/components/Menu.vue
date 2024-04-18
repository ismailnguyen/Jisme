<template>
    <div class="left-sidebar-wrapper">
        <ul class="sidebar-nav">
            <img :src="user.avatarUrl" class="rounded-circle mb-3" style="width: 150px;" alt="Avatar" />
            <p class="text-muted">{{ user.email }}</p>

            <div class="d-grid gap-2 d-none d-md-grid">
                <button class="menu-actions-add btn btn-danger" type="button" @click="onAddAccount()">
                    <i class="fa fa-plus"></i>
                    Add account
                </button>

                <button class="menu-actions-tags btn btn-primary" type="button" @click="onOpenTags()">
                    <i class="fa fa-tags"></i>
                    Tags
                </button>

                <button class="menu-actions-settings btn btn-primary" type="button" @click="onOpenSettings()">
                     <i class="fa fa-gear"></i>
                     Settings
                </button>
            </div>

            <li class="menu-actions d-md-none">
                <a class="menu-actions-settings" @click="onOpenSettings()" alt="Settings" title="Settings">
                    <i class="fa fa-gear"></i>
                </a>

                <a class="menu-actions-tags" @click="onOpenTags()" alt="Tags" title="Tags">
                    <i class="fa fa-tags"></i>
                </a>

                <a class="menu-actions-add" @click="onAddAccount()" alt="Add account" title="Add account">
                    <i class="fa fa-plus"></i>
                </a>
            </li>
        </ul>
    </div>
</template>

<script>
    import '../assets/left_sidebar.css'

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

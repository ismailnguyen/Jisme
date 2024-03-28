<template>
    <div id="sidebar-wrapper">
        <ul class="sidebar-nav">
            <img :src="user.avatarUrl" class="rounded-circle mb-3" style="width: 150px;" alt="Avatar" />
            <p class="text-muted">{{ user.email }}</p>
            <li class="menu-actions">
                <a class="menu-actions-settings" @click="openSettings()">
                    <i class="fa fa-gear"></i>
                </a>

                <a class="menu-actions-tags" @click="openTags()">
                    <i class="fa fa-tags"></i>
                </a>

                <a class="menu-actions-add" @click="addAccount()">
                    <i class="fa fa-plus"></i>
                </a>
            </li>
        </ul>
    </div>
</template>

<script>
    import '../assets/menubar.css'

    import { storeToRefs } from 'pinia'
    import {
        useUiStore,
        useUserStore
    } from '@/store'

    export default {
        setup() {
            const {
                openAddAccountModal,
                toggleMenu,
                openSettings,
                openTags
            } = useUiStore()
            const { user } = storeToRefs(useUserStore())

            return {
                user,
                openAddAccountModal,
                toggleMenu,
                openSettings,
                openTags
            }
        },
        methods: {
            addAccount: function () {
                this.openAddAccountModal()
                this.toggleMenu()
            },

            openSettings: function () {
                this.toggleMenu()
                this.openSettings();
            },

            openTags: function () {
                this.openTags();
                this.toggleMenu()
            }
        }
    }
</script>

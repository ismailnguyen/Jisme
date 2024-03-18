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
                    <i class="fa fa-tag"></i>
                </a>

                <a class="menu-actions-add" @click="add()">
                    <i class="fa fa-plus"></i>
                </a>
            </li>
            <li class="no-hover">
                <span
                    class="badge badge-pill"
                    @click="selectTag(tag)"
                    v-for="(tag, index) in getUniqueTags()"
                    v-bind:key="index"
                    :class="isCurrentTag(tag) ? 'badge-danger' : 'badge-primary'"
                    >
                    <i class="fa fa-close" v-if="isCurrentTag(tag)"></i>
                    {{  tag.name || 'None' }}
                    <span class="badge badge-light">{{ tag.count }}</span>
                </span>
            </li>
        </ul>
    </div>
</template>

<script>
    import '../assets/menubar.css'

    import { storeToRefs } from 'pinia'
    import {
        useUiStore,
        useAccountsStore,
        useUserStore
    } from '@/store'

    export default {
        setup() {
            const { getUniqueTags } = useAccountsStore()
            const {
                openAddAccountModal,
                toggleMenu,
                openSettings,
                openTags
            } = useUiStore()
            const { user } = storeToRefs(useUserStore())

            return {
                user,
                getUniqueTags,
                openAddAccountModal,
                toggleMenu,
                openSettings,
                openTags
            }
        },
        methods: {
            add: function () {
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
            },

            selectTag: function (tag) {
                const tags = this.updateTags(tag.name);

                this.$router.push({name: 'Home', query: { tags: tags }});
                this.toggleMenu()
            },

            updateTags: function (tag) {
                if (this.isCurrentTag(tag)) {
                    return this.removeTag(tag);
                }

                return this.addTag(tag);
            },

            addTag: function (tag) {
                let newTags = this.$route.query.tags ? this.$route.query.tags.split(',').map(x => x.trim()) : [];
                newTags.push(tag);

                return newTags.join(',');
            },

            removeTag: function (tag) {
                let newTags = this.$route.query.tags ? this.$route.query.tags.split(',').map(x => x.trim()) : [];
                newTags.splice(newTags.indexOf(tag), 1);
                
                return newTags.join(',');
            },

            isCurrentTag: function (tag) {
                return this.$route.query.tags && this.$route.query.tags.split(',').includes(tag);
            },
        }
    }
</script>

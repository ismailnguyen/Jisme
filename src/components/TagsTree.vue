<template>
    <div class="sidebar-wrapper right-sidebar-wrapper" :class="visible ? 'sidebar-wrapper-open' : ''">
        <div class="sidebar right-sidebar">
             <div class="sidebar-header">
                <div class="row">
                    <div class="mb-3 col-xs-9 col-sm-9 col-9 col-md-9 col-lg-9">
                        <h2 class="sidebar-title">Tags</h2>
                    </div>

                    <div class="mb-3 col-xs-3 col-sm-3 col-3 col-md-3 col-lg-3 justify-content-end">
                        <button type="button" class="button--close" @click="closeTagsTree()">
                            <i class="fa fa-solid fa-close"></i>
                        </button>
                    </div>
                </div>
            </div>

            <div class="sidebar-body">
                <div class="row">
                    <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
                        <pre>
                            {{ tree }}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import '../assets/right_sidebar.css'

    import {
        mapActions,
    } from 'pinia'
    import {
        useUiStore,
        useAccountsStore,
     } from '@/store'

    export default {
        props: {
            visible: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                tree: {}
            }
        },
        async created() {
            await this.loadCache();
        },
        mounted() {
            this.tree = this.buildTree();
        },
        methods: {
            ...mapActions(useAccountsStore, [
                'loadCache',
                'getUniqueTags'
            ]),

            ...mapActions(useUiStore, [
                'closeTagsTree'
            ]),

            buildTree: function () {
                let tags = this.getUniqueTags();
                let tree = [];
                let map = {};
                let node;
                let i;

                for (i = 0; i < tags.length; i += 1) {
                    map[tags[i].id] = i;
                    tags[i].children = [];
                }

                for (i = 0; i < tags.length; i += 1) {
                    node = tags[i];
                    if (node.parent_id !== null) {
                        tags[map[node.parent_id]].children.push(node);
                    } else {
                        tree.push(node);
                    }
                }

                return tree;
            }
		}
    }
</script>

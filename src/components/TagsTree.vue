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
        mapState,
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
        computed: {
            ...mapState(useAccountsStore, ['accounts']),
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
                let tags = this.getUniqueTags().map(t => t.name);

                let map = {};

                for (let i = 0; i < tags.length; i++) {
                    let currentTag = tags[i];
                    map[currentTag] = map[currentTag] || { children: [] };
                    // for (let j = 0; i < this.accounts.length; j += 1) {
                    //     let currentAccount = this.accounts[j];
                    //     let currentAccountTags = currentAccount.tags.split(',');

                    //     if (currentAccountTags.includes(currentTag)) {
                    //         map[currentTag] = map[currentTag] || { children: [] };
                    //         map[currentTag].children = [...map[currentTag].children, currentAccountTags];
                    //     }
                    // }
                }

                return map;
            }
		}
    }
</script>

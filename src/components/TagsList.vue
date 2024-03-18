<template>
    <div id="tags-sidebar-wrapper">
        <div class="tags-sidebar">
            <div class="sidebar-header">
                <div class="row">
                    <div class="form-group col-xs-9 col-sm-9 col-9 col-md-9 col-lg-9">
                        <h2 class="sidebar-title">Tags</h2>
                    </div>

                    <div class="form-group col-xs-3 col-sm-3 col-3 col-md-3 col-lg-3 justify-content-end">
                        <button type="button" class="button--close" @click="closeTags()">
                            <i class="fa fa-solid fa-close"></i>
                        </button>
                    </div>
                </div>
            </div>

            <div class="sidebar-body">
                <ul class="list-group">
                    <li class="list-group-item">
                        <div class="input-group">
                            <input class="form-control" type="text" placeholder="Add a new tag" />
                            <div class="input-group-append">
                                <button class="btn btn-outline-secondary" type="button">Add</button>
                            </div>
                        </div>
                    </li>
                    <li
                        class="list-group-item"
                        v-for="(tag, index) in getUniqueTags()"
                        v-bind:key="index"
                        @click="selectTag(tag)">
                        {{  tag.name || 'None' }} ({{ tag.count }})

                        <span class="pull-right">
                        <span class="btn btn-xs btn-default" @click="selectTag(tag)">
                            <i class="fa" :class="isCurrentTag(tag) ? 'fa-check-square-o' : 'fa-square-o'"></i>
                        </span>
                    </span>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
    import { onBeforeMount } from 'vue'
    import {
        useUiStore,
        useAccountsStore,
     } from '@/store'

    export default {
        setup() {
            const accountsStore = useAccountsStore()
            const { loadCache, getUniqueTags } = accountsStore
            const { closeTags } = useUiStore()

            onBeforeMount(async () => {
                await loadCache()
            })

            return {
                getUniqueTags,

                closeTags
            }
        },
        methods: {
            selectTag: function (tag) {
                const tags = this.updateTags(tag);

                this.$router.push({name: 'Home', query: { tags: tags }});
                //this.toggleMenu()
            },

            updateTags: function (tag) {
                if (this.isCurrentTag(tag)) {
                    return this.removeTag(tag);
                }

                return this.addTag(tag);
            },

            addTag: function ({ name }) {
                let newTags = this.$route.query.tags ? this.$route.query.tags.split(',').map(x => x.trim()) : [];
                newTags.push(name);

                return newTags.join(',');
            },

            removeTag: function ({ name }) {
                let newTags = this.$route.query.tags ? this.$route.query.tags.split(',').map(x => x.trim()) : [];
                newTags.splice(newTags.indexOf(name), 1);
                
                return newTags.join(',');
            },

            isCurrentTag: function ({ name}) {
                return this.$route.query.tags && this.$route.query.tags.split(',').includes(name);
            },
		}
    }
</script>

<style scoped>
    #tags-sidebar-wrapper {
        position: absolute;
        width: 0;
        right: 0;
        height: 100%;
        overflow-y: hidden;
        transition: all .5s;
        display: flex;
        align-items: center;
        z-index: 9999;
    }

    .tags-sidebar {
        transition: all .5s;
        overflow-y: auto;
        height: 100%;
        width: 100%;
        padding: 1rem;
        border-bottom: 1px solid #e9ecef;
        border-top-left-radius: 0.3rem;
        border-top-right-radius: 0.3rem;
        backdrop-filter: blur(18px) contrast(60%);
    }

    .button--close i {
        color: #162056;
    }

    .sidebar-header .justify-content-end {
        display: flex;
    }

   .sidebar-header .close {
        font-size: 2.5rem;
    }

	@media (prefers-color-scheme: dark) {
		.sidebar-header .close {
			color: #e4e6eb;
		}
	}

    .tags-sidebar {
      border: none;
      background: #ffffff;
    }
	
	@media (prefers-color-scheme: dark) {
		.tags-sidebar {
			color: #e4e6eb;
			background: #242526;
		}
	}
	
	@media only screen and (min-width: 500px) {
        .tags-sidebar {
			background: #fff;
            border-top-left-radius: 15px;
            border-top-right-radius: 0;
            border-bottom-left-radius: 15px;
            border-bottom-right-radius: 0;
            box-shadow: 0 0 2rem rgba(0,0,255,.1);
        }
		
		@media (prefers-color-scheme: dark) {
			.tags-sidebar {
				background: #242526db;
			}
		}
    }

    .list-group-item {
        color: #162056;
	}
</style>

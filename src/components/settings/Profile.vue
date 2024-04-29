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
                        <h2 class="sidebar-title">Profile</h2>
                    </div>

                    <div class="mb-3 col-xs-3 col-sm-3 col-3 col-md-3 col-lg-3 justify-content-end">
                        <button type="button" class="button--close" @click="closeSidebar(SIDEBAR.SETTINGS_PROFILE)">
                            <i class="fa fa-solid fa-close"></i>
                        </button>
                    </div>
                </div>
            </div>

            <div class="sidebar-body">
                <Loader v-show="isLoading" />

                <div class="row align-items-center">
                    <div class="col">
                        <form>
                            <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
                                <label class="form-label" for="inputEmail"><i class="fa fa-id-badge" aria-hidden="true"></i> Username</label>
                                <input id="inputEmail" class="form-control" placeholder="Username, email address, phone number" type="email" v-model="user.email" disabled />
                            </div>

                            <hr class="my-4">


                            <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
                                <label class="form-label" for="inputAvatar"><i class="fa fa-circle-user" aria-hidden="true"></i> Avatar</label>
                                <input id="inputAvatar" class="form-control" type="text" laceholder="Avatar image URL" v-model="user.avatarUrl" />
                            </div>
                            
                            <hr class="my-4">
                            
                        </form>
                    </div>
                </div>
            </div>

            <div class="row sidebar-footer">
                <div class="col-xs-12 col-sm-12 col-12 col-md-12 col-lg-12">
                    <button type="button" class="btn" :class="isLoading ? 'btn-dark' : 'btn-primary'" @click="onSave()">
                        <i class="fa fa-save"></i>
                        Save
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import '../../assets/right_sidebar.css'

    import {
        mapState,
        mapActions
    } from 'pinia'
    import {
        useUiStore,
        useAlertStore,
        useUserStore,
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
            ])
        },
        methods: {
            ...mapActions(useUserStore, [
                'update',
            ]),

            ...mapActions(useAlertStore, [
                'openAlert'
            ]),

            ...mapActions(useUiStore, [
                'closeSidebar',
            ]),

            onSave: async function () {
                this.isLoading = true;

                try {
                    await this.update();

                    this.isLoading = false;
                    this.openAlert('Saved!', '', 'success');
                }
                catch(error) {
                    this.isLoading = false;
                }
            }
        }
    }
</script>

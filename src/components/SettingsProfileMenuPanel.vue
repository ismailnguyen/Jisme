<template>
    <div class="row">
        <Loader v-show="isLoading" />

        <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
            <label class="form-label" for="inputEmail"><i class="fa fa-id-badge" aria-hidden="true"></i> Username</label>
            <input id="inputEmail" class="form-control" placeholder="Username, email address, phone number" type="email" v-model="user.email" disabled />
        </div>

        <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
            <label class="form-label" for="inputAvatar"><i class="fa fa-circle-user" aria-hidden="true"></i> Avatar</label>
            <input id="inputAvatar" class="form-control" type="text" laceholder="Avatar image URL" v-model="user.avatarUrl" />
        </div>

        <hr class="my-4">

        <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
            <button type="button" class="btn btn-action btn-cta" :class="isLoading ? 'btn-dark' : 'btn-light'" @click="onSave()">
                <i class="fa fa-floppy-disk"></i>
                Update my information
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
        useAlertStore,
        useUserStore,
    } from '@/store'
    import Loader from './Loader.vue'

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

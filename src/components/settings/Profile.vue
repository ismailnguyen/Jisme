<template>
    <div class="row align-items-center">
        <div class="col">
            <form>
                <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
                    <label class="form-label" for="inputEmail"><i class="fa fa-id-badge" aria-hidden="true"></i> Username</label>
                    <input id="inputEmail" class="form-control" placeholder="Username, email address, phone number" type="email" v-model="user.email" disabled />
                </div>

                <div class="mb-3 col-xs-12 col-md-12 col-lg-12">
                    <label class="form-label" for="inputAvatar"><i class="fa fa-circle-user" aria-hidden="true"></i> Avatar</label>
                    <input id="inputAvatar" class="form-control" type="text" laceholder="Avatar image URL" v-model="user.avatarUrl" />
                </div>
            </form>
        </div>
    </div>
</template>

<script>
    import {
        mapState,
        mapActions
    } from 'pinia'
    import {
        useUserStore,
        useUiStore
    } from '@/store'

    export default {
        props: {
            visible: {
                type: Boolean,
                default: false
            }
        },
        computed: {
            ...mapState(useUserStore, [
                'user',
            ])
        },
        methods: {
            ...mapActions(useUserStore, [
                'getAccountInformation',
                'generatePasskey',
                'removePasskey',
                'update',
                'setAutoLogin'
            ]),

            ...mapActions(useUiStore, [
                'resetActiveSidebarPanel'
            ])
        }
    }
</script>

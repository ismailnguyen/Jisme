<template>
    <div class="empty-accounts-container main-container container-fluid">
        <div class="row">
            <div class="mb-3 col-12 col-xs-12 col-sm-12">
                <h5 class="font-size-16 font-weight-light  me-3 mb-0">Jisme</h5>
            </div>
        </div>

        <div class="card-wrapper col-sm-4 mb-3">
            <div class="card card-secondary clickable" @click.prevent="onAddAccount()">
                <div class="card-body">
                    <h5 class="card-title">
                        Get Started With Jisme
                    </h5>

                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" class="bi bi-grip-horizontal" viewBox="0 0 16 16">
                        <path d="M2 8a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0-3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm3 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0-3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm3 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0-3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm3 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0-3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm3 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm0-3a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
                    </svg>
                </div>
                <div class="card-footer">
                    <small>
                        Add an account or a card to Jisme.
                    </small>

                    <a class="btn btn-outline-primary float-end">
                        ADD
                    </a>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState, mapActions } from "pinia";
import { useUiStore } from "@/store";

export default {
    computed: {
        ...mapState(useUiStore, [
            'SIDEBAR'
        ])
    },
    methods: {
        ...mapActions(useUiStore, [
            'openSidebar',
        ]),

        onAddAccount: function () {
            this.openSidebar(this.SIDEBAR.ADD_ACCOUNT);
        },
    },
};
</script>

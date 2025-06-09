<template>
    <div class="main-container container-fluid">
        <div class="row">
            <div class="mb-3 col-12 col-xs-12 col-sm-12 placeholder-glow" v-if="isLoading">
                <span class="placeholder col-2 font-size-16 me-3 mb-0"></span><br>
            </div>
            <div class="mb-3 col-12 col-xs-12 col-sm-12" v-else>
                <h5 class="font-size-16 font-weight-light me-3 mb-0">Account types</h5>
            </div>
        </div>

        <div class="row stacked-cards stacked-cards-small" v-if="isLoading">
            <div class="card-wrapper col-sm-4 mb-3"
                v-for="index in 5"
                v-bind:key="index">
                <div class="card card-secondary clickable">
                    <div class="card-body">
                        <h5 class="card-title">
                            <i class="fa fa-loading" aria-hidden="true"></i>
                            <span class="placeholder col-4 me-3 mb-0"></span>
                        </h5>
                    </div>
                    <div class="card-footer">
                        <a class="btn btn-outline-primary float-end">
                            ...
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <div class="row stacked-cards stacked-cards-small" v-else>
            <div class="card-wrapper col-sm-4 mb-3">
                <div class="card card-secondary clickable" @click.prevent="openAccountType('account')">
                    <div class="card-body">
                        <h5 class="card-title">
                            <i class="fa fa-user-secret" aria-hidden="true"></i>
                            Credentials
                        </h5>
                    </div>
                    <div class="card-footer">
                        <a class="btn btn-outline-primary float-end">
                            VIEW
                        </a>
                    </div>
                </div>
            </div>
            <div class="card-wrapper col-sm-4 mb-3">
                <div class="card card-secondary clickable" @click.prevent="openAccountType('card')">
                    <div class="card-body">
                        <h5 class="card-title">
                            <i class="fa fa-credit-card" aria-hidden="true"></i>
                            Cards
                        </h5>
                    </div>
                    <div class="card-footer">
                        <a class="btn btn-outline-primary float-end">
                            VIEW
                        </a>
                    </div>
                </div>
            </div>
            <div class="card-wrapper col-sm-4 mb-3">
                <div class="card card-secondary clickable" @click.prevent="openAccountType('bank')">
                    <div class="card-body">
                        <h5 class="card-title">
                            <i class="fa fa-building-columns" aria-hidden="true"></i>
                            Banks
                        </h5>
                    </div>
                    <div class="card-footer">
                        <a class="btn btn-outline-primary float-end">
                            VIEW
                        </a>
                    </div>
                </div>
            </div>
            <div class="card-wrapper col-sm-4 mb-3">
                <div class="card card-secondary clickable" @click.prevent="openAccountType('document')">
                    <div class="card-body">
                        <h5 class="card-title">
                            <i class="fa fa-id-card" aria-hidden="true"></i>
                            Documents
                        </h5>
                    </div>
                    <div class="card-footer">
                        <a class="btn btn-outline-primary float-end">
                            VIEW
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        props: {
            isLoading: {
                type: Boolean,
                default: true
            }
        },
        methods: {
            openAccountType(type) {
                this.$router.push({name: 'Home', query: { search: this.$route.query.search, tags: this.$route.query.tags, type: type }});
            }
        } 
    }
</script>

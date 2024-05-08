<template>
    <div class="main-container container-fluid">
        <div class="row">
            <div class="mb-3 col-12 col-xs-12 col-sm-12">
                <h5 class="font-size-16 me-3 mb-0">Account types</h5>
            </div>
        </div>

        <div class="row stacked-cards stacked-cards-small">
            <div class="card-wrapper col-sm-4 mb-3">
                <div class="card clickable" @click.prevent="openAccountType('account')">
                    <div class="card-body">
                        <h5 class="card-title">
                            <i class="fa fa-globe" aria-hidden="true"></i>
                            Login
                        </h5>
                    </div>
                    <div class="card-footer">
                        <a class="btn btn-outline-primary float-end d-none">
                            View
                            <i class="fa fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            </div>
            <div class="card-wrapper col-sm-4 mb-3">
                <div class="card clickable" @click.prevent="openAccountType('2fa')">
                    <div class="card-body">
                        <h5 class="card-title">
                            <i class="fa fa-qrcode" aria-hidden="true"></i>
                            OTP
                        </h5>
                    </div>
                    <div class="card-footer">
                        <a class="btn btn-outline-primary float-end d-none">
                            View
                            <i class="fa fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            </div>
            <div class="card-wrapper col-sm-4 mb-3">
                <div class="card clickable" @click.prevent="openAccountType('card')">
                    <div class="card-body">
                        <h5 class="card-title">
                            <i class="fa fa-credit-card" aria-hidden="true"></i>
                            Card
                        </h5>
                    </div>
                    <div class="card-footer">
                        <a class="btn btn-outline-primary float-end d-none">
                            View
                            <i class="fa fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        async mounted() {
        },
        computed: {
        },
        methods: {
            openAccountType(type) {
                this.$router.push({name: 'Home', query: { search: this.$route.query.search, tags: this.$route.query.tags, type: type }});
            }
        } 
    }
</script>

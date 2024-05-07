<template>
    <div class="main-container container-fluid">
        <div class="row">
            <div class="mb-3 col-6 col-xs-6 col-sm-6 search-title tags">
                <h5 class="font-size-16 me-3 mb-0">Account types</h5>
            </div>
        </div>

        <div class="row">
            <div class="col-sm-4 mb-3 mb-sm-0">
                <div class="card clickable" @click.prevent="openAccountType('account')">
                    <div class="card-body">
                        <h5 class="card-title">
                            <i class="fa fa-globe" aria-hidden="true"></i>
                            Login
                        </h5>
                        <a class="btn btn-outline-primary float-end">
                            View
                            <i class="fa fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            </div>
            <div class="col-sm-4 mb-3 mb-sm-0">
                <div class="card clickable" @click.prevent="openAccountType('2fa')">
                    <div class="card-body">
                        <h5 class="card-title">
                            <i class="fa fa-qrcode" aria-hidden="true"></i>
                            OTP
                        </h5>
                        <a class="btn btn-outline-primary float-end">
                            View
                            <i class="fa fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            </div>
            <div class="col-sm-4 mb-3 mb-sm-0">
                <div class="card clickable" @click.prevent="openAccountType('card')">
                    <div class="card-body">
                        <h5 class="card-title">
                            <i class="fa fa-credit-card" aria-hidden="true"></i>
                            Card
                        </h5>
                        <a class="btn btn-outline-primary float-end">
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

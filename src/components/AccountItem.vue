<template>
    <div class="col-sm-12 col-md-6 col-lg-4">
        <div class="card clickable" :id="account._id" @click.prevent="edit()">
            <div class="card-header">
                <div class="badge badge-pill badge-primary" v-for="(tag, index) in account.tags.split(',')" v-bind:key="index">
                    {{tag}}
                </div>
            </div>

            <div class="card-body">
                <h2 class="card-title">{{ account.displayPlatform }}</h2>

                <div class="row">
                    <div class="col-sm-12">
                        <span class="small description">{{account.login}}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import Account from '../models/Account'

    export default {
        props: {
            account: Account
        },
        methods:
        {
            edit() {
                this.$emit('toggleEditAccountModal', this.account);
            }
        }
    }
</script>

<style scoped>
    .card {
        color: black;
        background: #ffffff6b;
        border: none;
        border-radius: 1.55rem;
        margin: 10px;
        box-shadow: 0 0 2rem rgba(0,0,255,.1);
    }

    .card-header {
        background: none;
        border: none;
    }

    .card a {
        text-decoration: none;
    }

    .clickable {
        cursor: pointer;
    }

    .badge-pill {
        margin-right: 5px;
    }

    .description {
        color: #818182;
    }
</style>
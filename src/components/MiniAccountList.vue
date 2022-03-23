<template>
    <div class="main-container container-fluid">
        <span class="category-title">{{ title }}</span>
        <div class="row">
            <AccountItem 
                v-for="(account, index) in accounts"
                v-bind:key="index"
                v-on:toggleEditAccountModal="onEditAccountModalToggled"
                :account="account" />
        </div>
    </div>
</template>

<script>
    import AccountItem from './AccountItem.vue'
    
    export default {
        props: {
            title: String,
            accounts: Array
        },
        components: {
            AccountItem
        },
        methods: {
            onEditAccountModalToggled: function (account) {
                this.$emit('toggleEditAccountModal', account);
            }
        }
    }
</script>

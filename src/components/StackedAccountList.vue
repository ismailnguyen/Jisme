<template>
    <div class="row stacked-cards">
        <StackedAccountItem
            v-for="(account, index) in accounts"
            v-bind:key="index"
            :account="account" />
    </div>
</template>

<script>
    import StackedAccountItem from './StackedAccountItem.vue'
    
    export default {
        props: ['accounts'],
        components: {
            StackedAccountItem,
        },
    }
</script>

<style>
    .stacked-cards {
        height: 80vh;
        max-height: 100%;
        flex-flow: column wrap;
        overflow: scroll;
        box-sizing: border-box;
        display: flex;
    }
    
    .stacked-cards .card-wrapper {
        width: 80%;
        height: 100%;
        margin: 0 auto;
        display: flex;
        position: relative;
    }

    .stacked-cards .card-wrapper .card {
        width: 100%;
    }
</style>
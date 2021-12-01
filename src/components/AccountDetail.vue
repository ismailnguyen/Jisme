<template>
    <div class="job-explain">
        <img class="job-bg" alt="">
        <div class="job-logos">
            <div class="job-logo">
                {{ account.displayPlatform }}
            </div>
        </div>
        <div class="job-explain-content">
            <div class="job-title-wrapper">
                <div class="job-card-title">{{ account.platform }}</div>
                <div class="job-action">
                    <svg class="heart feather feather-heart" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1l1-4l9.5-9.5z"/>
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-share-2">
                        <path d="M3 6h18"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        <path d="M10 11v6"/>
                        <path d="M14 11v6"/>
                    </svg>
                </div>
            </div>
            <div class="job-subtitle-wrapper">
                <div class="company-name">{{ account.login }}</div>
                <div class="posted">{{ new Date(account.created_date).toDateString() }}</div>
            </div>
            <div class="explain-bar">
                <div class="explain-contents" v-if="account.password">
                    <div class="explain-title">Password</div>
                    <div class="explain-subtitle">{{ account.password }}</div>
                </div>
                <div class="explain-contents" v-if="account.social_login">
                    <div class="explain-title">Social login</div>
                    <div class="explain-subtitle">{{ account.social_login }}</div>
                </div>
                <div class="explain-contents" v-if="account.password_clue">
                    <div class="explain-title">Password clue</div>
                    <div class="explain-subtitle">{{ account.password_clue }}</div>
                </div>
            </div>
            <div class="overview-text" v-if="account.notes">
                <div class="overview-text-header">Notes</div>
                <div class="overview-text-subheader">{{ account.notes }}</div>
            </div>
            <hr />
            <div class="overview-text" v-if="account.tags">
                <div class="overview-text-header">Tags</div>
                <button class="search-buttons detail-button" v-for="(tag, index) in account.tags.split(',')" v-bind:key="index">
                    {{ tag }}
                </button>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        data () {
            return {
            }
        },
        props: ['account'],
        methods: {
        },
        computed: {
           
        },
    }
</script>

<style scoped>
    .job-logo {
        background-color: #2e2882;
        border: 4px solid var(--header-bg-color);
        border-radius: 10px;
        display: inline-block;
        padding: 12px;
        color: var(--header-bg-color);
        text-align: center;
    }
</style>
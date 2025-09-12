<template>
    <div id="dynamic-island-container" :class="notificationStyle" @click="isExpanded = !isExpanded">
        <div class="dynamic-island-small-content" :class="isExpanded ? 'd-none' : ''">
            <div class="dynamic-island-left">
                <nav>
                    <a>
                        <img 
                            class="alert-icon-mini"
                            v-if="image"
                            :src="image"
                            loading="lazy"
                            alt="">
                    </a>
                    <a>
                        {{ title }}
                    </a>
                </nav>
            </div>

            <div class="dynamic-island-right">
                <nav>
                    <a @click="close()">
                        <i class="fas fa-close"></i>
                    </a>
                </nav>
            </div>
        </div>

        <div class="dynamic-island-large-content" :class="isExpanded ? '' : 'd-none'" :style="isExpanded ? 'opacity:1;' : 'opacity:0;'">
            <div class="dynamic-island-header-section">
                <div class="dynamic-island-header-left">
                    <span class="dynamic-island-title">{{ title }}</span>
                </div>

                <div class="dynamic-island-header-right">
                    <a @click="close()">
                        <span class="dynamic-island-title">Close</span>
                    </a>
                </div>
            </div>

            <div class="notification-container">
                <div class="notification-item">
                    <img 
                        class="notification-item-image"
                        v-if="image"
                        :src="image"
                        loading="lazy"
                        :title="title"
                        :alt="title">

                    <div class="notification-item-text-container">
                        <span class="profile-user-username">
                            {{ message }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import {
        mapState,
        mapActions
    } from 'pinia'
    import { useAlertStore } from '@/store'

    export default {
        data() {
            return {
                isExpanded: false
            }
        },
        computed: {
            ...mapState(useAlertStore, [
                'currentAlert'
            ]),

            title: function () {
                return this.currentAlert && this.currentAlert.title || 'Title';
            },

            message: function () {
                return this.currentAlert && this.currentAlert.message || 'Message';
            },

            image: function () {
                return this.currentAlert && this.currentAlert.image || null;
            },

            notificationStyle: function () {
                let expandClass = this.isExpanded ? 'dynamic-island-large' : 'dynamic-island-small';

                return `${this.currentAlert && 'dynamic-island--' + (this.currentAlert.type || 'info') + '-notification'} ${expandClass}`;
            }
        },
        methods: {
            ...mapActions(useAlertStore, [
                'clearAlert'
            ]),

            close: function () {
                this.clearAlert();
            }
        }
    } 
</script>

<style scoped>
    #dynamic-island-container {
        z-index: 9999;   
        position: fixed;
        cursor: pointer;

        margin: 0 auto;
        padding: 18px;

        color: #fff;
        border-radius: 30px;

        height: fit-content;

        transition: all .5s ease;
    }

    @media screen and (min-width: 767.98px) {
        #dynamic-island-container {
            bottom: 1.5rem;
            right: 1.5rem;
        }
    }

    @media screen and (max-width: 767.98px) {
        #dynamic-island-container {
            top: 1.5rem;
            left: 50%;
            transform: translateX(-50%);
        }
    }

    .dynamic-island--success-notification {
        background-color: #32c75a;
    }

    .dynamic-island--danger-notification {
        background-color: #ff0000;
    }

    .dynamic-island--warning-notification {
        background-color: #ff8001;
    }

    .dynamic-island--info-notification {
        background-color: #262626;
    }

    #dynamic-island-container a {
        text-decoration: none;
        color: #fff !important;
    }

    .dynamic-island-small {
        width: 250px;
        min-height: 18px;

        box-shadow: 0 .125rem .25rem rgba(0,0,0,.075) !important;
    }

    .dynamic-island-large {
        width: calc(450px - 40px);
        min-height: 150px;

        box-shadow: 0 1rem 3rem rgba(0,0,0,.175) !important;
    }

    @media screen and (max-width: 767.98px) {
        .dynamic-island-large {
            width: calc(100% - 40px);
            min-height: 150px;
        
            box-shadow: 0 1rem 3rem rgba(0,0,0,.175) !important;
        }
    }

    .dynamic-island-small-content {
        display: flex;
        width: 100%;
        justify-content: space-between;

        transition: all .2s ease;
    }

    .dynamic-island-left nav {
        display: flex;
        flex-direction: row;
    }

    .dynamic-island-left nav a {
        margin-right: 8px;
    }

    .dynamic-island-left nav a:last-child {
        margin-right: 0px;
    }

    .dynamic-island-left nav a img {
        height: 20px;
    }

    .dynamic-island-right nav {
        display: flex;
        flex-direction: row;
    }

    .dynamic-island-right nav a {
        margin-right: 8px;
    }

    .dynamic-island-right nav a:last-child {
        margin-right: 0px;
    }

    .dynamic-island-right nav a img {
        height: 20px;
    }

    .dynamic-island-large-content {
        width: 100%;
        
        transition: all .2s ease;
    }

    .dynamic-island-title {
        margin: 0;
        font-size: 12px;
        text-transform: uppercase;
        font-weight: 700;

        margin-bottom: 12px;

        display: block;
    }

    .dynamic-island-header-section {
        display: flex;
        width: 100%;
        justify-content: space-between;

        transition: all .2s ease;
    }

    .notification-item {
        padding: 12px;
        border-radius: 12px;
        background-color: #000;

        margin-bottom: 6px;

        display: flex;
        align-items: center;
    }

    .notification-item:last-child {
        margin-bottom: 0px;
    }

    .notification-item-image {
        width: 60px;
        border-radius: 50%;
        margin: 8px;
    }

    .notification-item-text-container {
        display: flex;
        flex-direction: column;
    }

    .notification-item-title {
        font-size: 18px;
        text-overflow: ellipsis;
        font-weight: 700;
        margin-bottom: 6px;
    }
</style>
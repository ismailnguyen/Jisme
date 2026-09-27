<template>
    <div class="login-window" v-show="user">
        <span class="login-window-text">
            <small>Signing in as</small>
            <b :title="user.email">{{ user.email }}</b>
        </span>
        <input type="hidden" name="username" autocomplete="username" :value="user.email">
        <button type="button" class="login-window-change" @click="onChangeUsername">
            Change<span class="visually-hidden"> account</span>
        </button>
    </div>
</template>

<script>
    export default {
        emits: ['usernameChanged'],
        props: {
            user: {
                type: Object,
                required: true
            }
        },
        methods: {
            onChangeUsername() {
                this.$emit('usernameChanged')
            }
        }
    }
</script>

<style scoped>
.login-window {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 60px;
    padding: 8px 8px 8px 16px;
    margin: 0 0 16px;
    border-radius: var(--r-md);
    background: var(--bg-2);
}

.login-window-text {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
}

.login-window-text small {
    font-size: 13px;
    color: var(--label-2);
}

.login-window-text b {
    font-size: 17px;
    font-weight: 400;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.login-window-change {
    min-height: 44px;
    padding: 0 10px;
    border: 0;
    border-radius: 22px;
    background: none;
    color: var(--accent);
    font-size: 17px;
    cursor: pointer;
}
</style>

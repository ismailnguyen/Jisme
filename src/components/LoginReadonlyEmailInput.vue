<template>
    <div class="login-window win" v-show="user">
        <span class="login-window-text">
            <small>Signing in as</small>
            <b class="carbon" :title="user.email">{{ user.email }}</b>
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
    min-height: 64px;
    padding: 8px 6px 8px 14px;
    margin: 4px 0 16px;
}

.login-window-text {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
}

.login-window-text small {
    font-size: 12px;
    font-weight: 600;
    color: var(--ink-2);
}

.login-window-text b {
    font-size: 16px;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.login-window-change {
    min-height: 44px;
    padding: 0 12px;
    border: 0;
    border-radius: var(--r-md);
    background: none;
    color: var(--ink);
    font-weight: 700;
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
}
</style>

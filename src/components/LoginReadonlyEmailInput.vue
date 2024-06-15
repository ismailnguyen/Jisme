<template>
    <div class="form-floating input-group mb-3 readonly" v-show="user">
        <input
            type="text"
            id="readonlyInputUsername"
            name="username"
            autocomplete="username"
            class="input form-control form-control-plaintext clickable"
            v-model="user.email"
            @click="onChangeUsername"
            tabindex="1"
            readonly>
        <label for="readonlyInputUsername">Username</label>

        <div class="input-group-append">
            <span class="input-group-text clickable" @click="onChangeUsername">
                <i class="fas fa-pen"></i>
            </span>
        </div>
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
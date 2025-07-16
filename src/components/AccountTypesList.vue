<template>
    <div class="account-types-list-container container-fluid">
        <div class="account-types-list" v-if="isLoading">
            <div v-for="index in 5"
                v-bind:key="index">
                <div class="tag-circle">
                    <div class="tag-icon">
                        <i class="fa fa-loading" aria-hidden="true"></i>
                    </div>
                    <div class="tag-label placeholder col-4 me-3 mb-0"></div>
                </div>
            </div>
        </div>

        <div class="account-types-list" v-else>
            <div v-for="type in types"
                    v-bind:key="type.key"
                    @click.prevent="openAccountType(type.key)">
                <div class="account-type-card card card-secondary">
                    <div class="account-type-icon">
                        <i :class="type.icon" aria-hidden="true"></i>
                    </div>
                </div>
                <div class="account-type-label">{{ type.label }}</div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        props: {
            isLoading: {
            type: Boolean,
            default: false
            }
        },
        data() {
            return {
                types: [
                        {
                        key: 'account',
                        label: 'Credentials',
                        icon: 'fa fa-user-secret'
                    },
                    {
                        key: 'card',
                        label: 'Cards',
                        icon: 'fa fa-credit-card'
                    },
                    {
                        key: 'bank',
                        label: 'Banks',
                        icon: 'fa fa-building-columns'
                    },
                    {
                        key: 'document',
                        label: 'Documents',
                        icon: 'fa fa-id-card'
                    }
                ]
            };
        },
        methods: {
            openAccountType(type) {
                this.$router.push({
                    name: 'Home',
                    query: {
                        search: this.$route.query.search,
                        tags: this.$route.query.tags,
                        type: type
                    }
                });
            }
        }
    };
</script>

<style scoped>
.account-types-list-container {
    padding-top: 9rem
}
@media (min-width: 767px) {
    .account-types-list-container {
        padding-top: 1rem
    }
}
.account-types-list {
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    justify-content: flex-start;
    align-items: flex-start;
    padding-bottom: 1rem;
}
.account-type-card {
    display: flex;
    background: #fff;
    border-radius: 1.5rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    padding: 1.5rem 1.2rem 1rem 1.2rem;
    min-width: 7rem;
    text-align: center;
    cursor: pointer;
    position: relative;
    transition: box-shadow 0.2s;
}
.account-type-card:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.10);
}
.account-type-icon {
  position: relative;
  margin-bottom: 0.5rem;
  justify-content: center;
  align-items: center;
}
.account-type-label {
  font-size: 0.95rem;
  font-weight: 500;
  color: #222;
  text-align: center;
  margin-top: 0.2rem;
  white-space: pre-line;
}
</style>

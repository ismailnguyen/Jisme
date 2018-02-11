<template>
    <tr>
        <td class="add-account" colspan="4">
            <span>{{ account.platform | formatPlatform }}</span>
            <input class="new-account account" v-model="account.platform" type="text" placeholder="Platform" />
            <input class="new-account account" v-model="account.login" type="text" placeholder="Login" />
            <input class="new-account account" v-model="account.password" type="text" placeholder="Password (double-click to generate password)" v-on:dblclick="generatePassword()" />
            <input class="new-account account" v-model="account.tags" type="text" placeholder="Tags (separated with comma)" />
            
            <button @click="add" class="ce pi ahr">Add</button>
        </td>
    </tr>
</template>

<script>
    import AccountsService from '../services/AccountsService'
    import { cleanUrl, randomPassword } from '../utils/textFormat'

    export default {
        props: ['user', 'showForm'],
        data()
        {
            return {
                account: {
                    platform: '',
                    login: '',
                    password: '',
                    tags: ''
                }
            }
        },
        filters:
        {
            formatPlatform: function (platform)
            {
                return cleanUrl(platform);
            }
        },
        methods: {
            add: function ()
            {
                let accountsService = new AccountsService(this.user, this.$store.state);

                accountsService.add(this.account);

                this.cleanForm();

                this.$emit('isFinished', true);
            },
            generatePassword: function ()
            {
                this.account.password = randomPassword(8);
            },
            cleanForm: function ()
            {
                this.account = {
                    platform: '',
                    login: '',
                    password: '',
                    tags: ''
                };
            }
        }
    } 
</script>
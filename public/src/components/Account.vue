<template>
    <tbody class="row account-row" v-show="display">
        <tr>
            <td @click="showDetails = !showDetails">
                <span class="account platform">{{ account.platform | formatPlatform }}</span>
            </td>
            <td>
                <input class="account" v-model="account.login" />
            </td>
            <td>
                <button @click="showDetails = !showDetails" class="ce pi">{{ showDetails ? 'Close' : 'Details' }}</button>
            </td>
        </tr>
        <tr>
            <td class="account-details" v-show="showDetails" colspan="3">
                Platform
                <input class="account account-detail" v-model="account.platform" /> <!-- ng-copyable  -->

                Password
                <input class="account account-detail" type="password" v-model="account.password" v-show="!revealPassword" @click="revealPassword = !revealPassword" />
                <input class="account account-detail" v-model="account.password" v-show="revealPassword" v-on:dblclick="revealPassword = !revealPassword" />
                
                Tags 
                <input class="account account-detail" v-model="account.tags" />

                Date
                <input class="account account-detail" v-model="account.created_date" disabled />
                
                <button type="submit" class="ce tb" @click="removeAccount">Delete</button>
            </td>
        </tr>
    </tbody>
</template>

<script>
    import UserService from '../services/UserService'
    import AccountsService from '../services/AccountsService'
    import { cleanUrl } from '../utils/textFormat'

    export default {
        props: ['user', 'account', 'tag', 'date', 'query'],
        data()
        {
            return {
                showDetails: false,
                revealPassword: false,
                accountsService: new AccountsService(this.user, this.$store),
                userService: new UserService()
            }
        },
        filters:
        {
            formatPlatform: function (platform)
            {
                return cleanUrl(platform);
            }
        },
        computed:
        {
            display: function ()
            {
                if (!this.filterByTag(this.tag))
                {
                    return false;
                }

                if (!this.filterByQuery(this.query))
                {
                    return false;
                }

                if (!this.filterByDate(this.date))
                {
                    return false;
                }

                return true;
            }
        },
        methods:
        {
            save: function()
            {
                this.accountsService.save(this.account);
                this.userService.update(this.user);
            },
            
            removeAccount: function ()
            {
                this.accountsService.remove(this.account);

                this.showDetails = false;

                this.userService.update(this.user);
            },
            
            filterByTag: function (tag)
            {
                if (!tag || tag === 'All')
                {
                    return true;
                }

                if (this.account.tags.includes(tag))
                {
                    return true;
                }

                return false;
            },

            filterByQuery: function (query)
            {
                if (!query) {
                    return true
                }

                query = query.toLowerCase();

                let platform = this.account.platform.toLowerCase();
                let displayPlatform = this.account.displayPlatform.toLowerCase();
                let login = this.account.login.toLowerCase();
                let password = this.account.password.toLowerCase();
                let tags = this.account.tags.toLowerCase();

                if (platform.includes(query))
                {
                    return true;
                }

                if (displayPlatform.includes(query))
                {
                    return true;
                }

                if (login.includes(query))
                {
                    return true;
                }

                if (password.includes(query))
                {
                    return true;
                }

                if (tags.includes(query))
                {
                    return true;
                }

                return false;
            },

            filterByDate: function (date)
            {
                let currentDate = new Date(date);
                let createdDate = new Date(this.account.created_date);

                return createdDate >= currentDate;
            }
        },
        watch:
        {
            tag: function (newValue)
            {
                this.tag = newValue;
            },
            query: function (newValue)
            {
                this.query = newValue;
            },
            date: function (newValue)
            {
                this.date = newValue;
            },
            account: function (newValue)
            {
                this.save();
            }
        }
    }
</script>
<template>
    <div id="page-content-wrapper">
        <header class="header-search row justify-content-center">
            <div class="col-xs-12 col-lg-6">
                <input class="form-control searchBar" v-model="search" type="search" placeholder="Search" autofocus>
            </div>
        </header>

        <div class="main-container container-fluid">
            <div class="row accountsList">
                <TagItem v-for="(tag, index) in sortedTags" v-bind:key="index" :tag="tag" />
            </div>
        </div>
    </div>
</template>

<script>
    import { getUser } from '../utils/auth'
    import { sortByName } from '../utils/sort'
    import UserService from '../services/UserService'
    import AccountsService from '../services/AccountsService'
    import AddAccount from './AddAccount.vue'
    import TagItem from './TagItem.vue'
    import Datepicker from 'vuejs-datepicker'
    
    export default {
        data()
        {
            return {
                search: ''
            }
        },
        components: {
            TagItem
        },
        methods: {
            filterByQuery: function (tag, query)
            {
                if (!query) {
                    return true;
                }

                query = query.toLowerCase();

                let tagName = tag.toLowerCase();

                return tagName.includes(query);
            },
        },
        computed: {
            sortedTags: function ()
            {
                var tags = ['All'];
        
                this.$store.state.accounts.forEach(function(account)
                {
                    let listTags = account.tags.split(',');

                    listTags.forEach(function(tag)
                    {
                        tag = tag.trim();
                        
                        if (tags.indexOf(tag) == -1)
                        {
                            tags.push(tag);
                        }
                    });
                });
                
                tags = tags.sort(sortByName);

                return tags.filter(tag => this.filterByQuery(tag, this.search));
            }
        }
    }
</script>

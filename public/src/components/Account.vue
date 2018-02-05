<template>
    <div class="col-md-4" v-if="display">
        <div class="event-card">
            <div v-if="!displayMore">
                <h4 class="card-title" @click="displayMore = !displayMore">{{account.platform | formatPlatform}}</h4>
            </div>

            <div v-if="displayMore">
                <h4 class="card-title" @click="displayMore = !displayMore">{{account.platform}}</h4>
                <p class="card-text">{{account.platform}}</p>
                <ul class="list-group list-group-flush">
                    <li class="list-group-item">Login: {{account.login}}</li>
                    <li class="list-group-item">Password: {{account.password}}</li>
                    <li class="list-group-item">Date: {{account.created_date | formatDate}}</li>
                    <li class="list-group-item">Tags: {{account.tags}}</li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        props: ['account', 'query'],
        data() {
            return {
                display: true,
                displayMore: false
            }
        },
        filters:
        {
            formatPlatform: function (platform)
            {
                return cleanUrl(platform);
            },

            formatDate: function(date)
            {
                return new Date(date).toUTCString();
            }
        },
        methods: {
            filterByQuery: function(query)
            {
                let isQueryEmpty = typeof query == 'undefined' || query.length == 0; 

                if (isQueryEmpty)
                {
                    this.display = true;
                }

                query = query.toUpperCase();

                var keywords = query.split(',');

                console.log(query)

                // Array.prototype.filter.call(keywords, function (keyword)
                // {
                //     keyword = keyword.trim();
                    
                //     let platform = this.account.platform.toUpperCase();
                //     let displayPlatform = this.account.displayPlatform.toUpperCase();
                //     let login = this.account.login.toUpperCase();
                //     let password = this.account.password.toUpperCase();
                //     let tags = this.account.tags.toUpperCase();

                //     if (platform.indexOf(query) >= 0
                //         || displayPlatform.indexOf(query) >= 0
                //         || login.indexOf(query) >= 0
                //         || password.indexOf(query) >= 0
                //         || tags.indexOf(query) >= 0)
                //     {
                //         this.display = true;

                //         return;
                //     }
                // });

                this.display = false;
            }
        },
        created() {
            this.filterByQuery(this.query);
        }
    }
</script>
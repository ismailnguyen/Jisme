<template>
    <div class="card-wrapper col-sm-12 col-md-6 col-lg-4 col-xl-3">
        <div class="card clickable" :id="account._id">
            <div class="card-header">
                <div
                    class="badge badge-pill badge-primary"
                    v-for="(tag, index) in account.tags.split(',')"
                    @click="selectTag(tag)"
                    v-bind:key="index">
                    {{tag}}
                </div>
            </div>

            <div class="card-body" @click.prevent="edit()">
                <h2 class="card-title">
				    {{ account.displayPlatform }}
				</h2>

                <div class="row">
					<div class="col-sm-3" v-show="account.social_login">
						<div class="badge badge-pill badge-danger">
							{{ account.social_login }}
						</div>
					</div>
                    <div :class="account.social_login ? 'col-sm-9' : 'col-sm-12'">
                        <span class="small description">{{account.login}}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import Account from '../models/Account'

    export default {
        props: {
            account: Account
        },
        methods:
        {
            edit() {
                this.$emit('toggleEditAccountModal', this.account);
            },

            selectTag: function (tag) {
                // Don't add the tag if it is already selected
                if (this.$route.query.tags && this.$route.query.tags.split(',').map(x => x.trim()).includes(tag.trim())) {
                    console.log('Already selected')
                    return;
                }

                const tags = this.addTag(tag);

                this.$router.push({name: 'AccountList', query: { tags: tags }});
            },

            addTag: function (tag) {
                let newTags = this.$route.query.tags ? this.$route.query.tags.split(',').map(x => x.trim()) : [];
                newTags.push(tag.trim());

                return newTags.join(',');
            },
        }
    }
</script>

<style scoped>
    .card-wrapper {
        padding: 15px;
    }

    .card {
        color: #162056;
        background: #fff;
        border: none;
        margin: 10px;
        border-radius: 8px;
        box-shadow: 0 10px 20px 0 rgba(208,214,222,.5);
        height: 100%;
    }
	
	@media (prefers-color-scheme: dark) {
		.card {
			color: #e4e6eb;
			background: #242526;
			box-shadow: none;
		}
	}
	
	.card:hover {
		box-shadow: none;
	}

    .card-header {
        background: none;
        border: none;
    }

    .card a {
        text-decoration: none;
    }

    .clickable {
        cursor: pointer;
    }

    .badge-primary {
        color: #fff;
        background-color: #162056;
    }
	
	@media (prefers-color-scheme: dark) {
		.badge-primary {
			color: #fff;
			background-color: #007bff;
		}
	}

    .description {
        color: #818182;
    }
</style>
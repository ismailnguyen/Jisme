<template>
    <div class="col-sm-12 col-md-6 col-lg-4">
        <div class="card clickable" :id="account._id" @click.prevent="edit()">
            <div class="card-header">
                <div class="badge badge-pill badge-primary" v-for="(tag, index) in account.tags.split(',')" v-bind:key="index">
                    {{tag}}
                </div>
            </div>

            <div class="card-body">
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
            }
        }
    }
</script>

<style scoped>
    .card {
        color: #162056;
        background: #fff;
        border: none;
        margin: 10px;
        border-radius: 8px;
        box-shadow: 0 10px 20px 0 rgba(208,214,222,.5);
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

    .badge-pill {
        margin-right: 5px;
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
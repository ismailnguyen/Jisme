<template>
    <div class="card-wrapper col-sm-12 col-md-6 col-lg-4 col-xl-3">
        <div class="card clickable" :id="account._id">
            <div class="card-image-wrapper col-xs-3">
                <img
                    :src="getIcon"
                    loading="lazy"
                    :alt="account.displayPlatform"
                    :title="account.displayPlatform"
                    class="card-icon" />
            </div>

            <div class="card-header">
                <div
                    class="badge badge-pill badge-primary"
                    v-for="tag in account.tags.split(',')"
                    @click="selectTag(tag)"
                    v-bind:key="tag">
                    {{tag}}
                </div>
                <div
                    class="badge badge-pill badge-danger"
                    v-for="socialLogin in account.social_login.split(',')"
                    v-show="account.social_login"
                    v-bind:key="socialLogin">
                    {{ socialLogin }}
                </div>
            </div>

            <div class="card-body" @click.prevent="edit()">
                <h2 class="card-title">
                    {{ account.displayPlatform }}
                </h2>

                <div class="row">
                    <div class="col-sm-12">
                        <span class="small description" v-if="account.type == 'account' || account.type == '2fa'">{{account.login}}</span>
                        <span class="small description" v-if="account.type == 'card'">{{account.card_name}}</span>
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
        methods: {
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

            generateInitialIcon: function () {
                let avatar, ctx, color;

                //creating canvas
                avatar = document.createElement("canvas");
                avatar.width = avatar.height = "48";
                ctx = avatar.getContext("2d");
                ctx.font = `${avatar.width / 2}px Arial`;
                ctx.textAlign = "center";

                //generating color
                color = [
                    "#5050ff",
                    "#50ff50",
                    "#ff5050",
                    "#ff5000",
                    "#ff0050",
                    "#0050ff",
                    "#00ff50",
                    "#50ff00",
                    "#5000ff"
                ];

                var initials = this.account.displayPlatform.split(' ').map(s => s[0].toUpperCase()).join('');

                //function to create avatar
                let random = Math.floor(Math.random() * color.length);
                //clear canvas
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, avatar.width, avatar.height);

                //add background
                ctx.fillStyle = `${color[random]}60`;
                ctx.fillRect(0, 0, avatar.width, avatar.height);

                //add text
                ctx.fillStyle = color[random];
                ctx.fillText(initials, avatar.width / 2, (65 / 100) * avatar.height);

                //generate as Image
                return avatar.toDataURL();
            }
        },
        computed: {
            getIcon: function () {
                if (this.account && this.account.icon) {
                    return this.account.icon;
                }

                return this.generateInitialIcon();
            }
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
        margin: 0 10px;
        border-radius: 18px;
        box-shadow: 2px 4px 12px rgb(0 0 0 / 8%);
        transition: all .3s cubic-bezier(0,0,.5,1);
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
        box-shadow: 2px 4px 16px rgb(0 0 0 / 16%);
        transform: scale3d(1.01,1.01,1.01);
	}

    .card-header {
        background: none;
        border: none;
        margin-left: 30px;
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

    .card-image-wrapper {
        position: absolute;
        top: -14px;
        left: -14px;
        border-radius: 15px;
        background: #f9f9f9;
        padding: 2px;
    }

    .card-icon {
        border-radius: 15px;
        height: 48px;
        width: 48px;
    }

    .card-icon-placeholder {
        background-color: red;
    }
</style>
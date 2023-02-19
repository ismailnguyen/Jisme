<template>
    <div id="app" :class="isMenuToggled ? 'menuDisplayed' : ''">
        <Menu
            v-on:toggleAddAccountModal="onAddAccountModalToggled"
            v-on:toggleMenu="onToggleMenu"
            :user="user"
            :searchQuery="searchQuery"
            v-if="displayMenus" />
 
        <AddAccountModal 
            :user="user" 
            v-on:showAlert="onShowAlert"
            v-on:toggleAddAccountModal="onAddAccountModalToggled"
            v-if="displayMenus && showAddAccountModal" />

        <router-view
            :user="user"
            v-on:showAlert="onShowAlert"
            :addAccountModalToggled="showAddAccountModal"
            v-on:searchQueryUpdated="onSearchQueryUpdated" />

        <a id="menu-toggle" class="floating-button" :class="isMenuToggled ? 'floating-button--close' : 'floating-button--menu'" @click="onToggleMenu" v-show="displayMenus">
            <i class="fa fa-solid" :class="isMenuToggled ? 'fa-close' : 'fa-bars'"></i>
        </a>

        <a id="menu-toggle" class="floating-button floating-button--add d-none d-lg-block d-xl-block" @click="onAddAccountModalToggled" v-if="!isMenuToggled && displayMenus">
            <i class="fa fa-plus"></i>
        </a>

        <AlertBox :alertDetails="alertDetails" v-if="showAlert" v-on:closeAlert="onToggleAlert" />
    </div>
</template>

<script>
    import { getUser } from './utils/auth'
    import UserService from './services/UserService'
    import AccountsService from './services/AccountsService'
    import Menu from './components/Menu.vue'
    import Alert from './models/Alert'
    import AlertBox from './components/AlertBox.vue'
    import AddAccountModal from './components/AddAccount.vue'
    import { SessionExpiredException } from './utils/errors'

    export default {
        data () {
            return {
                user: getUser(),
                alertDetails: {},
                showAddAccountModal: false,
                showAlert: false,
                isMenuToggled: false,
                searchQuery: '',
            }
        },
        components: {
            Menu,
            AlertBox,
            AddAccountModal,
        },
        mounted() {
            if (this.user) {
                this.fetchAccounts();
            }
        },
        computed: {
            accounts: function () {
                return this.$store.state.accounts;
            },

            displayMenus: function () {
                return this.user
                    && this.$route
                    && this.$route.matched
                    && this.$route.matched.length
                    && this.$route.matched[0].props
                    && this.$route.matched[0].props.default
                    && this.$route.matched[0].props.default.menubar;
            }
        },
        methods: {
            fetchAccounts: function () {
                const accountsService = new AccountsService(this.user, this.$store);

                accountsService.getAll()
                .catch(error =>
                {
                    this.onShowAlert(
                        new Alert(error.name, error.message, 'danger')
                    )

                    if (error instanceof SessionExpiredException) {
                        let userService = new UserService();
                        userService.logout(() => {
                            this.$router.go('/');
                        });
                    }
                });
            },

            onAddAccountModalToggled: function () {
                this.showAddAccountModal = !this.showAddAccountModal;
                this.addAccountModalToggled = !this.addAccountModalToggled;
            },

            onShowAlert: function (alertDetails)
            {
                this.alertDetails = alertDetails;

                if (!this.showAlert) {
                    this.onToggleAlert();

                    setTimeout(() => {
                        this.onToggleAlert();
                    }
                    , 5000);
                }
            },

            onToggleAlert: function () {
                this.showAlert = !this.showAlert;
            },

            onToggleMenu: function () {
                this.isMenuToggled = !this.isMenuToggled;
            },

            triggerModalOpened: function (isModalOpened) {
				if (isModalOpened) {
					document.body.classList.add('modal-open');
				}
				else {
					document.body.classList.remove('modal-open');
				}
			},

            onSearchQueryUpdated: function (newValue) {
                this.searchQuery = newValue;
            }
        },
        watch: {
			showAddAccountModal: function () {
				this.triggerModalOpened(this.showAddAccountModal);
			},
		}
    }
</script>

<style>
    * {
        margin: 0;
        position: relative;
    }
	
	html, body {
	  height: 100%;
	}

	#app {
	  height: 100%;
	}

    body {
      color: #162056;
      background: #f0f2f5;
    }
	
	@media(prefers-color-scheme: dark) {
		body {
			color: #eee;
			background: #18191a;
		}
	}

    a {
      color: #162056;
    }

    .main-container {
        padding-top: 80px;
    }

    @media (min-width: 767.98px) { 
        .main-container:last-child {
            padding-top: 100px;
        }
    }

    @media (max-width: 767.98px) { 
        .main-container {
            padding-top: 30px;
        }

        .main-container:last-child {
            padding-bottom: 100px;
        }
    }
	  
    header {
        width: 100%;
        position: fixed;
        color: #162056;
        padding: 20px 20px 20px 40px;
        z-index: 99;
    }

    .form-control {
        color: #f8f9fa;
        border: none;
        border-radius: 0.75rem;
        background-color: #ced4da70;
    }

    .form-control::placeholder {
        color: #f8f9fa;
        opacity: 1;
    }

    .btn {
        border-radius: .75rem;
    }

    /* Main Content */
    #page-content-wrapper {
        width: 100%;	
        position: absolute;
        transition: all .5s;
    }

    #menu-toggle {
        transition: all .3s;
        font-size: 2em;
    }

    /* Change the width of the sidebar to display it*/
    #app.menuDisplayed #sidebar-wrapper {
        position: fixed;
        width: 250px;
    }

    @media (min-width: 767.98px) { 
        #app.menuDisplayed #menu-toggle {
            top: 20px;
            right: 265px;
        }
    }   

    @media (max-width: 767.98px) { 
        #app.menuDisplayed #sidebar-wrapper {
            width: 100%;
            height: 100%;
        }
    }

    @media (min-width: 767.98px) { 
        #app.menuDisplayed #page-content-wrapper {
            padding-right: 250px;
        }
    }

    .floating-button.floating-button--menu {
        top: 20px;
        right: 15px;
        color: #fff;
        background: linear-gradient(81.62deg,#2870ea 8.72%,#1b4aef 85.01%);
    }

    .floating-button.floating-button--close {
        top: 20px;
        right: 15px;
        background: #fff;
    }

    .floating-button.floating-button--close i {
        color: #162056;
    }

    .floating-button.floating-button--add {
        top: 20px;
        right: 80px;
        color: #fff;
        background-color: #dc3545;
    }

    .floating-button {
        position: fixed;
        cursor: pointer;
        width: 48px;
        height: 48px;
        border-radius: 15px;
        text-align: center;
        background-color: #fff;
        box-shadow: 9px 9px 16px rgb(163,177,198,0.6), -9px -9px 16px  rgba(255,255,255, 0.5);
        z-index: 9999;
    }

    .floating-button.floating-button--menu:hover,
    .floating-button.floating-button--add:hover {
        box-shadow: 2px 4px 16px rgb(0 0 0 / 16%);
        transform: scale3d(1.01,1.01,1.01);
    }

    .floating-button i {
        color: #eee;
    }
	
	@media (prefers-color-scheme: dark) {
		.floating-button {
			box-shadow: none;
		}
	}

    .badge-pill {
        margin-right: 5px;
        cursor: pointer;
    }
</style>
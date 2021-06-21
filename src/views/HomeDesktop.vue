<template>
    <div id="app">
        <div class="job">
            <div class="header">
                <div class="logo">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                        <path xmlns="http://www.w3.org/2000/svg" d="M512 503.5H381.7a48 48 0 01-45.3-32.1L265 268.1l-9-25.5 2.7-124.6L338.2 8.5l23.5 67.1L512 503.5z" fill="#0473ff" data-original="#28b446" />
                        <path xmlns="http://www.w3.org/2000/svg" fill="#0473ff" data-original="#219b38" d="M361.7 75.6L265 268.1l-9-25.5 2.7-124.6L338.2 8.5z" />
                        <path xmlns="http://www.w3.org/2000/svg" d="M338.2 8.5l-82.2 234-80.4 228.9a48 48 0 01-45.3 32.1H0l173.8-495h164.4z" fill="#0473ff" data-original="#518ef8" />
                    </svg>
                    Jisme
                </div>
                <div class="header-menu">
                    <a href="#" class="active">Find Job</a>
                    <a href="#">Company Review</a>
                    <a href="#">Find Salaries</a>
                </div>
                <div class="user-settings">
                    <div class="dark-light">
                        <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                        </svg>
                    </div>
                    <div class="user-menu">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-square">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        </svg>
                    </div>
                    <img class="user-profile" src="https://avatars.githubusercontent.com/u/11783843?s=460&u=126cbe1acb98efa542c60758df31ded1ffb174ee&v=4" alt="">
                    <div class="user-name">{{ user.email }}</div>
                </div>
            </div>
            <div class="wrapper" :class="showAddAccountModal ? 'detail-page': ''">
                <div class="search-menu">
                    <div class="search-bar">
                        <input type="text" class="search-box" :value="searchQuery" @input="updateSearchQuery" autofocus />
                        <div class="search item">
                        Product Designer
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                        </div>
                        <div class="search item">
                        UI Designer
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                        </div>
                    </div>
                    <div class="search-location">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-map-pin">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                        Londontowne, MD
                    </div>
                    <div class="search-job">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-briefcase">
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                            <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
                        </svg>
                        <input type="text" placeholder="Tag">
                    </div>
                    <div class="search-salary">
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" fill="currentColor" stroke-width=".4">
                            <path d="M12.6 18H9.8a.8.8 0 010-1.5h2.8a.9.9 0 000-1.8h-1.2a2.4 2.4 0 010-4.7h2.8a.8.8 0 010 1.5h-2.8a.9.9 0 000 1.8h1.2a2.4 2.4 0 010 4.7z" stroke="currentColor" />
                            <path d="M12 20a.8.8 0 01-.8-.8v-2a.8.8 0 011.6 0v2c0 .5-.4.8-.8.8zM12 11.5a.8.8 0 01-.8-.8v-2a.8.8 0 011.6 0v2c0 .5-.4.8-.8.8z" stroke="currentColor" />
                            <path d="M21.3 23H2.6A2.8 2.8 0 010 20.2V3.9C0 2.1 1.2 1 2.8 1h18.4C22.9 1 24 2.2 24 3.8v16.4c0 1.6-1.2 2.8-2.8 2.8zM2.6 2.5c-.6 0-1.2.6-1.2 1.3v16.4c0 .7.6 1.3 1.3 1.3h18.4c.7 0 1.3-.6 1.3-1.3V3.9c0-.7-.6-1.3-1.3-1.3z" stroke="currentColor" />
                            <path d="M23.3 6H.6a.8.8 0 010-1.5h22.6a.8.8 0 010 1.5z" stroke="currentColor" />
                        </svg>
                        <input type="text" placeholder="Login">
                    </div>
                    <button class="search-button">Find</button>
                </div>
                <div class="main-container">
                    <div class="search-type">
                        <div class="alert">
                            <div class="alert-title">Create</div>
                            <div class="alert-subtitle">Create a job alert now and never miss a job</div>
                            <input type="text" placeholder="Enter job keyword">
                            <button class="search-buttons">Create Job Alerts</button>
                        </div>
                        <div class="job-time">
                            <div class="job-time-title">Type of Employment</div>
                            <div class="job-wrapper">
                                <div class="type-container">
                                    <input type="checkbox" id="job1" class="job-style" checked>
                                    <label for="job1">Full Time Jobs</label>
                                    <span class="job-number">56</span>
                                </div>
                                <div class="type-container">
                                    <input type="checkbox" id="job2" class="job-style">
                                    <label for="job2">Part Time Jobs</label>
                                    <span class="job-number">43</span>
                                </div>
                            </div>
                        </div>
                        <div class="job-time">
                            <div class="job-time-title">Seniority Level</div>
                            <div class="job-wrapper">
                                <div class="type-container">
                                    <input type="checkbox" id="job7" class="job-style">
                                    <label for="job7">Student Level</label>
                                    <span class="job-number">98</span>
                                </div>
                                <div class="type-container">
                                    <input type="checkbox" id="job9" class="job-style" checked>
                                    <label for="job9">Mid Level</label>
                                    <span class="job-number">35</span>
                                </div>
                            </div>
                        </div>
                        <div class="job-time">
                            <div class="job-time-title">Salary Range</div>
                            <div class="job-wrapper">
                                <div class="type-container">
                                    <input type="checkbox" id="job1" class="job-style">
                                    <label for="job1">$700 - $1000</label>
                                    <span class="job-number">49</span>
                                </div>
                                <div class="type-container">
                                    <input type="checkbox" id="job5" class="job-style" checked>
                                    <label for="job5">$2000 - $3000</label>
                                    <span class="job-number">76</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="searched-jobs">
                        <div class="searched-bar">
                        <div class="searched-show">Showing {{ truncatedAccounts.length }} accounts</div>
                        <div class="searched-sort">Sort by: <span class="post-time">Newest</span><span class="menu-icon">▼</span></div>
                    </div>
                    <div class="job-cards">
                        <div class="job-card" v-for="(account, index) in truncatedAccounts" v-bind:key="index" @click="openAccountModal(account)">
                            <div class="job-card-header">
                                <svg viewBox="0 -13 512 512" xmlns="http://www.w3.org/2000/svg" style="background-color:#2e2882">
                                    <g fill="#feb0a5">
                                    <path d="M256 92.5l127.7 91.6L512 92 383.7 0 256 91.5 128.3 0 0 92l128.3 92zm0 0M256 275.9l-127.7-91.5L0 276.4l128.3 92L256 277l127.7 91.5 128.3-92-128.3-92zm0 0" />
                                    <path d="M127.7 394.1l128.4 92 128.3-92-128.3-92zm0 0" />
                                    </g>
                                    <path d="M512 92L383.7 0 256 91.5v1l127.7 91.6zm0 0M512 276.4l-128.3-92L256 275.9v1l127.7 91.5zm0 0M256 486.1l128.4-92-128.3-92zm0 0" fill="#feb0a5" />
                                </svg>
                                <div class="menu-dot"></div>
                            </div>
                            <div class="job-card-title">{{ account.displayPlatform }}</div>
                            <div class="job-card-subtitle">
                                {{account.login}}
                            </div>
                            <div class="job-detail-buttons">
                                <button class="search-buttons detail-button social-button" v-show="account.social_login">{{ account.social_login }}</button>
                                <button class="search-buttons detail-button" v-for="(tag, index) in account.tags.split(',')" v-bind:key="index">
                                    {{ tag }}
                                </button>
                            </div>
                            <div class="job-card-buttons">
                                <button class="search-buttons card-buttons">See</button>
                                <button class="search-buttons card-buttons-msg">Edit</button>
                            </div>
                        </div>
                       
                    </div>
                        <div class="job-overview">
                            <div class="job-overview-cards">
                                <div class="job-overview-card" v-for="(account, index) in truncatedAccounts" v-bind:key="index" @click="openAccountModal(account)">
                                    <div class="job-card overview-card">
                                        <div class="overview-wrapper">
                                            <svg viewBox="0 -13 512 512" xmlns="http://www.w3.org/2000/svg" style="background-color:#2e2882">
                                                <g fill="#feb0a5" >
                                                    <path d="M256 92.5l127.7 91.6L512 92 383.7 0 256 91.5 128.3 0 0 92l128.3 92zm0 0M256 275.9l-127.7-91.5L0 276.4l128.3 92L256 277l127.7 91.5 128.3-92-128.3-92zm0 0" />
                                                    <path d="M127.7 394.1l128.4 92 128.3-92-128.3-92zm0 0" />
                                                </g>
                                                <path d="M512 92L383.7 0 256 91.5v1l127.7 91.6zm0 0M512 276.4l-128.3-92L256 275.9v1l127.7 91.5zm0 0M256 486.1l128.4-92-128.3-92zm0 0" fill="#feb0a5" />
                                            </svg>
                                            <div class="overview-detail">
                                                <div class="job-card-title">{{ account.displayPlatform }}</div>
                                                <div class="job-card-subtitle">
                                                    {{account.login}}
                                                </div>
                                            </div>
                                            <svg class="heart feather feather-heart" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                <path d="M20.8 4.6a5.5 5.5 0 00-7.7 0l-1.1 1-1-1a5.5 5.5 0 00-7.8 7.8l1 1 7.8 7.8 7.8-7.7 1-1.1a5.5 5.5 0 000-7.8z" />
                                            </svg>
                                        </div>
                                        <div class="job-overview-buttons">
                                            <div class="search-buttons time-button" v-show="account.social_login">{{ account.social_login }}</div>
                                            <div class="search-buttons detail-button" v-for="(tag, index) in account.tags.split(',')" v-bind:key="index">{{ tag }}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="job-explain">
                                <img class="job-bg" alt="">
                                <div class="job-logos">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" style="background-color:#f76754">
                                        <path xmlns="http://www.w3.org/2000/svg" d="M0 .5h4.2v23H0z" fill="#042b48" data-original="#212121"></path>
                                        <path xmlns="http://www.w3.org/2000/svg" d="M15.4.5a8.6 8.6 0 100 17.2 8.6 8.6 0 000-17.2z" fill="#fefefe" data-original="#f4511e"></path>
                                    </svg>
                                </div>
                                <div class="job-explain-content">
                                    <div class="job-title-wrapper">
                                        <div class="job-card-title">{{ viewingAccount.displayPlatform }}</div>
                                        <div class="job-action">
                                            <svg class="heart feather feather-heart" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                <path d="M20.8 4.6a5.5 5.5 0 00-7.7 0l-1.1 1-1-1a5.5 5.5 0 00-7.8 7.8l1 1 7.8 7.8 7.8-7.7 1-1.1a5.5 5.5 0 000-7.8z" />
                                            </svg>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-share-2">
                                                <circle cx="18" cy="5" r="3"/>
                                                <circle cx="6" cy="12" r="3"/>
                                                <circle cx="18" cy="19" r="3"/>
                                                <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>
                                            </svg>
                                        </div>
                                    </div>
                                    <div class="job-subtitle-wrapper">
                                        <div class="company-name">{{ viewingAccount.login }}</div>
                                        <div class="posted">{{ new Date(viewingAccount.created_date).toDateString() }}</div>
                                    </div>
                                    <div class="explain-bar">
                                        <div class="explain-contents">
                                            <div class="explain-title">Password</div>
                                            <div class="explain-subtitle">{{ viewingAccount.password }}</div>
                                        </div>
                                        <div class="explain-contents">
                                            <div class="explain-title">Social login</div>
                                            <div class="explain-subtitle">{{ viewingAccount.social_login }}</div>
                                        </div>
                                        <div class="explain-contents">
                                            <div class="explain-title">Password clue</div>
                                            <div class="explain-subtitle">{{ viewingAccount.password_clue }}</div>
                                        </div>
                                    </div>
                                    <div class="overview-text">
                                        <div class="overview-text-header">Notes</div>
                                        <div class="overview-text-subheader">{{ viewingAccount.notes }}</div>
                                    </div>
                                    <hr />
                                    <div class="overview-text" v-if="viewingAccount.tags">
                                        <div class="overview-text-header">Tags</div>
                                        <div class="overview-text-subheader">{{ viewingAccount.tags }}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div> 
</template>


<script>
    import { getUser } from '../utils/auth'
    import Account from '../models/Account'
    import UserService from '../services/UserService'
    import AccountsService from '../services/AccountsService'
    import FilterService from '../services/FilterService'
    import AddAccountModal from '../components/AddAccount.vue'
    import EditAccountModal from '../components/EditAccount.vue'
    import AccountItem from '../components/AccountItem.vue'
    import Loader from '../components/Loader.vue'
    import Alert from '../models/Alert'
    
    export default {
        data()
        {
            return {
                user: getUser(),
                // Default search query is looked up from query string
                searchQuery: this.$route.query.search || '',
                currentTag: this.$store.state.currentTag,
                loading: true,
                pagination_offset: 0,
                editAccount: new Account(),
                filterService: {},
                showAddAccountModal: false,
                showEditAccountModal: false,
                hasScrolledToBottom: false,
                viewingAccount: {}
            }
        },
        components: {
            AddAccountModal,
            EditAccountModal,
            AccountItem,
            Loader
        },
        created() {
            this.$store.watch((state) => state.accounts, () => {
                this.loading = false;
            });
        },
        mounted() {
            this.initPagination();

            this.fetchAccounts();

            this.loadMoreOnScrollToBottom();

            const wrapper = document.querySelector(".wrapper");
            const header = document.querySelector(".header");

            wrapper.addEventListener("scroll", (e) => {
                e.target.scrollTop > 30
                ? header.classList.add("header-shadow")
                : header.classList.remove("header-shadow");
            });

            const toggleButton = document.querySelector(".dark-light");

            toggleButton.addEventListener("click", () => {
                document.body.classList.toggle("dark-mode");
            });

            const jobCards = document.querySelectorAll(".job-card");
            const logo = document.querySelector(".logo");
            const jobLogos = document.querySelector(".job-logos");
            const jobDetailTitle = document.querySelector(".job-explain-content .job-card-title");
            const jobBg = document.querySelector(".job-bg");

            jobCards.forEach((jobCard) => {
                jobCard.addEventListener("click", () => {
                    const logo = jobCard.querySelector("svg");
                    const bg = logo.style.backgroundColor;
                    jobBg.style.background = bg;
                    const title = jobCard.querySelector(".job-card-title");
                    jobDetailTitle.textContent = title.textContent;
                    jobLogos.innerHTML = logo.outerHTML;
                    wrapper.classList.add("detail-page");
                    wrapper.scrollTop = 0;
                });
            });

            logo.addEventListener("click", () => {
                wrapper.classList.remove("detail-page");
                wrapper.scrollTop = 0;
                jobBg.style.background = bg;
            });
        },
		watch: {
			showAddAccountModal: function () {
				this.triggerModalOpened(this.showAddAccountModal);
			},
			showEditAccountModal: function () {
				this.triggerModalOpened(this.showEditAccountModal);
			}
		},
        methods: {
            fetchAccounts: function ()
            {
                let accountsService = new AccountsService(this.user, this.$store);

                accountsService.get();
            },

            updateSearchQuery: function (event)
            {
                this.searchQuery = event.target.value;
            },

            loadMore: function ()
            {
                this.pagination_offset += 1;
            },

            initPagination: function ()
            {
                this.pagination_offset = 20;
            },

            onAddAccountModalToggled: function () {
                this.showAddAccountModal = !this.showAddAccountModal;
            },

            openAccountModal: function (account) {
                this.showAddAccountModal = true;
                this.viewingAccount = account;
            },

            onEditAccountModalToggled: function (account)
            {
                this.editAccount = this.showEditAccountModal ? new Account() : account;

                this.showEditAccountModal = !this.showEditAccountModal;
            },

            onShowAlert: function (alertDetails)
            {
                this.$emit('showAlert', alertDetails);
            },
			handleScroll: function(el) {
			console.log('scrolling')
				if((el.srcElement.offsetHeight + el.srcElement.scrollTop) >= el.srcElement.scrollHeight) {
				  this.hasScrolledToBottom = true;
				  console.log('hasScrolledToBottom !')
				}
			  },

            loadMoreOnScrollToBottom: function () {
                window.onscroll = () => {
                    let bottomOfWindow = (window.innerHeight + window.scrollY) >= document.body.offsetHeight;


                    if (bottomOfWindow) {
                        this.loadMore();
                    }
                };
            },

            // Function for testing purpose
            getDuplicatesOnly: function (initalArray) {
                var sorted_arr = initalArray;
                var duplicateAccounts = [];

                for (var i = 0; i < sorted_arr.length - 1; i++) {
                    if (sorted_arr[i + 1].platform == sorted_arr[i].platform && sorted_arr[i + 1].login == sorted_arr[i].login) {
                        duplicateAccounts.push(sorted_arr[i]);
                    }
                }

                console.log('duplicateAccounts', duplicateAccounts.map(account => account.platform));

                return duplicateAccounts;
            },
			
			triggerModalOpened: function (isModalOpened) {
				if (isModalOpened) {
					document.body.classList.add('modal-open');
				}
				else {
					document.body.classList.remove('modal-open');
				}
			}
        },
        computed: {
            truncatedAccounts: function ()
            {
                return this.sortedAccounts.slice(0, this.pagination_offset);
            },
            sortedAccounts: function ()
            {
                this.filterService = new FilterService(this.$store.state.accounts);

                this.filterService.filterByTag(this.currentTag);
                this.filterService.filterByQuery(this.searchQuery);
                this.filterService.sortByName();

                return this.filterService.getAccounts();
            }
        }
    }
</script>

<style>
 @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@200;300;400;500;600;700&display=swap");
* {
  outline: none;
  box-sizing: border-box;
}

:root {
  --body-bg-color: #e5ecef;
  --theme-bg-color: #fafafb;
  --body-font: "Poppins", sans-serif;
  --body-color: #2f2f33;
  --active-color: #0162ff;
  --active-light-color: #e1ebfb;
  --header-bg-color: #fff;
  --search-border-color: #efefef;
  --border-color: #d8d8d8;
  --alert-bg-color: #e8f2ff;
  --subtitle-color: #83838e;
  --inactive-color: #f0f0f0;
  --placeholder-color: #9b9ba5;
  --time-button: #fc5757;
  --level-button: #5052d5;
  --button-color: #fff;
}

.dark-mode {
  --body-bg-color: #1d1d1d;
  --theme-bg-color: #13131a;
  --header-bg-color: #1c1c24;
  --alert-bg-color: #292932;
  --body-color: #fff;
  --inactive-color: #292932;
  --time-button: #fff;
  --level-button: #fff;
  --active-light-color: #263d63;
  --border-color: #26262f;
  --search-border-color: #26262f;
}

::-moz-placeholder {
  color: var(--placeholder-color);
}

:-ms-input-placeholder {
  color: var(--placeholder-color);
}

::placeholder {
  color: var(--placeholder-color);
}

img {
  max-width: 100%;
}

html {
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
}

body {
  background-color: var(--body-bg-color);
  font-family: var(--body-font);
  font-size: 15px;
  color: var(--body-color);
}

.dark-light svg {
  margin-right: 8px;
  width: 22px;
  cursor: pointer;
  fill: transparent;
  transition: 0.5s;
}

.dark-mode .dark-light svg {
  fill: #ffce45;
  stroke: #ffce45;
}
.dark-mode .job-card svg {
  box-shadow: none;
}
.dark-mode .search.item {
  color: var(--body-color);
  border-color: var(--body-color);
}
.dark-mode .search-location svg,
.dark-mode .search-job svg,
.dark-mode .search-salary svg {
  color: var(--body-color);
}
.dark-mode .detail-button {
  background-color: var(--inactive-color);
  color: var(--subtitle-color);
}

.job {
  display: flex;
  flex-direction: column;
  max-width: 1400px;
  height: 100vh;
  margin: 0 auto;
  overflow: hidden;
  background-color: var(--theme-bg-color);
}

.logo {
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 18px;
  cursor: pointer;
}
.logo svg {
  width: 24px;
  margin-right: 12px;
}

.header {
  display: flex;
  align-items: center;
  transition: box-shadow 0.3s;
  flex-shrink: 0;
  padding: 0 40px;
  white-space: nowrap;
  background-color: var(--header-bg-color);
  height: 60px;
  width: 100%;
  font-size: 14px;
  justify-content: space-between;
}
.header-menu a {
  text-decoration: none;
  color: var(--body-color);
  font-weight: 500;
}
.header-menu a:hover {
  color: var(--active-color);
}
.header-menu a:not(:first-child) {
  margin-left: 30px;
}
.header-menu a.active {
  color: var(--active-color);
}

.user-settings {
  display: flex;
  align-items: center;
  font-weight: 500;
}
.user-settings svg {
  width: 20px;
  color: #94949f;
}

.user-menu {
  position: relative;
  margin-right: 8px;
  padding-right: 8px;
  border-right: 2px solid #d6d6db;
}
.user-menu:before {
  position: absolute;
  content: "";
  width: 7px;
  height: 7px;
  border-radius: 50%;
  border: 2px solid var(--header-bg-color);
  right: 6px;
  top: -1px;
  background-color: var(--active-color);
}

.user-profile {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  -o-object-fit: cover;
     object-fit: cover;
  margin-right: 10px;
}

.wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  scroll-behavior: smooth;
  padding: 30px 40px;
  overflow: auto;
}

.search-menu {
  height: 56px;
  white-space: nowrap;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  background-color: var(--header-bg-color);
  border-radius: 8px;
  width: 100%;
  padding-left: 20px;
}
.search-menu div:not(:last-of-type) {
  border-right: 1px solid var(--search-border-color);
}

.search-bar {
  height: 55px;
  width: 100%;
  position: relative;
}
.search-bar input {
  width: 100%;
  height: 100%;
  display: block;
  background-color: transparent;
  border: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 56.966 56.966' fill='%230162ff'%3e%3cpath d='M55.146 51.887L41.588 37.786A22.926 22.926 0 0046.984 23c0-12.682-10.318-23-23-23s-23 10.318-23 23 10.318 23 23 23c4.761 0 9.298-1.436 13.177-4.162l13.661 14.208c.571.593 1.339.92 2.162.92.779 0 1.518-.297 2.079-.837a3.004 3.004 0 00.083-4.242zM23.984 6c9.374 0 17 7.626 17 17s-7.626 17-17 17-17-7.626-17-17 7.626-17 17-17z'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-size: 14px;
  background-position: 0 50%;
  padding: 0 25px 0 305px;
}

.search-location,
.search-job,
.search-salary {
  display: flex;
  align-items: center;
  width: 50%;
  font-size: 14px;
  font-weight: 500;
  padding: 0 25px;
  height: 100%;
}
.search-location input,
.search-job input,
.search-salary input {
  width: 100%;
  height: 100%;
  display: block;
  background-color: transparent;
  border: none;
}
.search-location svg,
.search-job svg,
.search-salary svg {
  margin-right: 8px;
  width: 18px;
  color: var(--active-color);
  flex-shrink: 0;
}

.search-button {
  background-color: var(--active-color);
  height: 55px;
  border: none;
  font-weight: 600;
  font-size: 14px;
  padding: 0 15px;
  border-radius: 0 8px 8px 0;
  color: var(--button-color);
  cursor: pointer;
  margin-left: auto;
}

.search.item {
  position: absolute;
  top: 10px;
  left: 25px;
  font-size: 13px;
  color: var(--active-color);
  border: 1px solid var(--search-border-color);
  padding: 8px 10px;
  border-radius: 8px;
  display: flex;
  align-items: center;
}
.search.item svg {
  width: 12px;
  margin-left: 5px;
}
.search.item:last-child {
  left: 185px;
}

.main-container {
  display: flex;
  flex-grow: 1;
  padding-top: 30px;
}

.search-type {
  width: 270px;
  display: flex;
  flex-direction: column;
  height: 100%;
  flex-shrink: 0;
}

.alert {
  background-color: var(--alert-bg-color);
  padding: 24px 18px;
  border-radius: 8px;
}
.alert-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
}
.alert-subtitle {
  font-size: 13px;
  color: var(--subtitle-color);
  line-height: 1.6em;
  margin-bottom: 20px;
}
.alert input {
  width: 100%;
  padding: 10px;
  display: block;
  border-radius: 6px;
  background-color: var(--header-bg-color);
  border: none;
  font-size: 13px;
}

.search-buttons {
  border: none;
  color: var(--button-color);
  background-color: var(--active-color);
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  margin-top: 14px;
}

.job-wrapper {
  padding-top: 20px;
}

.job-time {
  padding-top: 20px;
}
.job-time-title {
  font-size: 14px;
  font-weight: 500;
}

.type-container {
  display: flex;
  align-items: center;
  color: var(--subtitle-color);
  font-size: 13px;
}
.type-container label {
  margin-left: 2px;
  display: flex;
  align-items: center;
  cursor: pointer;
}
.type-container + .type-container {
  margin-top: 10px;
}

.job-number {
  margin-left: auto;
  background-color: var(--inactive-color);
  color: var(--subtitle-color);
  font-size: 10px;
  font-weight: 500;
  padding: 5px;
  border-radius: 4px;
}

.job-style {
  display: none;
}

.job-style + label:before {
  content: "";
  margin-right: 10px;
  width: 16px;
  height: 16px;
  border: 1px solid var(--subtitle-color);
  border-radius: 4px;
  cursor: pointer;
}

.job-style:checked + label:before {
  background-color: var(--active-color);
  border-color: var(--active-color);
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23fff' stroke-width='3' stroke-linecap='round' stroke-linejoin='round' class='feather feather-check'%3e%3cpath d='M20 6L9 17l-5-5'/%3e%3c/svg%3e");
  background-position: 50%;
  background-size: 14px;
  background-repeat: no-repeat;
}

.job-style:checked + label + span {
  background-color: var(--active-light-color);
  color: var(--active-color);
}

.searched-jobs {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding-left: 40px;
}

@-webkit-keyframes slideY {
  0% {
    opacity: 0;
    transform: translateY(200px);
  }
}

@keyframes slideY {
  0% {
    opacity: 0;
    transform: translateY(200px);
  }
}
.searched-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  -webkit-animation: slideY 0.6s both;
          animation: slideY 0.6s both;
}
.searched-show {
  font-size: 19px;
  font-weight: 600;
}
.searched-sort {
  font-size: 14px;
  color: var(--subtitle-color);
}
.searched-sort .post-time {
  font-weight: 600;
  color: var(--subtitle-color);
}
.searched-sort .menu-icon {
  font-size: 9px;
  color: var(--placeholder-color);
  margin-left: 6px;
}

.job-cards {
  padding-top: 20px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-column-gap: 25px;
  grid-row-gap: 25px;
  -webkit-animation: slideY 0.6s both;
          animation: slideY 0.6s both;
}
@media screen and (max-width: 1212px) {
  .job-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media screen and (max-width: 930px) {
  .job-cards {
    grid-template-columns: repeat(1, 1fr);
  }
}

.job-card {
  padding: 20px 16px;
  background-color: var(--header-bg-color);
  border-radius: 8px;
  cursor: pointer;
  transition: 0.2s;
}
.job-card:hover {
  transform: scale(1.02);
}
.job-card svg {
  width: 46px;
  padding: 10px;
  border-radius: 8px;
}
.job-card-title {
  font-weight: 600;
  margin-top: 16px;
  font-size: 14px;
}
.job-card-subtitle {
  color: var(--subtitle-color);
  font-size: 13px;
  margin-top: 14px;
  line-height: 1.6em;
}
.job-card-header {
  display: flex;
  align-items: flex-start;
}

.overview-card:hover {
  background: #2b2ecf;
  transition: none;
  transform: scale(1);
}
.overview-card:hover svg {
  box-shadow: none;
}
.overview-card:hover .job-overview-buttons .search-buttons.time-button,
.overview-card:hover .job-overview-buttons .search-buttons.level-button {
  background-color: #575ad8;
  color: #fff;
}
.overview-card:hover .job-card-title,
.overview-card:hover .job-stat {
  color: #fff;
}
.overview-card:hover .job-card-subtitle,
.overview-card:hover .job-day {
  color: #dedede;
}
.overview-card:hover .overview-wrapper .heart {
  color: #fff;
  border-color: #fff;
}
.overview-card:hover .overview-wrapper .heart:hover {
  fill: red;
  stroke: red;
  transform: scale(1.1);
}

.social-button {
    background-color: var(--time-button) !important;
    color: var(--button-color) !important;
}

.detail-button {
  background-color: var(--active-light-color);
  color: var(--active-color);
  font-size: 11px;
  font-weight: 500;
  padding: 6px 8px;
  border-radius: 4px;
}
.detail-button + .detail-button {
  margin-left: 4px;
}

.job-card-buttons {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-top: 4px;
}

.card-buttons,
.card-buttons-msg {
  padding: 10px;
  width: 100%;
  font-size: 12px;
  cursor: pointer;
}

.card-buttons {
  margin-right: 12px;
}
.card-buttons-msg {
  background-color: var(--inactive-color);
  color: var(--subtitle-color);
}

.menu-dot {
  background-color: var(--placeholder-color);
  box-shadow: -6px 0 0 0 var(--placeholder-color), 6px 0 0 0 var(--placeholder-color);
  width: 4px;
  height: 4px;
  border: 0;
  padding: 0;
  border-radius: 50%;
  margin-left: auto;
  margin-right: 8px;
}

.header-shadow {
  box-shadow: 0 4px 20px rgba(88, 99, 148, 0.17);
  z-index: 1;
}

@-webkit-keyframes slide {
  0% {
    opacity: 0;
    transform: translateX(300px);
  }
}

@keyframes slide {
  0% {
    opacity: 0;
    transform: translateX(300px);
  }
}
.job-overview {
  display: flex;
  flex-grow: 1;
  display: none;
  -webkit-animation: slide 0.6s both;
          animation: slide 0.6s both;
}
.job-overview-cards {
  display: flex;
  flex-direction: column;
  width: 330px;
  height: 100%;
  flex-shrink: 0;
}
.job-overview-card + .job-overview-card {
  margin-top: 20px;
}
.job-overview-buttons {
  display: flex;
  align-items: center;
  margin-top: 12px;
}
.job-overview-buttons .search-buttons {
  background-color: var(--inactive-color);
  font-size: 11px;
  padding: 6px 8px;
  margin-top: 0;
  font-weight: 500;
}
.job-overview-buttons .search-buttons.time-button {
  color: var(--time-button);
  margin-right: 8px;
}
.job-overview-buttons .search-buttons.level-button {
  color: var(--level-button);
}
.job-overview-buttons .job-stat {
  color: var(--active-color);
  font-size: 12px;
  font-weight: 500;
  margin-left: auto;
}
.job-overview-buttons .job-day {
  color: var(--subtitle-color);
  font-size: 12px;
  margin-left: 8px;
  font-weight: 500;
}
.job-overview .overview-wrapper {
  display: flex;
  align-items: center;
}
.job-overview .overview-wrapper svg:first-child {
  width: 42px;
  margin-right: 10px;
}
.job-overview .overview-wrapper .heart {
  background: none;
  box-shadow: none;
  width: 24px;
  padding: 4px;
  color: var(--subtitle-color);
  border: 1px solid var(--border-color);
  margin-left: auto;
  margin-bottom: auto;
}

.overview-detail .job-card-title,
.overview-detail .job-card-subtitle {
  margin-top: 4px;
}
.overview-detail .job-card-subtitle {
  font-size: 12px;
  font-weight: 500;
}

.job-explain {
  background-color: var(--header-bg-color);
  margin-left: 40px;
  border-radius: 0 0 8px 8px;
  width: 100%;
}

.job-bg {
  border-radius: 8px 8px 0 0;
  -o-object-fit: cover;
     object-fit: cover;
  width: 100%;
  height: 180px;
  transition: 0.3s;
  position: relative;
}

.job-logos {
  margin-top: -30px;
  position: relative;
  margin-bottom: -36px;
  padding: 0 20px;
}
.job-logos svg {
  width: 66px;
  padding: 12px;
  background-color: #fff;
  border-radius: 10px;
  border: 4px solid var(--header-bg-color);
}

.job-title-wrapper {
  display: flex;
  align-items: center;
}
.job-title-wrapper .job-card-title {
  font-size: 20px;
  margin-top: 0;
  font-weight: 600;
}

.job-action {
  display: flex;
  align-items: center;
  margin-left: auto;
}
.job-action svg {
  width: 32px;
  border: 1px solid var(--border-color);
  color: var(--subtitle-color);
  border-radius: 8px;
  padding: 6px;
}
.job-action svg + svg {
  margin-left: 12px;
}

.job-explain-content {
  padding: 50px 25px 30px;
}

.job-subtitle-wrapper {
  display: flex;
  align-items: center;
  margin-top: 20px;
}
.job-subtitle-wrapper .posted {
  margin-left: auto;
}
.job-subtitle-wrapper .company-name {
  color: var(--active-color);
  font-weight: 600;
  font-size: 14px;
}
.job-subtitle-wrapper .comp-location,
.job-subtitle-wrapper .posted {
  color: var(--subtitle-color);
  font-size: 12px;
  font-weight: 500;
}
.job-subtitle-wrapper .comp-location {
  position: relative;
  margin-left: 10px;
}
.job-subtitle-wrapper .comp-location:before {
  content: "";
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background-color: var(--placeholder-color);
  top: 49%;
  left: -8px;
  position: absolute;
}
.job-subtitle-wrapper .app-number {
  color: var(--body-color);
  position: relative;
  margin-left: 12px;
}
.job-subtitle-wrapper .app-number:before {
  content: "";
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background-color: var(--placeholder-color);
  top: 50%;
  left: -7px;
  position: absolute;
}

.explain-bar {
  margin-top: 20px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  display: flex;
  height: 66px;
  padding: 0 16px;
  align-items: center;
  justify-content: space-between;
}
.explain-title {
  color: var(--subtitle-color);
  font-size: 12px;
  line-height: 40px;
  white-space: nowrap;
}
.explain-subtitle {
  font-size: 13px;
  font-weight: 500;
  margin-top: -2px;
  white-space: nowrap;
}
.explain-contents {
  height: 66px;
}
.explain-contents + .explain-contents {
  border-left: 1px solid var(--border-color);
  padding-left: 16px;
}

.overview-text {
  margin-top: 30px;
}
.overview-text-header {
  font-weight: 600;
  margin-bottom: 25px;
}
.overview-text-subheader {
  font-size: 13px;
  line-height: 2em;
}
.overview-text-item {
  font-size: 13px;
  position: relative;
  display: flex;
}
.overview-text-item + .overview-text-item {
  margin-top: 20px;
}
.overview-text-item:before {
  content: "";
  border: 2px solid #61bcff;
  border-radius: 50%;
  height: 8px;
  width: 8px;
  margin-right: 8px;
  flex-shrink: 0;
}

.detail-page .job-overview {
  display: flex;
}
.detail-page .job-cards,
.detail-page .searched-bar {
  display: none;
}
@media screen and (max-width: 1300px) {
  .detail-page .search-type {
    display: none;
  }
  .detail-page .searched-jobs {
    padding-left: 0;
  }
}

@media screen and (max-width: 990px) {
  .explain-contents, .explain-bar {
    height: auto;
  }

  .explain-bar {
    flex-wrap: wrap;
    padding-bottom: 14px;
  }

  .explain-contents {
    width: 50%;
  }

  .explain-contents + .explain-contents {
    padding: 0;
    border: 0;
  }

  .explain-contents:nth-child(2) ~ .explain-contents {
    margin-top: 16px;
    border-top: 1px solid var(--border-color);
  }

  .job-subtitle-wrapper {
    flex-direction: column;
    align-items: flex-start;
  }

  .job-subtitle-wrapper .posted {
    margin-left: 0;
    margin-top: 6px;
  }
}
@media screen and (max-width: 930px) {
  .search-job, .search-salary {
    display: none;
  }

  .search-bar {
    width: auto;
  }
}
@media screen and (max-width: 760px) {
  .detail-page .job-overview-cards {
    display: none;
  }

  .user-name {
    display: none;
  }

  .user-profile {
    margin-right: 0;
  }

  .job-explain {
    margin-left: 0;
  }
}
@media screen and (max-width: 730px) {
  .search-type {
    display: none;
  }

  .searched-jobs {
    padding-left: 0;
  }

  .search-menu div:not(:last-of-type) {
    border: 0;
  }

  .job-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .search-location {
    display: none;
  }
}
@media screen and (max-width: 620px) {
  .job-cards {
    grid-template-columns: repeat(1, 1fr);
  }

  .header-menu a:not(:first-child) {
    margin-left: 10px;
  }
}
@media screen and (max-width: 590px) {
  .header-menu {
    display: none;
  }
}
@media screen and (max-width: 520px) {
  .search.item {
    display: none;
  }

  .search-bar {
    flex-grow: 1;
  }

  .search-bar input {
    padding: 0 0 0 30px;
  }

  .search-button {
    margin-left: 16px;
  }

  .searched-bar {
    flex-direction: column;
    align-items: flex-start;
  }

  .searched-sort {
    margin-top: 5px;
  }

  .main-container {
    padding-top: 20px;
  }
}
@media screen and (max-width: 380px) {
  .explain-contents {
    width: 100%;
    margin: 0;
  }

  .explain-contents:nth-child(2) ~ .explain-contents {
    margin: 0;
    border: 0;
  }

  .wrapper {
    padding: 20px;
  }

  .header {
    padding: 0 20px;
  }
}
</style>
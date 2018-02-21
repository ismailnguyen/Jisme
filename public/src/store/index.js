import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

const state =
{
    user: {},
    accounts: []
};

let mutations =
{
    initialiseStore (state)
    {
        // Check if the store exists
        // if(localStorage.getItem('store'))
        // {
        //     // Replace the state object with the stored item
        //     this.replaceState(
        //         Object.assign(state, JSON.parse(localStorage.getItem('store')))
        //     );
        // }
    },

    updateAccounts (state, newValue)
    {
        state.accounts = newValue;
    },

    addAccount (state, account)
    {
        state.accounts.push(account);
    },
    
    updateAccount (state, account)
    {
        let index = state.accounts.indexOf(account);

        state.accounts[index] = account;
    },

    removeAccount (state, account)
    {
        let index = state.accounts.indexOf(account);

        state.accounts.splice(index, 1);
    }
};

const cachePlugin = store =>
{
    // Subscribe to store updates
    store.subscribe((mutation, state) =>
    {
        // Store the state object as a JSON string
        //localStorage.setItem('store', JSON.stringify(state));
    })
};

export default new Vuex.Store(
{
    state,
    mutations,
    plugins: [cachePlugin]
});
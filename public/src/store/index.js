import Vue from 'vue'
import Vuex from 'vuex'
import localforage from 'localforage'

Vue.use(Vuex);

const state =
{
    currentTag: 'All',
    accounts: []
};

let mutations =
{
    initialiseStore (state)
    {
        // Check if the store exists
        localforage.getItem('store').then(cachedStore =>
        {
            // Replace the state object with the stored item
            this.replaceState(
                Object.assign(state, cachedStore)
            );
        });
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
        // Store the state object
        localforage.setItem('store', state);
    })
};

export default new Vuex.Store(
{
    state,
    mutations,
    plugins: [cachePlugin]
});
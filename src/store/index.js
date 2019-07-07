import Vue from 'vue'
import Vuex from 'vuex'
import localforage from 'localforage'
import { parseAccount } from '../utils/account'

localforage.config({
    name: 'jisme-storage'
});

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
            if (cachedStore == null) return;

            var accounts = cachedStore.accounts.map(account => parseAccount(account));

            // Replace the state object with the stored item
            this.replaceState(
                Object.assign(state, accounts)
            );
        });
    },

    updateAccounts (state, accounts)
    {
        state.accounts = accounts.map(account => parseAccount(account));

        // Store the state object
        localforage.setItem('store', state);
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

export default new Vuex.Store(
{
    state,
    mutations
});
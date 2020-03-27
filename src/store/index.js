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
    accounts: []
};

let mutations =
{
    initialiseStore (state)
    {
        // Check if the store exists
        localforage.getItem('store').then(cachedAccounts =>
        {
            if (cachedAccounts == null)
                return;

            state.accounts = cachedAccounts.accounts.map(account => parseAccount(account));
        });
    },

    updateAccounts (state, accounts)
    {
        state.accounts = accounts.map(account => parseAccount(account));

        localforage.setItem('store', state);
    },

    addAccount (state, account)
    {
        state.accounts.push(account);

        localforage.setItem('store', state);
    },
    
    updateAccount (state, account)
    {
        let index = state.accounts.indexOf(account);

        state.accounts[index] = account;

        localforage.setItem('store', state);
    },

    removeAccount (state, account)
    {
        let index = state.accounts.indexOf(account);

        state.accounts.splice(index, 1);

        localforage.setItem('store', state);
    }
};

export default new Vuex.Store(
{
    state,
    mutations
});
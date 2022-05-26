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
    initialiseStore (_state)
    {
        // Check if the store exists
        localforage.getItem('store').then(cachedAccounts =>
        {
            if (cachedAccounts == null)
                return;

            _state.accounts = cachedAccounts.accounts.map(account => parseAccount(account));
        });
    },

    updateAccounts (_state, _accounts)
    {
        _state.accounts = _accounts.map(account => parseAccount(account));

        localforage.setItem('store', _state);
    },

    addAccount (_state, _account)
    {
        _state.accounts.push(_account);

        localforage.setItem('store', _state);
    },
    
    updateAccount (_state, _account)
    {
        let index = _state.accounts.indexOf(_account);

        _state.accounts[index] = _account;

        localforage.setItem('store', _state);
    },

    removeAccount (_state, _account)
    {
        let index = _state.accounts.indexOf(_account);

        _state.accounts.splice(index, 1);

        localforage.setItem('store', _state);
    }
};

export default new Vuex.Store(
{
    state,
    mutations
});
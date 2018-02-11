import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

const state = {
    accounts: []
};

export default new Vuex.Store({
    state
});
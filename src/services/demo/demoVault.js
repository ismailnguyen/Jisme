import { createDemoAccounts, createDemoUser } from './demoData'

// The demo "server": plain in-memory state, shared by the demo services, gone on reload

// Account keeps modified/opened dates only when they are Date instances, so revive them.
// JSON (not structuredClone) because values may be Vue reactive proxies.
const DATE_FIELDS = ['created_date', 'last_modified_date', 'last_opened_date'];

const clone = (value) => JSON.parse(JSON.stringify(value), (key, field) =>
    DATE_FIELDS.includes(key) && field ? new Date(field) : field
);

const demoVault = {
    user: null,
    accounts: [],

    reset () {
        this.user = createDemoUser();
        this.accounts = createDemoAccounts();
    },

    clear () {
        this.user = null;
        this.accounts = [];
    },

    getUser () {
        return clone(this.user);
    },

    setUser (user) {
        this.user = clone(user);
        return this.getUser();
    }
};

export { clone };
export default demoVault;

import demoVault from './demoVault'

// Same interface as UserService, backed by the in-memory demo vault.
// Nothing touches the network or the device storage, so a real vault cached
// on this device is never read, overwritten or wiped by the demo.
class DemoUserService {
    constructor() {
        this.lastActivity = null;
        this.rememberedUsername = null;
        this.autoLogin = false;
    }

    async getCachedUser () {
        return demoVault.getUser();
    }

    async updateCachedUser () {}

    async getLastActivity () {
        return this.lastActivity;
    }

    async setLastActivity (timestamp = Date.now()) {
        this.lastActivity = timestamp;
    }

    async clearLastActivity () {
        this.lastActivity = null;
    }

    async lastRememberedUsername () {
        return this.rememberedUsername;
    }

    async setLastRememberedUsername (username) {
        this.rememberedUsername = username;
    }

    async isAutoLoginEnabled () {
        return this.autoLogin;
    }

    async setAutoLogin (enabled) {
        this.autoLogin = enabled;
    }

    async getAccountInformation () {
        return demoVault.getUser();
    }

    async update (user) {
        return demoVault.setUser({
            ...user,
            hasAccounts: demoVault.accounts.length > 0
        });
    }

    async signOut () {
        demoVault.clear();
    }
}

export default DemoUserService;

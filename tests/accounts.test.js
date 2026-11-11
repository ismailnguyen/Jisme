import { beforeEach, test, expect, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import localforage from 'localforage';
import { useAccountsStore, useUserStore, useNetworkStore, useUiStore } from '../src/store';
import AccountsService from '../src/services/AccountsService';
import UserService from '../src/services/UserService';
import { SessionExpiredException } from '../src/utils/errors';
vi.mock('../src/utils/webauthn', async (original) => ({ ...await original(), authenticatePasskey: vi.fn(async () => ({ synthetic: true })) }));
const alice = () => ({ uuid: 'alice', token: 'synthetic-token', public_encryption_key: 'synthetic-key' });
let users, accounts, network;
beforeEach(() => {
    vi.restoreAllMocks(); vi.clearAllMocks(); localforage.getItem.mockReset().mockResolvedValue(null);
    setActivePinia(createPinia());
    users = useUserStore(); users.user = alice(); users.isLoggedIn = true;
    accounts = useAccountsStore(); network = useNetworkStore(); network.setOnline();
});
test('unowned legacy outbox is quarantined, never replayed or deleted for any user', async () => {
    const legacy = [{ type: 'create', account: { _id: 'tmp_one', label: 'legacy-secret' } }];
    localforage.getItem.mockResolvedValue(legacy);
    await accounts.processOutbox();
    users.user = { uuid: 'bob', token: 'bob-token', public_encryption_key: 'bob-key' };
    await accounts.processOutbox();
    expect(fetch).not.toHaveBeenCalled();
    expect(accounts.outbox).toEqual([]);
    expect(accounts.hasLegacyPending).toBe(true);
    expect(localforage.setItem).not.toHaveBeenCalled();
    expect(localforage.removeItem).not.toHaveBeenCalled();
});
test.each(['addAccount', 'updateAccount', 'removeAccount'])('%s offline keeps owner-scoped memory only and returns an explicit error', async (method) => {
    network.setOffline();
    const draft = { _id: 'one', label: 'synthetic draft', password: 'synthetic secret' };
    await expect(accounts[method](draft)).rejects.toThrow(/memory only/i);
    expect(fetch).not.toHaveBeenCalled();
    expect(localforage.setItem).not.toHaveBeenCalled();
    expect(accounts.outbox).toMatchObject([{ owner: 'alice', account: { _id: 'one' } }]);
    await accounts.processOutbox();
    expect(fetch).not.toHaveBeenCalled();
});
test('owner transition synchronously clears decrypted arrays, filters and memory-only pending', async () => {
    accounts.accounts = [{ _id: 'one', password: 'secret' }];
    accounts.recentAccounts = [{ _id: 'one', password: 'secret' }];
    accounts.searchQuery = 'secret'; accounts.selectedTags = ['private'];
    network.setOffline();
    await accounts.addAccount({ label: 'draft' }).catch(() => {});
    users.user = { uuid: 'bob', token: 'bob-token', public_encryption_key: 'bob-key' };
    expect(accounts.accounts).toEqual([]);
    expect(accounts.recentAccounts).toEqual([]);
    expect(accounts.outbox).toEqual([]);
    expect(accounts.searchQuery).toBe('');
    expect(accounts.selectedTags).toEqual([]);
});
test('lock clears key and decrypted state immediately even when persistent cleanup fails', async () => {
    const previousUser = users.user;
    accounts.accounts = [{ password: 'secret' }];
    localforage.removeItem.mockRejectedValueOnce(new Error('storage unavailable'));
    const locking = users.lock();
    expect(users.user).toBeNull();
    expect(previousUser.public_encryption_key).toBeNull();
    expect(previousUser.token).toBeNull();
    expect(accounts.accounts).toEqual([]);
    await locking;
});
test.each([['fetchRecentAccounts', 'getRecents'], ['addAccount', 'add'], ['updateAccount', 'save'], ['removeAccount', 'remove']])('%s ignores stale completion after lock and a different login', async (action, method) => {
    let finish;
    const spy = vi.spyOn(AccountsService.prototype, method).mockImplementation(() => new Promise(resolve => { finish = resolve; }));
    const job = accounts[action]({ _id: 'one', password: 'old-secret' }).catch(() => {});
    await users.lock();
    users.user = { uuid: 'bob', token: 'bob-token', public_encryption_key: 'bob-key' }; users.isLoggedIn = true;
    finish(method === 'getRecents' ? [{ _id: 'one', password: 'old-secret' }] : { _id: 'one', password: 'old-secret' });
    await job;
    expect(accounts.accounts).toEqual([]);
    expect(accounts.recentAccounts).toEqual([]);
    expect(accounts.outbox).toEqual([]);
    spy.mockRestore();
});
test('paginated callbacks cannot repopulate a locked store', async () => {
    let page, end, finish;
    const spy = vi.spyOn(AccountsService.prototype, 'getAll').mockImplementation((p, e) => { page = p; end = e; return new Promise(r => { finish = r; }); });
    const job = accounts.fetchAccounts();
    await users.lock();
    page([{ _id: 'one', password: 'secret' }], 1); end(); finish(); await job;
    expect(accounts.accounts).toEqual([]);
    expect(accounts.totalAccounts).toBe(0);
    spy.mockRestore();
});
test('lock clears UI-held editor objects and sidebar state', async () => {
    const ui = useUiStore();
    ui.currentAddingAccount = { password: 'draft-secret' };
    ui.currentEditingAccount = { password: 'edit-secret' };
    ui.openedSidebarList = ['edit-account'];
    const oldDraft = ui.currentAddingAccount;
    const oldEdit = ui.currentEditingAccount;
    await users.lock();
    expect(oldDraft.password).toBeNull();
    expect(oldEdit.password).toBeNull();
    expect(ui.currentAddingAccount.password).not.toBe('draft-secret');
    expect(ui.currentEditingAccount.password).not.toBe('edit-secret');
});
test('lock scrubs known account references before dropping arrays', async () => {
    const account = { password: 'secret', label: 'secret metadata' };
    accounts.accounts = [account];
    await users.lock();
    expect(account.password).toBeNull();
});
test('late real pagination cannot issue another request after lock', async () => {
    let finish;
    fetch.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
    const job = accounts.fetchAccounts();
    await users.lock();
    finish({ ok: true, json: async () => ({ data: [], totalAccounts: 0, next: { pageNumber: 1, limit: 300 } }) });
    await job;
    expect(fetch).toHaveBeenCalledTimes(1);
});
test.each(['getAccountInformation', 'update'])('late user %s cannot restore the key/session after lock', async (method) => {
    let finish;
    const spy = vi.spyOn(UserService.prototype, method).mockImplementation(() => new Promise(resolve => { finish = resolve; }));
    const job = users[method]();
    await users.lock(); finish(alice()); await job;
    expect(users.user).toBeNull(); expect(users.isLoggedIn).toBe(false);
    spy.mockRestore();
});
test.each([['addAccount', 'add'], ['updateAccount', 'save'], ['removeAccount', 'remove']])('%s explicit online retry removes only its pending edit', async (action, method) => {
    const draft = { _id: 'one', label: 'draft', password: 'secret' };
    network.setOffline(); await accounts[action](draft).catch(() => {});
    network.setOnline();
    const spy = vi.spyOn(AccountsService.prototype, method).mockResolvedValue({ ...draft });
    await accounts[action](draft);
    expect(accounts.outbox).toEqual([]);
    expect(localforage.setItem).not.toHaveBeenCalled();
    spy.mockRestore();
});
test.each(['addAccount', 'updateAccount', 'removeAccount'])('%s detects network failure even when browser reports online', async (method) => {
    fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    await expect(accounts[method]({ _id: 'one', label: 'draft' })).rejects.toThrow(/memory only/i);
    expect(accounts.outbox).toHaveLength(1);
    expect(localforage.setItem).not.toHaveBeenCalled();
});
test.each(['requestLogin', 'verifyPassword', 'verifyMFA', 'verifyPasskey'])('late %s cannot restore a session after signout', async (method) => {
    let finish;
    vi.spyOn(UserService.prototype, 'passkeyLoginOptions').mockResolvedValue({ challenge: 'c3ludGhldGlj' }); // server-issued challenge
    const spy = vi.spyOn(UserService.prototype, method).mockImplementation(() => new Promise(resolve => { finish = resolve; }));
    const job = users[method]({ username: 'alice@example.invalid', password: 'synthetic', totpToken: 'synthetic' });
    await vi.waitFor(() => expect(finish).toBeTypeOf('function'));
    await users.signOut(); finish(alice()); await job;
    expect(users.user).toBeNull(); expect(users.isLoggedIn).toBe(false);
    spy.mockRestore();
});
test.each(['getAccountInformation', 'getLastUpdatedTime'])('stale %s failure cannot sign out a later account', async (action) => {
    let fail;
    vi.spyOn(UserService.prototype, 'getAccountInformation').mockImplementation(() => new Promise((_, reject) => { fail = reject; }));
    const job = users[action]().catch(() => {});
    await users.lock(); users.user = { uuid: 'bob', token: 'b', public_encryption_key: 'k' }; users.isLoggedIn = true;
    fail(new SessionExpiredException()); await job;
    expect(users.user.uuid).toBe('bob');
});
test('server failure retains unsaved edits and warns rather than dropping pending state', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({ error: { message: 'Synthetic server failure' } }) });
    await expect(accounts.addAccount({ label: 'draft', password: 'synthetic' })).rejects.toThrow(/Synthetic server failure/);
    expect(accounts.outbox).toMatchObject([{ owner: 'alice', account: { password: 'synthetic' } }]);
});

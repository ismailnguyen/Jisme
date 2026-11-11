import { beforeEach, expect, test, vi } from 'vitest';
import localforage from 'localforage';
import UserService from '../src/services/UserService';
import AccountsService from '../src/services/AccountsService';
const fixture = { uuid: 'alice', token: 'synthetic-token', public_encryption_key: 'synthetic-key', email: 'alice@example.invalid' };
beforeEach(() => { vi.clearAllMocks(); localforage.getItem.mockReset().mockResolvedValue(null); });
test('completed login caches the session so a reload stays signed in (original behaviour)', async () => {
    await new UserService().updateCachedUser({ ...fixture, hasAccounts: true, extra: 'not cached' });
    expect(localforage.setItem).toHaveBeenCalledWith('test-USER', {
        uuid: 'alice', avatarUrl: undefined, email: 'alice@example.invalid', token: 'synthetic-token',
        tokenExpiry: undefined, public_encryption_key: 'synthetic-key', hasAccounts: true,
    });
});
test('startup restores the cached session', async () => {
    localforage.getItem.mockResolvedValueOnce(fixture);
    expect(await new UserService().getCachedUser()).toEqual(fixture);
    expect(localforage.removeItem).not.toHaveBeenCalled();
});
test('cache cannot persist partial plaintext or read an unowned legacy cache', async () => {
    const service = new AccountsService(fixture);
    await service.updateLocalAccounts([{ _id: 'one', label: 'sensitive metadata', password: 'secret' }]);
    await service.updateLocalRecentAccounts([{ _id: 'one', label: 'sensitive metadata' }]);
    expect(await service.getAllCached()).toEqual([]);
    expect(await service.getRecentsCached()).toEqual([]);
    expect(localforage.setItem).not.toHaveBeenCalled();
    expect(localforage.getItem).not.toHaveBeenCalled();
});
test('sign-out clears the session; account caches only on a full sign-out', async () => {
    await new UserService().signOut(true);
    expect(localforage.removeItem.mock.calls.map(([key]) => key)).toEqual(['test-USER', 'test-LAST_ACTIVITY']);
    localforage.removeItem.mockClear();
    await new UserService().signOut();
    expect(localforage.removeItem.mock.calls.map(([key]) => key)).toEqual(['test-USER', 'test-LAST_ACTIVITY', 'test-RECENT_ACCOUNTS', 'test-ACCOUNTS']);
});

import { beforeEach, expect, test, vi } from 'vitest';
import localforage from 'localforage';
import UserService from '../src/services/UserService';
import AccountsService from '../src/services/AccountsService';
const fixture = { uuid: 'alice', token: 'synthetic-token', public_encryption_key: 'synthetic-key', email: 'alice@example.invalid' };
beforeEach(() => { vi.clearAllMocks(); localforage.getItem.mockReset().mockResolvedValue(null); });
test('completed login never persists the unwrapped data key or session', async () => {
    await new UserService().updateCachedUser(fixture);
    expect(localforage.setItem).not.toHaveBeenCalled();
    expect(localforage.removeItem).toHaveBeenCalledWith('test-USER');
});
test('startup invalidates legacy key-bearing session without restoring it', async () => {
    localforage.getItem.mockResolvedValueOnce(fixture);
    expect(await new UserService().getCachedUser()).toBeNull();
    expect(localforage.removeItem).toHaveBeenCalledWith('test-USER');
    expect(localforage.removeItem).not.toHaveBeenCalledWith('test-OUTBOX');
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
test('logout leaves unowned legacy outbox and caches intact for explicit recovery', async () => {
    await new UserService().signOut();
    expect(localforage.removeItem.mock.calls.map(([key]) => key)).toEqual(['JISME_SESSION_ENVELOPE_V1', 'test-USER', 'test-LAST_ACTIVITY']);
});

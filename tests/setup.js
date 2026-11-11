import { vi, beforeEach } from 'vitest';
vi.stubEnv('VITE_BASE_API_URL', 'http://localhost:9/');
vi.stubEnv('VITE_APP_ACCOUNTS_STORE', 'accounts');
vi.stubEnv('VITE_APP_USER_STORE', 'user');
for (const name of ['USER', 'ACCOUNTS', 'RECENT_ACCOUNTS', 'OUTBOX', 'LAST_ACTIVITY', 'LAST_REMEMBERED_USERNAME', 'IS_AUTO_LOGIN_ENABLED']) {
    vi.stubEnv(`VITE_LOCAL_STORAGE_${name}_KEY`, `test-${name}`);
}
vi.mock('localforage', () => ({ default: {
    config: vi.fn(), getItem: vi.fn(async () => null),
    setItem: vi.fn(async () => {}), removeItem: vi.fn(async () => {}),
} }));
beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(() => { throw new Error('Unexpected network request in test'); }));
    vi.stubGlobal('window', { addEventListener: vi.fn(), confirm: vi.fn(() => true), alert: vi.fn(), location: { search: '' } });
    vi.stubGlobal('document', { body: { style: {} }, querySelector: vi.fn(() => ({ style: {} })) });
    vi.stubGlobal('history', { state: {}, pushState: vi.fn(), back: vi.fn() });
    vi.stubGlobal('sessionStorage', { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn() });
});

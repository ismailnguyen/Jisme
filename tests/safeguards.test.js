// Supplemental wiring/persistence guards. Behavioral tests live beside this file.
import { test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
const source = path => readFileSync(new URL(`../src/${path}`, import.meta.url), 'utf8');
test('storage safety notice and page-exit warning stay wired into the application', () => {
    const app = source('App.vue');
    expect(app).toContain('<LocalSafetyNotice />');
    expect(app).toContain("window.addEventListener('beforeunload', this.onBeforeUnload)");
    expect(app).toContain("window.removeEventListener('beforeunload', this.onBeforeUnload)");
});
test('offline editors never claim a durable save or automatic sync', () => {
    for (const file of ['components/AddAccount.vue', 'components/EditAccount.vue']) {
        expect(source(file)).not.toContain('Saved locally — will sync when back online.');
    }
});
test('account persistence remains fail-closed rather than reintroducing a plaintext outbox or colocated key', () => {
    expect(source('store/accounts.js')).not.toMatch(/localforage\.(setItem|removeItem)/);
    expect(source('services/AccountsService.js')).not.toMatch(/localforage\.(setItem|getItem)/);
    expect(source('services/UserService.js')).not.toMatch(/public_encryption_key\s*:/);
});

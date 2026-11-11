// Supplemental wiring/persistence guards. Behavioral tests live beside this file.
import { test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
const source = path => readFileSync(new URL(`../src/${path}`, import.meta.url), 'utf8');
test('no persistent storage banner and no page-exit prompt', () => {
    const app = source('App.vue');
    expect(app).not.toContain('LocalSafetyNotice');
    expect(source('components/menu/MainMenuPanel.vue')).not.toContain('Device storage: online sign-in required');
    expect(app).not.toContain('beforeunload');
});
test('offline editors never claim a durable save or automatic sync', () => {
    for (const file of ['components/AddAccount.vue', 'components/EditAccount.vue']) {
        expect(source(file)).not.toContain('Saved locally — will sync when back online.');
    }
});
test('account persistence remains fail-closed rather than reintroducing a plaintext outbox or colocated key', () => {
    expect(source('store/accounts.js')).not.toMatch(/localforage\.(setItem|removeItem)/);
    expect(source('services/AccountsService.js')).not.toMatch(/localforage\.(setItem|getItem)/);
});

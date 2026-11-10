import { test, expect, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { createSSRApp } from 'vue';
import { renderToString } from '@vue/server-renderer';
import App from '../src/App.vue';
import MainMenuPanel from '../src/components/menu/MainMenuPanel.vue';
import { useAccountsStore, useUserStore, useNetworkStore, useUiStore } from '../src/store';
async function renderMenu(pinia) {
    const app = createSSRApp(MainMenuPanel); app.use(pinia);
    return renderToString(app);
}
test('main menu shows legacy warning only when quarantined changes exist', async () => {
    const pinia = createPinia(); setActivePinia(pinia);
    expect(await renderMenu(pinia)).not.toContain('role="alert"');
    useAccountsStore().hasLegacyPending = true;
    const html = await renderMenu(pinia);
    expect(html).toContain('role="alert"');
    expect(html).toMatch(/do not clear.*storage/i);
    expect(html).toMatch(/not.*automatically/i);
    expect(html).not.toContain('Device storage:');
    useUserStore().isDemo = true;
    expect(await renderMenu(pinia)).not.toContain('role="alert"');
});
test('main menu warns about memory-only edits and disables reopening in-flight edits without revealing payloads', async () => {
    const pinia = createPinia(); setActivePinia(pinia);
    useAccountsStore().outbox = [
        { type: 'create', account: { password: 'synthetic secret' }, inFlight: false },
        { type: 'update', account: {}, inFlight: true },
    ];
    const html = await renderMenu(pinia);
    expect(html).toContain('role="alert"');
    expect(html).toContain('Unsaved edits are in memory only');
    expect(html).toContain('Automatic lock also discards these edits');
    expect(html).toMatch(/<button[^>]*>Reopen unsaved create #1/);
    expect(html).toMatch(/<button[^>]*disabled[^>]*>Reopen unsaved update #2/);
    expect(html).not.toContain('synthetic secret');
});
test('pending edit can be reopened from memory without sending it and is owner checked', async () => {
    setActivePinia(createPinia());
    const users = useUserStore(); users.user = { uuid: 'alice', token: 't', public_encryption_key: 'k' }; users.isLoggedIn = true;
    const accounts = useAccountsStore(); const ui = useUiStore();
    useNetworkStore().setOffline();
    await accounts.addAccount({ label: 'draft', password: 'synthetic secret' }).catch(() => {});
    ui.restorePendingEdit(0);
    expect(ui.currentAddingAccount.password).toBe('synthetic secret');
    expect(ui.isSidebarOpen(ui.SIDEBAR.ADD_ACCOUNT)).toBe(true);
    expect(fetch).not.toHaveBeenCalled();
    accounts.outbox[0].owner = 'bob';
    ui.currentAddingAccount = { password: 'unchanged' };
    ui.restorePendingEdit(0);
    expect(ui.currentAddingAccount.password).toBe('unchanged');
    accounts.outbox[0].owner = 'alice';
    accounts.outbox[0].inFlight = true;
    ui.restorePendingEdit(0);
    expect(ui.currentAddingAccount.password).toBe('unchanged');
    accounts.outbox[0].inFlight = false;
    accounts.outbox[0].session++;
    ui.restorePendingEdit(0);
    expect(ui.currentAddingAccount.password).toBe('unchanged');
});
test('page close asks the browser to warn only when real memory-only pending edits exist', () => {
    const event = { preventDefault: vi.fn(), returnValue: undefined };
    const context = { accountsStore: { outbox: [{ owner: 'alice' }] }, userStore: { isDemo: false } };
    expect(App.methods.onBeforeUnload, 'beforeunload protection exists').toBeTypeOf('function');
    App.methods.onBeforeUnload.call(context, event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.returnValue).toBe('');
    event.preventDefault.mockClear(); context.accountsStore.outbox = [];
    App.methods.onBeforeUnload.call(context, event);
    expect(event.preventDefault).not.toHaveBeenCalled();
});
test('automatic background lock uses forced revocation rather than cancellable manual lock', () => {
    document.visibilityState = 'visible';
    const context = { hiddenAt: 1, userStore: { lock: vi.fn() }, resetIdleTimer: vi.fn() };
    App.methods.onVisibilityChange.call(context);
    expect(context.userStore.lock).toHaveBeenCalledWith(expect.any(String), { force: true });
});
test('simply opening an account offline does not create a fake pending edit', async () => {
    setActivePinia(createPinia());
    const users = useUserStore(); users.user = { uuid: 'alice', token: 't', public_encryption_key: 'k' }; users.isLoggedIn = true;
    useNetworkStore().setOffline();
    await useUiStore().setCurrentEditingAccount({ _id: 'one', password: 'synthetic' });
    expect(useAccountsStore().outbox).toEqual([]);
});

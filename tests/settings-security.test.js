import { test, expect, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { createSSRApp } from 'vue';
import { renderToString } from '@vue/server-renderer';
import SettingsSecurityMenuPanel from '../src/components/menu/SettingsSecurityMenuPanel.vue';
import { useUiStore, useUserStore, useAlertStore } from '../src/store';

test.each([false, true])('confirm changes closes the menu only after a successful save (failure: %s)', async (fails) => {
    setActivePinia(createPinia());
    const ui = useUiStore();
    const users = useUserStore();
    const alerts = useAlertStore();
    let resolveSave, rejectSave;
    vi.spyOn(users, 'setAutoLogin').mockResolvedValue();
    const save = vi.spyOn(users, 'update').mockImplementation(() => new Promise((resolve, reject) => {
        resolveSave = resolve; rejectSave = reject;
    }));
    const close = vi.spyOn(ui, 'closeSidebar');
    const alert = vi.spyOn(alerts, 'openAlert').mockImplementation(() => {});
    ui.openSidebar(ui.SIDEBAR.MENU);
    const context = {
        isLoading: false, isAutoLoginEnabled: true, SIDEBAR: ui.SIDEBAR,
        setAutoLogin: SettingsSecurityMenuPanel.methods.setAutoLogin,
        update: SettingsSecurityMenuPanel.methods.update,
        closeSidebar: SettingsSecurityMenuPanel.methods.closeSidebar,
        openAlert: SettingsSecurityMenuPanel.methods.openAlert,
    };
    const job = SettingsSecurityMenuPanel.methods.onSave.call(context);
    await Promise.resolve();
    expect(context.isLoading).toBe(true);
    expect(close).not.toHaveBeenCalled();
    await vi.waitFor(() => expect(save).toHaveBeenCalled());
    if (fails) rejectSave(Object.assign(new Error('Save failed'), { reason: 'Server unavailable' }));
    else resolveSave();
    await job;
    expect(context.isLoading).toBe(false);
    expect(ui.isSidebarOpen(ui.SIDEBAR.MENU)).toBe(fails);
    if (fails) {
        expect(close).not.toHaveBeenCalled();
        expect(alert).toHaveBeenCalledWith("Couldn't save", 'Server unavailable', 'danger');
    } else {
        expect(close).toHaveBeenCalledWith(ui.SIDEBAR.MENU);
        expect(alert).toHaveBeenCalledWith('Saved!', '', 'success');
    }
});

test('while saving, the button itself shows the busy state instead of a page loader', async () => {
    const pinia = createPinia(); setActivePinia(pinia);
    useUserStore().user = { email: 'a@example.test', passkeys: [] };
    const render = async (isLoading) => {
        const app = createSSRApp({ ...SettingsSecurityMenuPanel, data: () => ({ ...SettingsSecurityMenuPanel.data(), isLoading }) });
        app.use(pinia);
        return renderToString(app);
    };
    const idle = await render(false);
    expect(idle).toMatch(/Confirm changes/);
    expect(idle).not.toMatch(/class="loader/);
    const busy = await render(true);
    expect(busy).toMatch(/<button[^>]*is-busy[^>]*disabled[^>]*aria-busy="true"/);
    expect(busy).toMatch(/btn-spinner/);
    expect(busy).toMatch(/Saving…/);
    expect(busy).not.toMatch(/class="loader/);
});

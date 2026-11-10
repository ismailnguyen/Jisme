import { test, expect, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import SettingsSecurityMenuPanel from '../src/components/menu/SettingsSecurityMenuPanel.vue';
import { useUiStore, useUserStore, useAlertStore } from '../src/store';

test.each([false, true])('security confirm closes menu only after a successful save (failure: %s)', async (fails) => {
    setActivePinia(createPinia());
    const ui = useUiStore();
    const users = useUserStore();
    const alerts = useAlertStore();
    let resolveSave, rejectSave;
    const save = vi.spyOn(users, 'setAutoLogin').mockImplementation(() => new Promise((resolve, reject) => {
        resolveSave = resolve; rejectSave = reject;
    }));
    const close = vi.spyOn(ui, 'closeSidebar');
    const alert = vi.spyOn(alerts, 'openAlert').mockImplementation(() => {});
    ui.openSidebar(ui.SIDEBAR.MENU);
    const context = {
        isLoading: false, isAutoLoginEnabled: true, SIDEBAR: ui.SIDEBAR,
        setAutoLogin: SettingsSecurityMenuPanel.methods.setAutoLogin,
        closeSidebar: SettingsSecurityMenuPanel.methods.closeSidebar,
        openAlert: SettingsSecurityMenuPanel.methods.openAlert,
    };
    const job = SettingsSecurityMenuPanel.methods.onSave.call(context);
    expect(save).toHaveBeenCalledWith(true);
    expect(context.isLoading).toBe(true);
    expect(ui.isSidebarOpen(ui.SIDEBAR.MENU)).toBe(true);
    expect(close).not.toHaveBeenCalled();
    if (fails) rejectSave(new Error('Save failed'));
    else resolveSave();
    await job;
    expect(context.isLoading).toBe(false);
    expect(ui.isSidebarOpen(ui.SIDEBAR.MENU)).toBe(fails);
    if (fails) {
        expect(close).not.toHaveBeenCalled();
        expect(alert).not.toHaveBeenCalled();
    } else {
        expect(close).toHaveBeenCalledWith(ui.SIDEBAR.MENU);
        expect(alert).toHaveBeenCalledWith('Saved!', '', 'success');
    }
});

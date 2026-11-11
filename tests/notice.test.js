import { test, expect } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useAccountsStore, useUserStore, useNetworkStore, useUiStore } from '../src/store';
test('simply opening an account offline does not create a fake pending edit', async () => {
    setActivePinia(createPinia());
    const users = useUserStore(); users.user = { uuid: 'alice', token: 't', public_encryption_key: 'k' }; users.isLoggedIn = true;
    useNetworkStore().setOffline();
    await useUiStore().setCurrentEditingAccount({ _id: 'one', password: 'synthetic' });
    expect(useAccountsStore().outbox).toEqual([]);
});

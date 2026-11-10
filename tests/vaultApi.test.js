// Vault <-> /vaults API wiring with the feature flag forced ON (fetch is mocked; WebCrypto stays real).
import { beforeEach, describe, test, expect, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useUserStore } from '../src/store';
import useVaultStore from '../src/store/vault';
import { VAULT_KDF_LIMITS, VaultEnvelopeError, VaultLockedError } from '../src/utils/vaultKey';
import {
    VAULT_BLOB_VERSION, toBase64url, fromBase64url, encodeVaultBlob, decodeVaultBlob,
} from '../src/utils/vaultBlob';
import { VaultService, VaultApiError, isFreshSignInRequired } from '../src/services/VaultService';
vi.mock('../src/utils/secrets', async (original) => ({ ...await original(), VAULT_UNLOCK_KEY_ENABLED: true }));

const PHRASE = 'correct horse battery staple';
const OTHER_PHRASE = 'another sufficiently long phrase';
const SECRET = 'synthetic secret value';
const fast = { iterations: VAULT_KDF_LIMITS.minIterations, loginPassword: 'synthetic login password' };
const alice = () => ({ uuid: 'alice', token: 'synthetic-token', public_encryption_key: 'synthetic-key' });
const VAULT_URL = 'http://localhost:9/vaults/primary';
const keysOf = (value) => value && typeof value === 'object'
    ? Object.entries(value).flatMap(([k, v]) => [k, ...keysOf(v)]) : [];

const json = (status, body) => new Response(body === undefined ? '' : JSON.stringify(body), {
    status, headers: { 'Content-Type': 'application/json' },
});
const ctBlob = (envelope) => JSON.parse(Buffer.from(envelope.ct, 'base64url').toString('utf8'));

// k. Every request: the phrase (and plaintext) never leaves the device and nothing is named /prf/i.
let requests;
function guarded (handler) {
    requests = [];
    return vi.fn(async (url, options = {}) => {
        const body = options.body === undefined ? '' : String(options.body);
        expect(JSON.stringify(options.body ?? null)).not.toContain(PHRASE);
        expect(body).not.toContain(PHRASE);
        expect(body).not.toContain(SECRET);
        const headerNames = options.headers ? [...new Headers(options.headers).keys()] : [];
        expect(headerNames.filter(k => /prf/i.test(k))).toEqual([]);
        const parsed = body ? JSON.parse(body) : undefined;
        if (parsed) {
            expect(keysOf(parsed).filter(k => /prf/i.test(k))).toEqual([]);
            if (parsed.envelope?.ct) {
                const blob = ctBlob(parsed.envelope);
                expect(keysOf(blob).filter(k => /prf/i.test(k))).toEqual([]);
                expect(JSON.stringify(blob)).not.toContain(PHRASE);
                expect(JSON.stringify(blob)).not.toContain(SECRET);
            }
        }
        const method = options.method || 'GET';
        requests.push({ method, url: String(url), body: parsed, headers: options.headers });
        return handler({ method, url: String(url), body: parsed }, requests.length);
    });
}
const puts = () => requests.filter(r => r.method === 'PUT');
const gets = () => requests.filter(r => r.method === 'GET');

let users, vault;
function freshStores () {
    setActivePinia(createPinia());
    users = useUserStore(); users.user = alice(); users.isLoggedIn = true;
    vault = useVaultStore();
}
beforeEach(freshStores);

// Builds a server-side vault (exported + API envelope) in an isolated pinia, then gives the test fresh stores.
async function serverVault (entries = { one: { password: SECRET } }, phrase = PHRASE) {
    setActivePinia(createPinia());
    const u = useUserStore(); u.user = alice(); u.isLoggedIn = true;
    const v = useVaultStore();
    await v.setup(phrase, fast);
    for (const [id, value] of Object.entries(entries)) await v.put(id, value);
    const exported = v.exportVault();
    freshStores();
    return { exported, envelope: encodeVaultBlob(exported) };
}

describe('vaultBlob codec', () => {
    test('base64url round-trips, accepts padding, rejects bad input', () => {
        const bytes = new Uint8Array([251, 255, 191, 0, 1]);
        const encoded = toBase64url(bytes);
        expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/);
        expect([...fromBase64url(encoded)]).toEqual([...bytes]);
        const padded = encoded + '='.repeat((4 - encoded.length % 4) % 4);
        expect([...fromBase64url(padded)]).toEqual([...bytes]);
        expect(new TextDecoder().decode(fromBase64url(toBase64url('héllo')))).toBe('héllo');
        for (const bad of ['a+b/', 'abc$', 'a', 42, null]) expect(() => fromBase64url(bad)).toThrow(VaultEnvelopeError);
    });

    test('encode drops the owner and decode validates shape (v2 blob, v1 back-compat)', async () => {
        const { exported, envelope } = await serverVault();
        expect(Object.keys(envelope).sort()).toEqual(['ct', 'v']);
        expect(envelope.v).toBe(1); // API envelope unchanged: no contract change
        const blob = ctBlob(envelope);
        expect(blob.version).toBe(VAULT_BLOB_VERSION); // 2: recovery rides inside the same ct
        expect(blob).not.toHaveProperty('owner');
        expect(decodeVaultBlob(envelope)).toEqual({
            check: exported.verifier, recovery: exported.recovery, records: exported.records,
        });
        const enc = (o) => ({ v: 1, ct: Buffer.from(JSON.stringify(o)).toString('base64url') });
        // v1 (legacy) blobs without a recovery envelope still decode.
        expect(decodeVaultBlob(enc({ version: 1, check: exported.verifier, records: {} })).recovery).toBeUndefined();
        for (const bad of [
            null, [], { v: 2, ct: envelope.ct }, { v: 1 }, { v: 1, ct: 'not json' },
            enc({ version: 3, check: exported.verifier, records: {} }),
            enc({ version: 2, records: {} }),
            enc({ version: 2, check: { version: 1 }, records: {} }),
            enc({ version: 2, check: exported.verifier, records: [] }),
            enc({ version: 2, check: exported.verifier, records: { a: 'x' } }),
            enc({ version: 2, check: exported.verifier, records: {}, recovery: 'x' }),
            enc({ version: 2, check: exported.verifier, records: {}, prfOutput: 'x' }),
            enc({ version: 1, check: exported.verifier, records: {}, recovery: exported.recovery }),
        ]) expect(() => decodeVaultBlob(bad)).toThrow(VaultEnvelopeError);
    });
});

describe('VaultService', () => {
    test('isFreshSignInRequired is liberal on body shape but ignores other 401s', () => {
        expect(isFreshSignInRequired(new VaultApiError(401, null))).toBe(true);
        expect(isFreshSignInRequired(new VaultApiError(401, { message: 'Fresh sign-in required' }))).toBe(true);
        expect(isFreshSignInRequired(new VaultApiError(401, { error: 'reauth_required' }))).toBe(true);
        expect(isFreshSignInRequired(new VaultApiError(401, { detail: 'Please sign in again' }))).toBe(true);
        expect(isFreshSignInRequired(new VaultApiError(401, { message: 'Session expired' }))).toBe(false);
        expect(isFreshSignInRequired(new VaultApiError(403, null))).toBe(false);
        expect(isFreshSignInRequired(new Error('x'))).toBe(false);
    });

    test('putVault only sends {expectedRevision, envelope} with a bearer token', async () => {
        vi.stubGlobal('fetch', guarded(() => json(201, { vaultId: 'primary', revision: 1 })));
        const envelope = { v: 1, ct: toBase64url('{}') };
        const result = await new VaultService().putVault('tok', 'primary', { expectedRevision: 0, envelope });
        expect(result).toEqual({ revision: 1 });
        expect(requests[0].body).toEqual({ expectedRevision: 0, envelope });
        expect(new Headers(requests[0].headers).get('Authorization')).toBe('Bearer tok');
    });

    test('getVault maps 404 to not found and other statuses to VaultApiError', async () => {
        vi.stubGlobal('fetch', guarded((_, n) => n === 1 ? json(404, {}) : json(409, { currentRevision: 4 })));
        const service = new VaultService();
        expect(await service.getVault('tok')).toEqual({ found: false });
        const error = await service.putVault('tok', 'primary', { expectedRevision: 1, envelope: { v: 1, ct: toBase64url('{}') } }).catch(e => e);
        expect(error).toBeInstanceOf(VaultApiError);
        expect(error.status).toBe(409);
        expect(error.body.currentRevision).toBe(4);
    });
});

describe('vault store server wiring', () => {
    test('a. loadFromServer on 200 imports a locked vault that the phrase unlocks', async () => {
        const { envelope } = await serverVault();
        vi.stubGlobal('fetch', guarded(({ method, url }) => {
            expect([method, url]).toEqual(['GET', VAULT_URL]);
            return json(200, { vaultId: 'primary', revision: 3, envelope, updatedAt: 'now' });
        }));
        await vault.loadFromServer();
        expect(vault.hasVault).toBe(true);
        expect(vault.hasServerVault).toBe(true);
        expect(vault.isUnlocked).toBe(false);
        expect(vault.serverRevision).toBe(3);
        expect(vault.syncError).toBeNull();
        await vault.unlock(PHRASE);
        expect(await vault.get('one')).toEqual({ password: SECRET });
    });

    test('b. loadFromServer on 404 means no server vault, no error', async () => {
        vi.stubGlobal('fetch', guarded(() => json(404, { message: 'Not found' })));
        await expect(vault.loadFromServer()).resolves.toBeUndefined();
        expect(vault.hasServerVault).toBe(false);
        expect(vault.hasVault).toBe(false);
        expect(vault.serverRevision).toBeNull();
        expect(vault.syncError).toBeNull();
    });

    test('c. loadFromServer on 500 or network failure records a sync error', async () => {
        vi.stubGlobal('fetch', guarded(() => json(500, { message: 'boom' })));
        await expect(vault.loadFromServer()).resolves.toBeUndefined();
        expect(vault.syncError).toEqual(expect.any(String));
        expect(vault.isSyncing).toBe(false);
        vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('Failed to fetch'); }));
        await expect(vault.loadFromServer()).resolves.toBeUndefined();
        expect(vault.syncError).toEqual(expect.any(String));
        expect(vault.hasVault).toBe(false);
    });

    test('d. a vault pushed from one store unlocks from the server in a fresh store', async () => {
        let stored = null;
        const handler = ({ method, body }) => {
            if (method === 'PUT') { stored = body.envelope; return json(201, { vaultId: 'primary', revision: 1 }); }
            return stored ? json(200, { vaultId: 'primary', revision: 1, envelope: stored }) : json(404, {});
        };
        vi.stubGlobal('fetch', guarded(handler));
        await vault.setup(PHRASE, fast);
        await vault.put('one', { password: SECRET });
        await vault.pushToServer();
        freshStores();
        vi.stubGlobal('fetch', guarded(handler));
        await vault.loadFromServer();
        await vault.unlock(PHRASE);
        expect(await vault.get('one')).toEqual({ password: SECRET });
    });

    test('e. pushToServer creates with expectedRevision 0 and sends ciphertext only', async () => {
        await vault.setup(PHRASE, fast);
        await vault.put('one', { password: SECRET });
        vi.stubGlobal('fetch', guarded(({ method, url, body }) => {
            expect([method, url]).toEqual(['PUT', VAULT_URL]);
            expect(Object.keys(body).sort()).toEqual(['envelope', 'expectedRevision']);
            expect(body.expectedRevision).toBe(0);
            expect(Object.keys(body.envelope).sort()).toEqual(['ct', 'v']);
            const blob = ctBlob(body.envelope);
            expect(blob.version).toBe(2);
            expect(blob.check.params.iterations).toBe(VAULT_KDF_LIMITS.minIterations);
            expect(blob.recovery.version).toBe(1); // recovery envelope rides in the same ct
            expect(blob.records.one.version).toBe(1);
            return json(201, { vaultId: 'primary', revision: 1, updatedAt: 'now' });
        }));
        await vault.pushToServer();
        expect(puts()).toHaveLength(1);
        expect(vault.serverRevision).toBe(1);
        expect(vault.hasServerVault).toBe(true);
        expect(vault.syncError).toBeNull();
        expect(vault.isSyncing).toBe(false);
    });

    // Local vault with a 'local' record, plus a 'server-only' envelope sealed under the same key.
    async function conflictFixture () {
        await vault.setup(PHRASE, fast);
        await vault.put('server-only', { password: 'server side' });
        await vault.put('local', { password: SECRET });
        const exported = vault.exportVault();
        const { 'server-only': serverOnly, local } = exported.records;
        vault.importVault({ ...exported, records: { local } }); // same verifier: stays unlocked
        expect(vault.isUnlocked).toBe(true);
        vault.serverRevision = 5;
        const serverEnvelope = encodeVaultBlob({
            verifier: exported.verifier, records: { 'server-only': serverOnly, local: serverOnly },
        });
        return { exported, serverOnly, local, serverEnvelope };
    }

    test('f. 409 refetches, merges server-only ids (local wins) and retries once', async () => {
        const { serverOnly, local, serverEnvelope } = await conflictFixture();
        vi.stubGlobal('fetch', guarded(({ method, body }) => {
            if (method === 'GET') return json(200, { vaultId: 'primary', revision: 7, envelope: serverEnvelope });
            if (puts().length === 1) {
                expect(body.expectedRevision).toBe(5);
                return json(409, { message: 'Revision conflict', currentRevision: 7 });
            }
            expect(body.expectedRevision).toBe(7);
            const blob = ctBlob(body.envelope);
            expect(blob.records['server-only']).toEqual(serverOnly);
            expect(blob.records.local).toEqual(local);
            return json(200, { vaultId: 'primary', revision: 8 });
        }));
        await vault.pushToServer();
        expect(puts()).toHaveLength(2);
        expect(gets()).toHaveLength(1);
        expect(vault.serverRevision).toBe(8);
        expect(vault.syncError).toBeNull();
        expect(vault.records['server-only']).toEqual(serverOnly);
        expect(vault.records.local).toEqual(local);
        expect(await vault.get('server-only')).toEqual({ password: 'server side' });
    });

    test('g2. a fresh-sign-in 401 on the 409 retry asks for re-auth, not a conflict', async () => {
        const { serverEnvelope } = await conflictFixture();
        vi.stubGlobal('fetch', guarded(({ method }) => {
            if (method === 'GET') return json(200, { vaultId: 'primary', revision: 7, envelope: serverEnvelope });
            return puts().length === 1
                ? json(409, { currentRevision: 7 })
                : json(401, { message: 'Fresh sign-in required to update the vault.' });
        }));
        await vault.pushToServer();
        expect(vault.needsFreshSignIn).toBe(true);
        expect(vault.syncError).toMatch(/fresh sign-in/i);
        expect(puts()).toHaveLength(2);
        expect(gets()).toHaveLength(1);
    });

    test('g. a second 409 stops with a conflict error (no loop)', async () => {
        const { serverEnvelope } = await conflictFixture();
        vi.stubGlobal('fetch', guarded(({ method }) => method === 'GET'
            ? json(200, { vaultId: 'primary', revision: 7, envelope: serverEnvelope })
            : json(409, { currentRevision: 7 })));
        await vault.pushToServer();
        expect(vault.syncError).toMatch(/conflict/i);
        expect(puts()).toHaveLength(2);
        expect(gets()).toHaveLength(1);
        expect(vault.serverRevision).toBe(5);
        expect(vault.isSyncing).toBe(false);
    });

    test('h. 409 against a vault sealed under a different phrase never overwrites it', async () => {
        const { exported } = await conflictFixture();
        const foreign = encodeVaultBlob({
            verifier: { ...exported.verifier, params: { ...exported.verifier.params, salt: 'AAAAAAAAAAAAAAAAAAAAAA==' } },
            records: {},
        });
        vi.stubGlobal('fetch', guarded(({ method }) => method === 'GET'
            ? json(200, { vaultId: 'primary', revision: 7, envelope: foreign })
            : json(409, { currentRevision: 7 })));
        await vault.pushToServer();
        expect(vault.syncError).toMatch(/different phrase/i);
        expect(puts()).toHaveLength(1);
        expect(vault.records).not.toHaveProperty('server-only');
    });

    test('i. stale sign-in 401 asks for a fresh sign-in, then the retry saves', async () => {
        await vault.setup(PHRASE, fast);
        await vault.put('one', { password: SECRET });
        vault.serverRevision = 4;
        vi.stubGlobal('fetch', guarded(({ body }) => {
            expect(body.expectedRevision).toBe(4);
            return json(401, { message: 'Fresh sign-in required to update the vault.' });
        }));
        await vault.pushToServer();
        expect(vault.needsFreshSignIn).toBe(true);
        expect(vault.syncError).toEqual(expect.any(String));
        const verify = vi.spyOn(users, 'verifyPassword').mockResolvedValue();
        vi.stubGlobal('fetch', guarded(() => json(200, { vaultId: 'primary', revision: 9 })));
        await vault.retryPushAfterFreshSignIn('loginpw');
        expect(verify).toHaveBeenCalledTimes(1);
        expect(verify).toHaveBeenCalledWith({ password: 'loginpw' });
        expect(vault.needsFreshSignIn).toBe(false);
        expect(vault.serverRevision).toBe(9);
        expect(vault.syncError).toBeNull();
    });

    test('i2. an empty 401 body means fresh sign-in; a failed re-auth rethrows without a PUT', async () => {
        await vault.setup(PHRASE, fast);
        vault.serverRevision = 2;
        vi.stubGlobal('fetch', guarded(() => new Response('', { status: 401 })));
        await vault.pushToServer();
        expect(vault.needsFreshSignIn).toBe(true);
        vi.spyOn(users, 'verifyPassword').mockRejectedValue(new Error('Incorrect password'));
        await expect(vault.retryPushAfterFreshSignIn('wrong')).rejects.toThrow('Incorrect password');
        expect(puts()).toHaveLength(1);
        expect(vault.needsFreshSignIn).toBe(true);
    });

    test('j. other 401s do not ask for a fresh sign-in', async () => {
        await vault.setup(PHRASE, fast);
        vault.serverRevision = 4;
        vi.stubGlobal('fetch', guarded(() => json(401, { message: 'Session expired' })));
        await vault.pushToServer();
        expect(vault.needsFreshSignIn).toBe(false);
        expect(vault.syncError).toEqual(expect.any(String));
    });

    test('l. lock and forget never touch the network', async () => {
        const { envelope } = await serverVault();
        vi.stubGlobal('fetch', guarded((_, count) => {
            if (count > 1) throw new Error('Unexpected network request');
            return json(200, { vaultId: 'primary', revision: 3, envelope });
        }));
        await vault.loadFromServer();
        await vault.unlock(PHRASE);
        vault.lock();
        vault.forget();
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(vault.hasVault).toBe(false);
        expect(vault.serverRevision).toBeNull();
        expect(vault.hasServerVault).toBe(false);
    });

    test('m. pushToServer while locked (or without a vault) rejects without a request', async () => {
        await vault.setup(PHRASE, fast);
        vault.lock();
        await expect(vault.pushToServer()).rejects.toThrow(VaultLockedError);
        vault.forget();
        await expect(vault.pushToServer()).rejects.toThrow(VaultLockedError);
        expect(fetch).not.toHaveBeenCalled();
    });

    test('a lock during an in-flight push is discarded silently', async () => {
        await vault.setup(PHRASE, fast);
        let release;
        vi.stubGlobal('fetch', guarded(() => new Promise(resolve => { release = () => resolve(json(201, { revision: 1 })); })));
        const pushing = vault.pushToServer();
        await vi.waitFor(() => expect(release).toBeTypeOf('function'));
        vault.lock();
        release();
        await pushing;
        expect(vault.serverRevision).toBeNull();
        expect(vault.syncError).toBeNull();
        expect(vault.isSyncing).toBe(false);
    });

    test('signing in auto-loads the server vault; only its own phrase unlocks it', async () => {
        const { envelope } = await serverVault({ one: { a: 1 } }, OTHER_PHRASE);
        setActivePinia(createPinia());
        users = useUserStore();
        vault = useVaultStore();
        vi.stubGlobal('fetch', guarded(() => json(200, { vaultId: 'primary', revision: 2, envelope })));
        // Same order as the user store: the session user lands first, isLoggedIn after.
        users.user = alice();
        users.isLoggedIn = true;
        await vi.waitFor(() => expect(vault.hasVault).toBe(true));
        expect(gets()).toHaveLength(1);
        expect(vault.serverRevision).toBe(2);
        await expect(vault.unlock(PHRASE)).rejects.toThrow(VaultEnvelopeError);
        await vault.unlock(OTHER_PHRASE);
        expect(await vault.get('one')).toEqual({ a: 1 });
    });
});

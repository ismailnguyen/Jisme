// Passkey management, passkey login and account recovery code (docs/passkey-ux-design.md).
// fetch and the WebAuthn ceremony wrapper are mocked; every API error must surface error.reason.
import { beforeEach, describe, test, expect, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useUserStore } from '../src/store';
import usePasskeysStore from '../src/store/passkeys';
import { ApiError, errorText, isPasskeyReenrollmentRequired, readApiError } from '../src/utils/apiError';
import { PasskeyService } from '../src/services/PasskeyService';
import * as webauthn from '../src/utils/webauthn';

vi.mock('../src/utils/webauthn', () => ({
    isWebAuthnSupported: vi.fn(() => true),
    registerPasskey: vi.fn(),
    authenticatePasskey: vi.fn(),
    authenticateWithPrf: vi.fn(),
}));

const API = 'http://localhost:9/';
const json = (status, body) => new Response(body === undefined ? null : JSON.stringify(body), {
    status, headers: { 'Content-Type': 'application/json' },
});
const REENROLL = 'Passkey re-enrollment required: this passkey was registered before verified enrollment.';
let requests;
function api (handler) {
    requests = [];
    const mock = vi.fn(async (url, options = {}) => {
        const body = options.body ? JSON.parse(options.body) : undefined;
        const request = { method: options.method || 'GET', url: String(url), body, headers: new Headers(options.headers) };
        requests.push(request);
        return handler(request, requests.length);
    });
    vi.stubGlobal('fetch', mock);
    return mock;
}

let users, passkeys;
beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());
    users = useUserStore();
    users.user = { uuid: 'alice', email: 'alice@example.test', token: 'tok', passkeys: [] };
    users.isLoggedIn = true;
    passkeys = usePasskeysStore();
});

describe('apiError helpers', () => {
    test('readApiError keeps status, reason and message from {error:{message,reason}}', async () => {
        const error = await readApiError(json(403, { error: { message: 'Forbidden', reason: REENROLL } }));
        expect(error).toBeInstanceOf(ApiError);
        expect(error.status).toBe(403);
        expect(error.reason).toBe(REENROLL);
        expect(error.message).toBe('Forbidden');
        expect(errorText(error, 'fallback')).toBe(REENROLL);
    });

    test('readApiError tolerates empty / non-JSON bodies', async () => {
        const error = await readApiError(new Response('<html>', { status: 502 }));
        expect(error.status).toBe(502);
        expect(error.reason).toBe('');
        expect(errorText(error, 'Could not add the passkey.')).toBe('Could not add the passkey.');
    });

    test('errorText never flattens a reason into generic text', () => {
        expect(errorText(new ApiError(401, { reason: 'Challenge expired' }), 'x')).toBe('Challenge expired');
        expect(errorText(new ApiError(401, { message: 'Bad signature' }), 'x')).toBe('Bad signature');
        expect(errorText({ name: 'NotAllowedError', message: 'cancelled' }, 'x')).toMatch(/cancel/i);
        expect(errorText(null, 'fallback')).toBe('fallback');
    });

    test('isPasskeyReenrollmentRequired matches 403 + re-enrollment reason only', () => {
        expect(isPasskeyReenrollmentRequired(new ApiError(403, { reason: REENROLL }))).toBe(true);
        expect(isPasskeyReenrollmentRequired(new ApiError(403, { reason: 'Forbidden' }))).toBe(false);
        expect(isPasskeyReenrollmentRequired(new ApiError(401, { reason: REENROLL }))).toBe(false);
    });
});

describe('PasskeyService', () => {
    test('endpoints, methods and bodies follow the API contract', async () => {
        api(({ url }) => url.endsWith('users/passkeys') ? json(201, { credential: { id: 'c1' } }) : json(200, { ok: true }));
        const service = new PasskeyService();
        await service.registrationOptions('tok');
        await service.register('tok', { challenge: 'Y2g', response: { id: 'c1' } });
        await service.remove('tok', 'c/1', 'pw');
        await service.login('tok', { id: 'c1' });
        await service.vaultUnlock('tok', { id: 'c1' });
        await service.createRecoveryCode('tok');
        expect(requests.map(r => [r.method, r.url.slice(API.length)])).toEqual([
            ['POST', 'users/passkeys/options'],
            ['POST', 'users/passkeys'],
            ['DELETE', 'users/passkeys/c%2F1'],
            ['POST', 'users/login/passkey'],
            ['POST', 'vaults/unlock/passkey'],
            ['POST', 'users/recovery'],
        ]);
        expect(requests[1].body).toEqual({ challenge: 'Y2g', response: { id: 'c1' } });
        expect(requests[2].body).toEqual({ password: 'pw' });
        expect(requests[3].body).toEqual({ passkey: { id: 'c1' } });
        expect(requests[4].body).toEqual({ assertion: { id: 'c1' } });
        expect(requests.every(r => r.headers.get('Authorization') === 'Bearer tok')).toBe(true);
    });

    test('4xx responses throw ApiError carrying the server reason', async () => {
        api(() => json(400, { error: { message: 'Bad request', reason: 'Attestation origin mismatch' } }));
        const error = await new PasskeyService().register('tok', { challenge: 'Y2g', response: {} }).catch(e => e);
        expect(error).toBeInstanceOf(ApiError);
        expect(error.reason).toBe('Attestation origin mismatch');
    });
});

describe('passkeys store', () => {
    test('list normalizes server and legacy shapes (name, created date, verified)', () => {
        users.user.passkeys = [
            { id: 'c1', name: 'Laptop', createdAt: '2026-11-01T10:00:00Z', verified: true },
            { deviceName: 'Old phone', passkey: { id: 'legacy' } },
        ];
        expect(passkeys.list).toEqual([
            { id: 'c1', name: 'Laptop', createdAt: '2026-11-01T10:00:00Z', verified: true },
            { id: 'legacy', name: 'Old phone', createdAt: null, verified: false },
        ]);
    });

    test('enroll runs options -> ceremony -> register, then lists the new credential (loading -> success)', async () => {
        api(({ url }) => url.endsWith('options')
            ? json(200, { challenge: 'Y2g', rp: { name: 'Jisme' }, user: { id: 'dQ', name: 'alice' } })
            : json(201, { credential: { id: 'c9', name: 'Laptop', createdAt: '2026-11-10T00:00:00Z', verified: true } }));
        let statusDuringCeremony;
        webauthn.registerPasskey.mockImplementation(async (options) => {
            statusDuringCeremony = passkeys.enrollStatus;
            expect(options.challenge).toBe('Y2g');
            return { id: 'c9', response: { attestationObject: 'AA' } };
        });
        await passkeys.enroll('Laptop');
        expect(statusDuringCeremony).toBe('loading');
        expect(passkeys.enrollStatus).toBe('success');
        expect(passkeys.enrollError).toBe('');
        expect(requests[1].body).toEqual({ challenge: 'Y2g', response: { id: 'c9', response: { attestationObject: 'AA' } } });
        expect(passkeys.list.map(p => p.id)).toEqual(['c9']);
    });

    test('enroll surfaces the server reason on 4xx, not a generic message', async () => {
        api(({ url }) => url.endsWith('options') ? json(200, { challenge: 'Y2g' })
            : json(401, { error: { message: 'Not authorized!', reason: 'Registration challenge expired' } }));
        webauthn.registerPasskey.mockResolvedValue({ id: 'c9' });
        await passkeys.enroll('Laptop');
        expect(passkeys.enrollStatus).toBe('error');
        expect(passkeys.enrollError).toBe('Registration challenge expired');
        expect(passkeys.list).toEqual([]);
    });

    test('a cancelled ceremony is an error state with a clear message and nothing is registered', async () => {
        api(() => json(200, { challenge: 'Y2g' }));
        webauthn.registerPasskey.mockRejectedValue(Object.assign(new Error('The operation either timed out or was not allowed.'), { name: 'NotAllowedError' }));
        await passkeys.enroll('Laptop');
        expect(passkeys.enrollStatus).toBe('error');
        expect(passkeys.enrollError).toMatch(/cancel/i);
        expect(requests).toHaveLength(1);
    });

    test('enroll requires a name', async () => {
        api(() => { throw new Error('no request expected'); });
        await passkeys.enroll('   ');
        expect(passkeys.enrollStatus).toBe('error');
        expect(requests).toHaveLength(0);
    });

    test('delete requires the current password, sends it, and removes the passkey', async () => {
        users.user.passkeys = [{ id: 'c1', name: 'Laptop', verified: true }, { id: 'c2', name: 'Phone', verified: true }];
        api(() => json(204));
        passkeys.requestDelete('c1');
        expect(passkeys.pendingDeleteId).toBe('c1');
        await passkeys.confirmDelete('');
        expect(passkeys.deleteError).toMatch(/password/i);
        expect(requests).toHaveLength(0);
        await passkeys.confirmDelete('current pw');
        expect(requests[0]).toMatchObject({ method: 'DELETE', body: { password: 'current pw' } });
        expect(passkeys.list.map(p => p.id)).toEqual(['c2']);
        expect(passkeys.pendingDeleteId).toBeNull();
    });

    test('delete failure keeps the passkey and surfaces the reason', async () => {
        users.user.passkeys = [{ id: 'c1', name: 'Laptop', verified: true }];
        api(() => json(403, { error: { message: 'Forbidden', reason: 'Incorrect password' } }));
        passkeys.requestDelete('c1');
        await passkeys.confirmDelete('wrong');
        expect(passkeys.deleteError).toBe('Incorrect password');
        expect(passkeys.list).toHaveLength(1);
        expect(passkeys.pendingDeleteId).toBe('c1');
    });

    test('recovery code is generated once, kept in memory until dismissed, never persisted', async () => {
        api(() => json(201, { code: 'ABCD-EFGH-IJKL' }));
        await passkeys.generateRecoveryCode();
        expect(passkeys.recoveryCode).toBe('ABCD-EFGH-IJKL');
        expect(passkeys.recoveryStatus).toBe('success');
        passkeys.dismissRecoveryCode();
        expect(passkeys.recoveryCode).toBe('');
        expect(JSON.stringify(users.user)).not.toContain('ABCD-EFGH-IJKL');
    });

    test('recovery code failure surfaces the reason', async () => {
        api(() => json(429, { error: { message: 'Too many', reason: 'Recovery code was regenerated less than 1 hour ago' } }));
        await passkeys.generateRecoveryCode();
        expect(passkeys.recoveryStatus).toBe('error');
        expect(passkeys.recoveryError).toBe('Recovery code was regenerated less than 1 hour ago');
    });
});

describe('passkey login', () => {
    beforeEach(() => {
        users.user = { email: 'alice@example.test', token: 'pre-auth', next: { step: 'verify_passkey' } };
        users.isLoggedIn = false;
    });

    test('an account with a verified passkey is offered passkey sign-in', () => {
        expect(users.canUsePasskeyLogin).toBe(true);
        users.user = { email: 'a', token: 't', next: { step: 'verify_password' } };
        expect(users.canUsePasskeyLogin).toBe(false);
        users.user = { email: 'a', token: 't', next: { step: 'verify_password', passkey: true } };
        expect(users.canUsePasskeyLogin).toBe(true);
    });

    test('success: server-issued options -> assertion -> login', async () => {
        api(({ url }) => url.endsWith('login/passkey/options')
            ? json(200, { challenge: 'c2VydmVy', allowCredentials: [] })
            : json(200, { uuid: 'alice', email: 'alice@example.test', token: 'session' }));
        webauthn.authenticatePasskey.mockResolvedValue({ id: 'c1', response: { signature: 'sig' } });
        await users.verifyPasskey();
        expect(webauthn.authenticatePasskey).toHaveBeenCalledWith(expect.objectContaining({ challenge: 'c2VydmVy' }));
        expect(requests[1].body).toEqual({ passkey: { id: 'c1', response: { signature: 'sig' } } });
        expect(users.isLoggedIn).toBe(true);
        expect(users.loginNotice).toBe('');
    });

    test('403 "Passkey re-enrollment required" falls back to the password form with an explanatory notice', async () => {
        api(({ url }) => url.endsWith('options') ? json(200, { challenge: 'c2VydmVy' })
            : json(403, { error: { message: 'Forbidden', reason: REENROLL } }));
        webauthn.authenticatePasskey.mockResolvedValue({ id: 'legacy' });
        const error = await users.verifyPasskey().catch(e => e);
        expect(isPasskeyReenrollmentRequired(error)).toBe(true);
        expect(users.isLoggedIn).toBe(false);
        expect(users.loginNotice).toBe(REENROLL);
        expect(users.canUsePasskeyLogin).toBe(false); // the password form takes over
        expect(users.user.token).toBe('pre-auth'); // the pre-auth session survives for the password step
    });

    test('other passkey login failures surface the reason (no generic "Not authorized!")', async () => {
        api(({ url }) => url.endsWith('options') ? json(200, { challenge: 'c2VydmVy' })
            : json(401, { error: { message: 'Not authorized!', reason: 'Signature counter regression' } }));
        webauthn.authenticatePasskey.mockResolvedValue({ id: 'c1' });
        const error = await users.verifyPasskey().catch(e => e);
        expect(errorText(error, 'x')).toBe('Signature counter regression');
        expect(users.loginNotice).toBe('');
    });
});

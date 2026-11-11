// Passkey, passkey login, passkey vault unlock and recovery code endpoints (docs/passkey-ux-design.md).
// Every non-2xx response throws ApiError carrying the server's { error: { message, reason } }.
import { BASE_API_URL } from '../utils/api';
import { getHeadersWithAuth } from '../utils/requestHeader';
import { readApiError } from '../utils/apiError';
import { assertApiSafe } from '../utils/vaultKey';

const url = (path) => `${ BASE_API_URL }${ path }`;

async function call (method, path, token, body) {
    const options = { method, headers: getHeadersWithAuth(token) };
    // Nothing named /prf/i (and no non-JSON value) can reach the API.
    if (body !== undefined) options.body = JSON.stringify(assertApiSafe(body, 'request'));
    const response = await fetch(url(path), options);
    if (!response.ok) throw await readApiError(response);
    const text = await response.text().catch(() => '');
    if (!text) return null;
    try { return JSON.parse(text); } catch (_) { return null; }
}

export class PasskeyService {
    listPasskeys (token) {
        return call('GET', 'users/passkeys', token, undefined);
    }

    // 1. Registration options (challenge, user, rp) for the signed-in account.
    registrationOptions (token) {
        return call('POST', 'users/passkeys/options', token, {});
    }

    // 2. Verified registration: 201 { credential }.
    async register (token, { challenge, response }) {
        const body = await call('POST', 'users/passkeys', token, { challenge, response });
        return body?.credential ?? body;
    }

    // 4. Delete: requires the current password.
    remove (token, id, password) {
        return call('DELETE', `users/passkeys/${ encodeURIComponent(id) }`, token, { password });
    }

    // Login challenge (assumed companion of 3; see the design doc).
    loginOptions (token) {
        return call('POST', 'users/login/passkey/options', token, {});
    }

    // 3. Passkey login; 403 + reason "Passkey re-enrollment required" for legacy passkeys.
    login (token, assertion) {
        return call('POST', 'users/login/passkey', token, { passkey: assertion });
    }

    // Vault unlock challenge (assumed companion of 5; see the design doc).
    vaultUnlockOptions (token) {
        return call('POST', 'vaults/unlock/passkey/options', token, {});
    }

    // 5. Vault unlock: only the assertion is sent — never the PRF output. Returns { token, expiresIn | expiresAt }.
    vaultUnlock (token, assertion) {
        return call('POST', 'vaults/unlock/passkey', token, { assertion });
    }

    // 6. One-time account recovery code.
    createRecoveryCode (token) {
        return call('POST', 'users/recovery', token, {});
    }
}

export default PasskeyService;

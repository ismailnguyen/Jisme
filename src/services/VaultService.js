// Thin client for the /vaults API (docs/vault-ux-design.md). Ciphertext-only bodies.
import { BASE_API_URL } from '../utils/api';
import { getHeadersWithAuth } from '../utils/requestHeader';
import { assertApiSafe } from '../utils/vaultKey';

const VAULTS_API_URL = `${ BASE_API_URL }vaults`;
const vaultUrl = (vaultId) => `${ VAULTS_API_URL }/${ encodeURIComponent(vaultId) }`;

export class VaultApiError extends Error {
    constructor (status, body) {
        super(`Vault API request failed (${ status }).`);
        this.name = 'VaultApiError';
        this.status = status;
        this.body = body;
    }
}

// 401 means "fresh sign-in required" when the body says so, or when there is no readable body.
// Other 401s (e.g. an expired session) are ordinary failures.
const FRESH_SIGN_IN = /fresh|re-?auth|sign.?in/i;
export function isFreshSignInRequired (error) {
    if (!(error instanceof VaultApiError) || error.status !== 401) return false;
    const body = error.body;
    if (body === null || body === undefined || typeof body !== 'object') return true;
    return ['message', 'error', 'reason', 'detail']
        .some(field => typeof body[field] === 'string' && FRESH_SIGN_IN.test(body[field]));
}

// Parsed JSON object, or null when the body is empty or not a JSON object.
async function readBody (response) {
    let text = '';
    try { text = await response.text(); } catch (_) { return null; }
    if (!text) return null;
    try {
        const parsed = JSON.parse(text);
        return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (_) {
        return null;
    }
}

export class VaultService {
    async getVault (accessToken, vaultId = 'primary') {
        const response = await fetch(vaultUrl(vaultId), { method: 'GET', headers: getHeadersWithAuth(accessToken) });
        const body = await readBody(response);
        if (response.status === 404) return { found: false };
        if (response.status !== 200 || !body) throw new VaultApiError(response.status, body);
        return { found: true, revision: body.revision, envelope: body.envelope };
    }

    async putVault (accessToken, vaultId, { expectedRevision, envelope }) {
        const payload = assertApiSafe({ expectedRevision, envelope }, 'vaultPut');
        const response = await fetch(vaultUrl(vaultId), {
            method: 'PUT',
            headers: getHeadersWithAuth(accessToken),
            body: JSON.stringify(payload),
        });
        const body = await readBody(response);
        if ((response.status !== 200 && response.status !== 201) || !body) throw new VaultApiError(response.status, body);
        return { revision: body.revision };
    }
}

export default VaultService;

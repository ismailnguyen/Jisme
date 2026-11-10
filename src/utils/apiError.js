// API errors that keep the server's { error: { message, reason } } instead of flattening it
// into generic text ("Not authorized!"). Used by the passkey, login and recovery flows.

export class ApiError extends Error {
    constructor (status, { message = '', reason = '' } = {}) {
        super(message || reason || `Request failed (${ status }).`);
        this.name = 'ApiError';
        this.status = status;
        this.reason = typeof reason === 'string' ? reason : '';
        this.serverMessage = typeof message === 'string' ? message : '';
    }
}

// Builds an ApiError from a non-2xx Response. Never throws on empty / non-JSON bodies.
export async function readApiError (response) {
    let body = null;
    try {
        const text = await response.text();
        body = text ? JSON.parse(text) : null;
    } catch (_) {
        body = null;
    }
    const error = body && typeof body === 'object' && body.error && typeof body.error === 'object' ? body.error : body;
    const pick = (field) => (error && typeof error[field] === 'string' ? error[field] : '');
    return new ApiError(response.status, { message: pick('message'), reason: pick('reason') });
}

// Human text for an error: the server reason first, then its message, then the fallback.
// A cancelled / timed-out WebAuthn prompt gets a clear explanation instead of the browser's text.
export function errorText (error, fallback) {
    if (!error) return fallback;
    if (error.name === 'NotAllowedError' || error.name === 'AbortError') {
        return 'The passkey prompt was cancelled or timed out.';
    }
    if ((error.status === 401 || error.code === 401)
        && [error.reason, error.serverMessage, error.message].some(text => typeof text === 'string' && /too many/i.test(text))) {
        return "You're signing in again too soon. Please wait a few minutes before retrying.";
    }
    if (typeof error.reason === 'string' && error.reason) return error.reason;
    if (error instanceof ApiError) return error.serverMessage || fallback;
    if (typeof error.message === 'string' && error.message) return error.message;
    return fallback;
}

const REENROLL = /re-?enrol/i;
// The server refuses passkeys registered before the verified ceremony with a 403 + reason.
export function isPasskeyReenrollmentRequired (error) {
    return error instanceof ApiError && error.status === 403
        && (REENROLL.test(error.reason) || REENROLL.test(error.serverMessage));
}

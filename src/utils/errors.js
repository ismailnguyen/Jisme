export function Exception (reason, message, code) {
    this.name = reason;
    this.message = message;
    this.code = code;
}
Exception.prototype.toString = function () {
    return this.message || this.name || 'Error';
}

export function LoginException (reason, message = '') {
    this.message = message;
    this.reason = reason;
}
LoginException.prototype.toString = function () {
    return this.message || this.reason || 'Login error';
}

export function SessionExpiredException () {
    this.name = 'Session expired';
    this.message = 'Please login again';
    this.code = 401;
}
SessionExpiredException.prototype.toString = function () {
    return this.message || this.name || 'Session expired';
}

export function HttpException (response) {
    this.name = '';
    this.message = '';
    this.code = response.status;

    response.json().then(({ error: { reason, message } }) => {
        this.name = reason;
        this.message = message;
    })
}
HttpException.prototype.toString = function () {
    return this.message || this.name || 'HTTP error';
}

// Network-aware helpers
export function isNetworkError(error) {
    if (!error) return false;
    const msg = typeof error.message === 'string' ? error.message : '';
    return (
        error.name === 'TypeError' && (
            msg.includes('Failed to fetch') ||
            msg.includes('NetworkError') ||
            msg.includes('Load failed')
        )
    );
}

export function NetworkException (message = 'You appear to be offline. We will show cached data if available.', code = 0) {
    this.name = 'Offline';
    this.message = message;
    this.code = code;
}
NetworkException.prototype.toString = function () {
    return this.message || 'Offline';
}

export function Exception (reason, message, code) {
    this.name = reason;
    this.message = message;
    this.code = code;
}

export function LoginException (message) {
    this.message = message;
}

export function SessionExpiredException () {
    this.name = 'Session expired';
    this.message = 'Please login again';
    this.code = 401;
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
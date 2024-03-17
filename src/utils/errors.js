export function Exception (reason, message, code) {
    this.name = reason;
    this.message = message;
    this.code = code;
}

export function SessionExpiredException (reason, message, code) {
    this.name = 'Session expired';
    this.message = 'Please login again';
    this.code = code;
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
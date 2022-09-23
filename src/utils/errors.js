exports.Exception = function (reason, message, code) {
    this.name = reason;
    this.message = message;
    this.code = code;
}

exports.SessionExpiredException = function (reason, message, code) {
    this.name = 'Session expired';
    this.message = 'Please login again';
    this.code = code;
}

exports.HttpException = function (response) {
    this.name = '';
    this.message = '';
    this.code = response.status;

    response.json().then(({ error: { reason, message } }) => {
        this.name = reason;
        this.message = message;
    })
}
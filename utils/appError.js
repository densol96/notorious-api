class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${this.statusCode}`.startsWith(`4`) ? 'fail' : 'error';
        this.isOperational = true;

        // To NOT pollute the error's stack
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;

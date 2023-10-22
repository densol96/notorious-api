const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
    // Wrong format for the field in mongoDB is provided, then
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};

const handleDuplicateFieldsErrorDB = (err) => {
    let message = `Duplicate field/s: `;
    Object.entries(err.keyValue).forEach(([field, value]) => {
        const pair = `${field} -> ${value}, `;
        message += pair;
    });
    message = message.slice(0, -2);
    return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    let message = 'Invalid input data: ';
    errors.forEach((errorText, i) => {
        message += `"${errorText}"`;
        message += i !== errors.length - 1 ? ', ' : '.';
    });
    return new AppError(message, 400);
};

const sendErrDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    });
};

const sendErrProd = (err, res) => {
    // Operational (trusted) error: send message to the client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    }
    // Programming or other unknown error: don;t lear error details to the user
    else {
        // 1. Log the error
        console.error(`ERROR 💥`, err);
        // 2. Send the generic message
        res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!',
        });
    }
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if (process.env.NODE_ENV.trim() === 'development') {
        sendErrDev(err, res);
    } else if (process.env.NODE_ENV.trim() === 'production') {
        let error = err;
        if (err.name === 'CastError') error = handleCastErrorDB(err);
        else if (err.code === 11000) error = handleDuplicateFieldsErrorDB(err);
        else if (err.name === 'ValidationError')
            error = handleValidationErrorDB(err);
        sendErrProd(error, res);
    }
};

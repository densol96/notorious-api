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

const handleJWTError = (err) =>
    new AppError(`Invalid token! Please log in again!`, 401);

const handleJWTExpired = (err) =>
    new AppError(`Your log in session has expired! Please log in again!`, 401);

const sendErrDev = (err, req, res) => {
    // API
    if (req.originalUrl.startsWith('/api')) {
        res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack,
        });
    }
    // RENDERED WEBSITE
    else {
        res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            msg: err.message,
        });
    }
    console.error(`💥💥💥 ERROR IN DEV MODE `, err);
};

const sendErrProd = (err, req, res) => {
    // API
    // Send the generic message
    if (req.originalUrl.startsWith('/api')) {
        if (err.isOperational) {
            res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            });
        } else {
            res.status(500).json({
                status: 'error',
                message: 'Something went very wrong!',
            });
        }
    }
    // REENDERED WEBSITE
    else {
        if (err.isOperational) {
            res.status(err.statusCode).render('error', {
                title: 'Something went wrong!',
                msg: err.message,
            });
        } else {
            res.status(500).render('error', {
                title: 'Something went wrong!',
                status: 'error',
                msg: 'Something went very wrong!',
            });
        }
    }
    console.error(`💥💥💥 ERROR IN PROD ==> `, err);
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if (process.env.NODE_ENV.trim() === 'development') {
        sendErrDev(err, req, res);
    } else if (process.env.NODE_ENV.trim() === 'production') {
        let error = err;
        if (err.name === 'CastError') error = handleCastErrorDB(err);
        else if (err.code === 11000) error = handleDuplicateFieldsErrorDB(err);
        else if (err.name === 'ValidationError')
            error = handleValidationErrorDB(err);
        else if (err.name === 'JsonWebTokenError') error = handleJWTError(err);
        else if (err.name === `TokenExpiredError`)
            error = handleJWTExpired(err);
        sendErrProd(error, req, res);
    }
};

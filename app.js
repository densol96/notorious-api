const usersRouter = require('./router/userRouter');
const toursRouter = require('./router/tourRouter');

const AppError = require(`./utils/appError`);
const globalErrorHandler = require('./controllers/errorController');

const express = require('express');
const app = express();
// MIDDLEWARE
// express.json() returns a middleware callback function that transforms request-content in JSON to JS Object
app.use(express.json());
/*
Makes static files accessible as if 127.0.0.1:3000 === ..../public/
F.e. 127.0.0.1:3000/img/logo-white.png
*/
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
    req.timeOfRequest = new Date().toISOString();
    next();
});

app.use('/api/v1/tours', toursRouter);
app.use('/api/v1/users', usersRouter);

app.all('*', (req, res, next) => {
    const err = new AppError(
        `Invalid API endpoint (${req.url}) for this type of request(${req.method})!`,
        404
    );
    // If we pass anything to next, express will treat it like an error and go to global error handling mw
    next(err);
});

app.use(globalErrorHandler);
module.exports = app;

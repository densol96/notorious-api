const express = require('express');
const usersRouter = require('./router/userRouter');
const toursRouter = require('./router/tourRouter');

const app = express();
// MIDDLEWARE
// express.json() returns a middleware callback function that transforms request-content is JSON to JS Object
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
app.use((req, res) => {
    res.status(404).json({
        status: 'fail',
        message: 'Page not found.',
    });
});
module.exports = app;

const express = require('express');
const usersRouter = require('./routes/userRoutes');
const toursRouter = require('./routes/tourRoutes');

const app = express();
// MIDDLEWARE
// express.json() returns a middleware callback function that transforms request-content is JSON to JS Object
app.use(express.json());

app.use((req, res, next) => {
    req.timeOfRequest = new Date().toISOString();
    next();
});

app.use('/api/v1/tours', toursRouter);
app.use('/api/v1/users', usersRouter);

module.exports = app;

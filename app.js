const path = require('path');
const usersRouter = require('./router/userRouter.js');
const toursRouter = require('./router/tourRouter.js');
const reviewsRouter = require('./router/reviewRouter.js');
const viewRouter = require('./router/viewRouter.js');

const AppError = require(`./utils/appError.js`);
const globalErrorHandler = require('./controllers/errorController.js');

const morgan = require('morgan');

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require(`express-mongo-sanitize`);
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const express = require('express');
const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
////////// GLOBAL MIDDLEWARES   ///////////////

// MORGAN
if (process.env.NODE_ENV.trim() === 'development') {
    app.use(morgan('dev'));
}

// RATE LIMITING
let requestsPerHour;
if (process.env.NODE_ENV.trim() === 'development') {
    requestsPerHour = +process.env.RATE_LIMIT_DEV;
} else {
    requestsPerHour = +process.env.RATE_LIMIT_PROD;
}
// middleware function
// re-running the script, will flash the counter
const limiter = rateLimit({
    max: requestsPerHour,
    windowMs: 1000 * 60 * 60,
    message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// SETTING SECURITY HTTP HEADERS
const scriptSrcUrls = [
    'https://unpkg.com/',
    'https://tile.openstreetmap.org',
    'https://cdn.jsdelivr.net/',
];
const styleSrcUrls = [
    'https://unpkg.com/',
    'https://tile.openstreetmap.org',
    'https://fonts.googleapis.com/',
];
const connectSrcUrls = [
    'https://unpkg.com',
    'https://tile.openstreetmap.org',
    'ws://127.0.0.1:*/',
];
const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", 'blob:'],
            objectSrc: [],
            imgSrc: ["'self'", 'blob:', 'data:', 'https:'],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);
// BODY PARSER = reading data from body into req.body
// express.json() returns a middleware callback function that transforms request-content in JSON to JS Object
app.use(
    express.json({
        limit: '10kb',
    })
);

// Parse cookies to req.cookies
app.use(cookieParser());

// PREVENT PARAMETER POLLUTION
app.use(
    hpp({
        whitelist: [
            'duration',
            'ratingsAverage',
            'ratingsQuantity',
            'maxGroupSize',
            'difficulty',
            'price',
        ],
    })
);

// DATA SANITIZATION
// Against NoSQL query injection
// looks at req.body / req.params / req.query and cleans it off $ etc. chars
app.use(mongoSanitize());

// Against XSS = Cross Site Scripting
// Looks for and edits HTML symbols
app.use(xss());
// SERVING STATIC FILES
/*
Makes static files accessible as if 127.0.0.1:3000 === ..../public/
F.e. 127.0.0.1:3000/img/logo-white.png
*/
app.use(express.static(`${__dirname}/public`));

// TEST middleware
app.use((req, res, next) => {
    console.log('=== Request additional data.. ===');
    req.timeOfRequest = new Date().toISOString();
    console.log(req.cookies);

    next();
});

// ROUTES
app.use('/api/v1/tours', toursRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/reviews', reviewsRouter);
app.use('/', viewRouter);

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

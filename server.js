// GLOBAL ERRORS COMING FROM SYNCHRONOUS CODE SOMEWHERE
process.on('uncaughtException', (err) => {
    console.log(`💥💥💥 Unhandled global EXCEPTION!`);
    console.log(err);
    process.exit(1);
});
// This only needs to happen once and then process.env will be available in other files of the app as well.
const dotenv = require('dotenv');
dotenv.config({ path: `${__dirname}/config.env` });
const app = require('./app');
const mongoose = require('mongoose');

// Configure mongoDB
const DB = process.env.DATABASE_REMOTE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
);

mongoose
    .connect(DB)
    .then((connection) => {
        console.log(`Remote DB connection successful!`);
    })
    .catch((err) => {
        console.log(`💥ERROR: `, err.message);
    });

// Configure the server to listen on localhost, port 3000 is coming from config.env
const port = +process.env.PORT;

const server = app.listen(port, () => {
    console.log(`Server up on 127.0.0.1:${port}`);
});

// To deal with unhandled rejections (from Promises) coming from ASYNCHRONOUS code somewhere globally!
process.on('unhandledRejection', (err) => {
    console.log(`💥💥💥 Unhandled global REJECTION!`);
    console.log(err);
    server.close(() => {
        process.exit(1);
    });
});

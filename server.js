const app = require('./app');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// This only needs to happen once and then process.env will be available in other files of the app as well.
dotenv.config({ path: `${__dirname}/config.env` });

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

app.listen(port, () => {
    console.log(`Server up on 127.0.0.1:${port}`);
});

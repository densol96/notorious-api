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
    .connect(DB, {
        useNewUrlParser: true,
        // useCreateIndex: true,
        // useFindAndModify: false,
    })
    .then((connection) => {
        console.log(`Remote DB connection successful!`);
    })
    .catch((err) => {
        console.log(`ERROR: `, err.message);
    });

// Create a schema
const toursSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
    },
    rating: {
        type: Number,
        default: 4.5,
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price'],
    },
});

const Tour = mongoose.model('Tour', toursSchema);

const testTour = new Tour({
    name: 'The Forest Hiker',
    rating: 4.7,
    price: 497,
});

testTour
    .save()
    .then((doc) => {
        console.log('This document has been added to DB: ');
        console.log(doc);
    })
    .catch((err) => {
        console.log(`💥 ERROR: `, err);
    });
// Configure the server to listen on local host on PORT 3000
const port = +process.env.PORT;
app.listen(port, () => {
    console.log(`Server up on 127.0.0.1:${port}`);
});

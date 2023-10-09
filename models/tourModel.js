const mongoose = require('mongoose');

// Create a schema
const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true,
    },
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size'],
    },
    difficulty: {
        type: 'String',
        required: [true, 'A tour must have a difficulty'],
        trim: true,
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
    },
    ratingsQuantity: {
        type: Number,
        default: 0,
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price'],
    },
    priceDiscount: Number,
    summary: {
        type: String,
        trim: true, //trims the input string
        required: true,
    },
    description: {
        type: String,
        trim: true,
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image'],
    },
    images: [String], // An array of strings
    createdAt: {
        type: Date,
        default: Date.now,
        select: false, // will not display to the user
    },
    startDates: [Date],
}).set('collection', 'tours');

// Model to be used as blueprint for Tours coming to DB
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;

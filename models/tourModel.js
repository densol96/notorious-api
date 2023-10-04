const mongoose = require('mongoose');

// Create a schema
const tourSchema = new mongoose.Schema({
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
}).set('collection', 'tours');

// Model to be used as blueprint for Tours coming to DB
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;

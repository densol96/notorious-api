const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema(
    {
        review: {
            type: String,
            required: [true, 'Review cannot be empty'],
            minlength: [10, 'Review must be at least 10 words long'],
        },
        rating: {
            type: Number,
            min: [1, 'Rating starts at 1'],
            max: [5, 'Rating ends at 5'],
            required: [true, 'A review must have a rating'],
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        tour: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tour', // refers to a Tour model
            required: [true, 'Review must belong to a tour!'],
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Review must belong to a user!'],
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

reviewSchema.pre('find', function (next) {
    // prettier-ignore
    this
    // .populate({
    //     path: 'tour',
    //     select: 'name slug'
    // })
    .populate({
        path: 'user',
        select: 'name email'
    });
    next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;

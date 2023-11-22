const mongoose = require('mongoose');
const Tour = require('./tourModel.js');

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

// Prevents the duplicate reviews on the tour by the same user
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre('find', function (next) {
    // prettier-ignore
    this
    // .populate({
    //     path: 'tour',
    //     select: 'name slug'
    // })
    .populate({
        path: 'user',
        select: 'name email photo'
    });
    next();
});

// static method
reviewSchema.statics.calcAverageRatings = async function (tourId) {
    // in a STATIC method "this" points to a corresponding MODEL!
    // you can only use aggregate method on the model!

    const stats = await this.aggregate([
        {
            $match: { tour: tourId },
        },
        {
            $group: {
                _id: '$tour',
                numOfRatings: { $sum: 1 },
                averageRating: { $avg: '$rating' },
            },
        },
    ]);

    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsAverage: stats[0].averageRating,
            ratingsQuantity: stats[0].numOfRatings,
        });
    }
    // if no review at all, use default vals
    else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsAverage: 4.5,
            ratingsQuantity: 0,
        });
    }
};

// Important to use POST middleware here, cause only then the review will be in a collection
// POST middleware doesn's get access to NEXT()
reviewSchema.post('save', function () {
    // can't use Review.aggregate directly, cause it's not defined at this point
    // also can't put this middleware after const Review, cause the schemma passed in to create a model will not have this middleware!
    // solution to access Review model from here:
    this.constructor.calcAverageRatings(this.tour);
});

// Will also work for findByIdAndUpdate/Delete because behind the scenes this is just a shorthand for findOneAnd with _id as a a query
// post query middleware gets the access to the updated document
reviewSchema.post(/^findOneAnd/, async function (document) {
    // in query middleware, this refers to the current query
    await document.constructor.calcAverageRatings(document.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;

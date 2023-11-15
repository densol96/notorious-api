const Review = require('./../models/reviewModel.js');
const catchAsyncError = require('./../utils/catchAssyncErr.js');

exports.postReview = catchAsyncError(async (req, res) => {
    const newReview = await Review.create(req.body);
    res.status(200).json({
        status: 'success',
        results: 'Your review has been saved to DB!',
        review: newReview,
    });
});

exports.getAllReviews = catchAsyncError(async (req, res) => {
    const reviews = await Review.find();
    res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: {
            reviews,
        },
    });
});

const Review = require('./../models/reviewModel.js');
const catchAsyncError = require('./../utils/catchAssyncErr.js');

exports.postReview = catchAsyncError(async (req, res) => {
    // IF not provided with a POST request, then
    if (!req.body.tour) {
        // get from URL
        req.body.tour = req.params.id;
    }
    if (!req.body.user) {
        // Check the protect middleware
        req.body.user = req.user._id;
    }

    const newReview = await Review.create(req.body);
    console.log(newReview);
    res.status(200).json({
        status: 'success',
        results: 'Your review has been saved to DB!',
        review: newReview,
    });
});

exports.getAllReviews = catchAsyncError(async (req, res) => {
    let filter = {};
    if (req.params.id) {
        filter = { tour: req.params.id };
    }
    const reviews = await Review.find(filter);

    res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: {
            reviews,
        },
    });
});

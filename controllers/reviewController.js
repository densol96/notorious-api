const Review = require('./../models/reviewModel.js');
const handlerFactory = require('./handlerFactory.js');
const catchAsyncError = require('./../utils/catchAssyncErr.js');
const AppError = require('../utils/appError.js');

exports.setUserTour = (req, res, next) => {
    if (!req.body.tour) {
        // get from URL
        req.body.tour = req.params.id;
    }
    if (!req.body.user) {
        // Check the protect middleware
        req.body.user = req.user._id;
    }
    next();
};

exports.protectNotMyReviews = catchAsyncError(async (req, res, next) => {
    const reviewForChange = await Review.findById(req.params.id);
    if (!reviewForChange)
        throw new AppError('The review with such id does not exist!', 404);
    // when comparing 2 i Objects need to use this method
    if (req.user.role != 'admin' && !reviewForChange.user.equals(req.user._id))
        throw new AppError(
            "You have no permissions to edit other users' reviews!",
            403
        );
    next();
});

exports.postReview = handlerFactory.createDocument(Review);
// exports.postReview = catchAsyncError(async (req, res) => {
//     const newReview = await Review.create(req.body);
//     console.log(newReview);
//     res.status(200).json({
//         status: 'success',
//         results: 'Your review has been saved to DB!',
//         review: newReview,
//     });
// });

exports.getAllReviews = handlerFactory.getAllDocuments(Review);
// exports.getAllReviews = catchAsyncError(async (req, res) => {
//     let filter = {};
//     if (req.params.id) {
//         filter = { tour: req.params.id };
//     }
//     const reviews = await Review.find(filter);

//     res.status(200).json({
//         status: 'success',
//         results: reviews.length,
//         data: {
//             reviews,
//         },
//     });
// });

exports.deleteReview = handlerFactory.deleteDocument(Review);
exports.updateReview = handlerFactory.updateDocument(Review);
exports.getReview = handlerFactory.getDocument(Review);

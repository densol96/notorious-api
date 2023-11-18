const express = require('express');
// mergeParams = if reviewsRouter was mounted on some other one, it will also get access to that router's params (:id etc)
const router = express.Router({ mergeParams: true });

const {
    getAllReviews,
    postReview,
    deleteReview,
    updateReview,
    setUserTour,
    getReview,
} = require(`./../controllers/reviewController.js`);

const { protect, restrictTo } = require('./../controllers/authController.js');

// prettier-ignore
router
    .route('/')
    .get(getAllReviews)
    .post(protect, restrictTo('user'), setUserTour, postReview);

// prettier-ignore
router.route('/:id')
    .get(getReview)
    .patch(updateReview)
    .delete(deleteReview);

module.exports = router;

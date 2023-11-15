const express = require('express');
const router = express.Router();

const {
    getAllReviews,
    postReview,
} = require(`./../controllers/reviewController.js`);

const { protect, restrictTo } = require('./../controllers/authController.js');

// prettier-ignore
router
    .route('/')
    .get(getAllReviews)
    .post(protect, restrictTo('user'), postReview);

module.exports = router;

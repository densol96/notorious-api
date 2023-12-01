const express = require('express');
const router = express.Router();

const {
    postTour,
    getAllTours,
    getTourById,
    updateTour,
    deleteTour,
    setQueryStringForTopFive,
    getTourStats,
    getMonthlyPlan,
    lowerField,
    getToursWithin,
    getDistances,
    uploadTourPhotos,
    resizeTourImages,
} = require(`${__dirname}/../controllers/tourController.js`);

const {
    protect,
    restrictTo,
} = require(`${__dirname}/../controllers/authController.js`);

const reviewsRouter = require('./reviewRouter.js');
// This middleware will be applied first to the request matching the .route(`/:id`)
// router.param('id', validateID);

// prettier-ignore
router.route(`/top-5`)
    .get(setQueryStringForTopFive, getAllTours);

// prettier-ignore
router.route(`/stats`)
    .get(getTourStats);

// prettier-ignore
router.route(`/monthly-plan/:year`)
    .get(getMonthlyPlan);

router
    .route('/tours-within/:distance/center/:latlng/unit/:unit')
    .get(getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(getDistances);

// prettier-ignore
router
    .route(`/`)
    .get(getAllTours)
    .post(protect, restrictTo("lead-guide", "admin"),postTour);

// prettier-ignore
router
    .route(`/:id`)
    .get(getTourById)
    .patch(protect, restrictTo('lead-guide', 'admin'), uploadTourPhotos, resizeTourImages,  updateTour)
    .delete(protect, restrictTo('lead-guide', 'admin'), deleteTour);

// NESTED ROUTE simillar to app.use("url", router)
router.use('/:id/reviews', reviewsRouter);

module.exports = router;

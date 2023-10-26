const express = require('express');
const router = express.Router();

const {
    postTour,
    getAllTours,
    getTourByID,
    updateTour,
    deleteTour,
    setQueryStringForTopFive,
    getTourStats,
    getMonthlyPlan,
} = require(`${__dirname}/../controllers/tourController.js`);
const { protect } = require(`${__dirname}/../controllers/authController.js`);
// This middleware will be applied first to the request matching the .route(`/:id`)
// router.param('id', validateID);

// prettier-ignore
router.route(`/`)
    .get(protect, getAllTours)
    .post(postTour);

// prettier-ignore
router.route(`/top-5`)
    .get(setQueryStringForTopFive, getAllTours);

// prettier-ignore
router.route(`/stats`)
    .get(getTourStats);

// prettier-ignore
router.route(`/monthly-plan/:year`)
    .get(getMonthlyPlan);

// prettier-ignore
router.route(`/:id`)
    .get(getTourByID)
    .patch(updateTour)
    .delete(deleteTour);

module.exports = router;

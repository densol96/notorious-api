const express = require('express');
const router = express.Router();

const {
    validateID,
    postTour,
    getAllTours,
    getTourByID,
    updateTour,
    deleteTour,
    setQueryStringForTopFive,
} = require(`${__dirname}/../controllers/tourController.js`);

// This middleware will be applied first to the request matching the .route(`/:id`)
// router.param('id', validateID);

// prettier-ignore
router.route(`/`)
    .get(getAllTours)
    .post(postTour);

// prettier-ignore
router.route(`/top-5`)
    .get(setQueryStringForTopFive, getAllTours);

// prettier-ignore
router.route(`/:id`)
    .get(getTourByID)
    .patch(updateTour)
    .delete(deleteTour);

module.exports = router;

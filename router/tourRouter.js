const express = require('express');
const router = express.Router();

const {
    validateID,
    checkBodyPost,
    getAllTours,
    getTour,
    addTour,
    updateTour,
    deleteTour,
} = require('../controllers/tourController');

// This middleware will be applied first to the request matching the .route(`/:id`)
router.param('id', validateID);

// prettier-ignore
router.route(`/`)
    .get(getAllTours)
    .post(checkBodyPost, addTour);

// prettier-ignore
router.route(`/:id`)
    .get(getTour)
    .patch(updateTour)
    .delete(deleteTour);

module.exports = router;

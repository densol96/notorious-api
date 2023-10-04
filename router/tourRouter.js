const express = require('express');
const router = express.Router();

const {
    validateID,
    createTour,
} = require(`${__dirname}/../controllers/tourController.js`);

// This middleware will be applied first to the request matching the .route(`/:id`)
// router.param('id', validateID);

// prettier-ignore
router
    .route(`/`)
    // .get(getAllTours)
    .post(createTour);

// prettier-ignore
// router.route(`/:id`)
//     .get(getTour)
//     .patch(updateTour)
//     .delete(deleteTour);

module.exports = router;

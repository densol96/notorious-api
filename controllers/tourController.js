const Tour = require(`../models/tourModel.js`);
const fs = require('fs');

exports.validateID = (req, res, next, val) => {
    const tourExists = tours.find((tour) => tour.id === +val);
    if (!tourExists) {
        return res.status(404).json({
            status: 'fail',
            message: 'No tour found with this ID..',
        });
    }
    next();
};

exports.createTour = async (req, res, next) => {
    // MUST HAVE  -> NAME; PRICE
    // OPTIONAL -> RATING (default 4.5)
    // 1. OPTION
    // const newTour = new Tour(req.body);
    // await newTour.save();

    // 2. OPTION
    try {
        const newTour = await Tour.create(req.body);
        res.status(200).json({
            status: 'success',
            message: 'Tour document has been created!',
            tour: newTour,
        });
        console.log(`SUCCESS`);
    } catch (err) {
        console.log('💥 ERROR in createTour --> ');
        // console.log(err);
        res.status(400).json({
            status: 'fail',
            message: err,
        });
    }
};

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

exports.postTour = async (req, res) => {
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
    } catch (err) {
        console.log('💥 ERROR in createTour --> ');
        // console.log(err);
        res.status(400).json({
            status: 'fail',
            message: err,
        });
    }
};

exports.getAllTours = async (req, res) => {
    try {
        // BUILD QUERY
        // 1) Filtering
        const requestQueries = { ...req.query };
        const excludedFields = ['sort', 'fields', 'page', 'limit'];
        excludedFields.forEach((el) => delete requestQueries[el]);

        // 2) Advanced filtering
        let requestQueriesToString = JSON.stringify(requestQueries);
        requestQueriesToString = requestQueriesToString.replace(
            /\b(gte|gt|lte|lt)\b/g,
            (match) => `$${match}`
        );
        let query = Tour.find(JSON.parse(requestQueriesToString));

        // 3) Sorting
        if (req.query.sort) {
            query = query.sort(req.query.sort);
            // query = query.sort({ [req.query.sort]: 'ascending' });
            // query = query.sort({ [req.query.sort]: 'descending' });
            /*
            Could also use price vs -price, in both our code and API request:
            query.sort('-price');
            */
        } else {
            query = query.sort(`-createdAt`);
        }

        //  4) Field limiting
        if (req.query.fields) {
            const fields = req.query.fields.split(',').join(' ');
            query = query.select(fields); // "name price duration"
        } else {
            query = query.select('-__v'); // exclude __v
        }

        // 5) Pagination
        const page = req.query.page ? +req.query.page : 1;
        const limit = req.query.limit ? +req.query.limit : 100;
        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(limit);

        if (req.query.page) {
            const numTours = await Tour.countDocuments();
            if (skip >= numTours) throw new Error(`This page doesn't exist!`);
        }
        // EXECUTE QUERY
        const tours = await query;

        res.status(200).json({
            status: 'success',
            results: tours.length,
            data: {
                tours,
            },
        });
    } catch (err) {
        console.log(`💥ERROR in getAllTours --> `);
        console.log(err.message);
        res.status(400).json({
            status: 'error',
            message: err.message,
        });
    }
};

exports.getTourByID = async (req, res) => {
    try {
        // Tour.findById(req.params.id)
        const tour = await Tour.findOne({ _id: req.params.id });
        if (tour === null) throw new Error('No query with such ID found!');
        res.status(200).send({
            status: 'success',
            data: {
                tour,
            },
        });
    } catch (err) {
        res.status(400).send({
            status: 'fail',
            message: err.message,
        });
    }
};

exports.updateTour = async (req, res) => {
    try {
        const tour = await Tour.findOneAndUpdate(
            { _id: req.params.id },
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );
        res.status(200).send({
            status: 'success',
            data: {
                tour,
            },
        });
    } catch (err) {
        console.log(`💥ERROR in updateTour --->`);
        res.status(400).send({
            status: 'fail',
            message: err,
        });
    }
};

exports.deleteTour = async (req, res) => {
    try {
        const tour = await Tour.findOneAndDelete({ _id: req.params.id });
        console.log(tour);
        res.status(200).send({
            status: 'success',
            data: {
                tour,
            },
        });
    } catch (err) {
        console.log(`💥ERROR in updateTour --->`);
        res.status(400).send({
            status: 'fail',
            message: err,
        });
    }
};

exports.deleteAll = async (req, res) => {
    try {
        Tour.deleteAll();
    } catch (err) {
        console.log(`💥 ERROR in deleteAll --> `);
        console.log(err.message);
        req.status(401).json({
            status: 'fail',
            message: err.message,
        });
    }
};

exports.setQueryStringForTopFive = (req, res, next) => {
    console.log(`I am inside the middleware!`);
    req.query.limit = 5;
    req.query.sort = `-ratingsAverage`;
    next();
};

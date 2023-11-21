const fs = require('fs');
const Tour = require(`../models/tourModel`);
const APIFeatures = require(`./../utils/APIfeatures`);
const catchAsyncError = require(`../utils/catchAssyncErr`);
const AppError = require('../utils/appError');
const handlerFactory = require('./handlerFactory.js');

// exports.postTour = catchAsyncError(async (req, res) => {
//     const newTour = await Tour.create(req.body);
//     res.status(200).json({
//         status: 'success',
//         message: 'Tour document has been created!',
//         tour: newTour,
//     });
// });

exports.lowerField = (req, res, next) => {
    req.body.difficulty = req.body?.difficulty?.toLowerCase();
    next();
};

exports.postTour = handlerFactory.createDocument(Tour);

exports.getAllTours = handlerFactory.getAllDocuments(Tour);
// exports.getAllTours = catchAsyncError(async (req, res) => {
// BUILD QUERY
// 1) Filtering
// const requestQueries = { ...req.query };
// const excludedFields = ['sort', 'fields', 'page', 'limit'];
// excludedFields.forEach((el) => delete requestQueries[el]);

// // 2) Advanced filtering
// let requestQueriesToString = JSON.stringify(requestQueries);
// requestQueriesToString = requestQueriesToString.replace(
//     /\b(gte|gt|lte|lt)\b/g,
//     (match) => `$${match}`
// );
// let query = Tour.find(JSON.parse(requestQueriesToString));
// const fullQuery = new APIFeatures(Tour.find(), res.query);
// fullQuery.filter();
// // 3) Sorting
// if (req.query.sort) {
//     query = query.sort(req.query.sort);
//     // query = query.sort({ [req.query.sort]: 'ascending' });
//     // query = query.sort({ [req.query.sort]: 'descending' });
//     /*
//     Could also use price vs -price, in both our code and API request:
//     query.sort('-price');
//     */
// } else {
//     query = query.sort(`-createdAt`);
// }

//  4) Field limiting
// if (req.query.fields) {
//     const fields = req.query.fields.split(',').join(' ');
//     query = query.select(fields); // "name price duration"
// } else {
//     query = query.select('-__v'); // exclude __v
// }

// 5) Pagination
// const page = req.query.page ? +req.query.page : 1;
// const limit = req.query.limit ? +req.query.limit : 100;
// const skip = (page - 1) * limit;
// query = query.skip(skip).limit(limit);

// if (req.query.page) {
//     const numTours = await Tour.countDocuments();
//     if (skip >= numTours) throw new Error(`This page doesn't exist!`);
// }
// EXECUTE QUERY
//     const fullQuery = new APIFeatures(Tour.find(), req.query);
//     fullQuery.filter().sort().limitFields().paginate();
//     const tours = await fullQuery.queryInBuild;

//     res.status(200).json({
//         status: 'success',
//         results: tours.length,
//         data: {
//             tours,
//         },
//     });
// });

exports.getTourById = handlerFactory.getDocument(Tour, [
    'reviews',
    { path: 'guides', select: 'name email' },
]);

// exports.getTourByID = catchAsyncError(async (req, res) => {
//     // Tour.findById(req.params.id)
//     const tour = await Tour.findOne({ _id: req.params.id })
//         .populate('reviews')
//         .populate({
//             path: 'guides',
//             select: 'name email',
//         });
//     if (!tour) {
//         throw new AppError(
//             `No document with such ID of ${req.params.id} found!`,
//             404
//         );
//     }
//     res.status(200).json({
//         status: 'success',
//         data: {
//             tour,
//         },
//     });
// });

exports.updateTour = handlerFactory.updateDocument(Tour);
// exports.updateTour = catchAsyncError(async (req, res) => {
//     const tour = await Tour.findOneAndUpdate({ _id: req.params.id }, req.body, {
//         new: true,
//         runValidators: true,
//     });
//     if (!tour) {
//         throw new AppError(
//             `No document with such ID of ${req.params.id} found!`
//         );
//     }
//     res.status(200).json({
//         status: 'success',
//         data: {
//             tour,
//         },
//     });
// });

exports.deleteTour = handlerFactory.deleteDocument(Tour);
// exports.deleteTour = catchAsyncError(async (req, res) => {
//     const tour = await Tour.findOneAndDelete({ _id: req.params.id });
//     if (!tour) {
//         throw new AppError(
//             `No document with such ID of ${req.params.id} found!`
//         );
//     }
//     res.status(200).json({
//         status: 'success',
//         data: {
//             tour,
//         },
//     });
// });

exports.setQueryStringForTopFive = (req, res, next) => {
    req.query.limit = 5;
    req.query.sort = `-ratingsAverage`;
    next();
};

exports.getTourStats = catchAsyncError(async (req, res) => {
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } },
        },
        {
            $group: {
                _id: null, // difficulty
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                maxPrice: { $max: '$price' },
                minPrice: { $min: '$price' },
            },
        },
    ]);
    res.status(200).json({
        status: 'success',
        data: {
            stats,
        },
    });
});

exports.getMonthlyPlan = catchAsyncError(async (req, res) => {
    const year = +req.params.year;
    const plan = await Tour.aggregate([
        {
            $unwind: `$startDates`,
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`),
                },
            },
        },
        {
            $group: {
                _id: { $month: `$startDates` },
                numOfToursThisMonth: { $sum: 1 },
                tours: { $push: `$name` },
            },
        },
        {
            $addFields: {
                month: `$_id`,
            },
        },
        {
            $project: {
                _id: 0, // 0 - will not show up, 1 - will show up
            },
        },
        {
            $sort: { month: 1 },
        },
        {
            $limit: 12,
        },
    ]);
    res.status(200).json({
        status: 'success',
        data: {
            plan,
        },
    });
});

// ('/tours-within/:distance/center/:latlng/unit/:unit');
exports.getToursWithin = catchAsyncError(async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    if (!lat || !lng) {
        next(
            new AppError(
                'Please, provide latitude and longitude in the format lat,lng.',
                400
            )
        );
    }

    // need to calculate radiants = distance / earth radius
    const radius = unit === 'mi' ? +distance / 3963.2 : +distance / 6378.1;
    const tours = await Tour.find({
        // [lng, lat],
        startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
    });
    // ! In order to make GeiJSON work we need to use idnexing on the field where the GeoJSON data is stored
    res.status(201).json({
        status: 'success',
        results: tours.length,
        data: {
            tours,
        },
    });
});

exports.getDistances = catchAsyncError(async (req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    if (!lat || !lng) {
        next(
            new AppError(
                'Please, provide latitude and longitude in the format lat,lng.',
                400
            )
        );
    }

    const multiplier = unit === 'km' ? 0.001 : 0.000621371;

    const distances = await Tour.aggregate([
        {
            // For goespecial there is only one stage of aggregation
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [+lng, +lat],
                },
                distanceField: 'distance',
                distanceMultiplier: 0.001,
            },
        },
        {
            $project: {
                distance: 1,
                name: 1,
            },
        },
    ]);

    res.status(201).json({
        status: 'success',
        result: distances.length,
        data: {
            distances,
        },
    });
});

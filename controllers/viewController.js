const Tour = require('../models/tourModel.js');
const catchAssyncErr = require('../utils/catchAssyncErr');

exports.getMainPage = (req, res) => {
    console.log(`Hitting the main page!`);
    res.status(200).render('base', {
        tour: 'The Forest Hiker',
        title: 'Home Page',
    });
};

exports.getOverview = catchAssyncErr(async (req, res, next) => {
    const tours = await Tour.find();

    res.status(200).render('overview', {
        title: 'All tours',
        tours,
    });
});

exports.getTourPage = catchAssyncErr(async (req, res, next) => {
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        fields: 'review rating user',
    });
    res.status(200).render('tour', {
        tour,
        title: tour.name,
    });
});

exports.logInPage = catchAssyncErr(async (req, res, next) => {
    res.status(201).render('logInPage', {
        title: 'Log into your account',
    });
});

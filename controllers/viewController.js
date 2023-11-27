const Tour = require('../models/tourModel.js');
const catchAssyncErr = require('../utils/catchAssyncErr');
const AppError = require('../utils/appError.js');

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

    if (!tour) {
        throw new AppError(
            `There is no such tour with the slug of: ${req.params.slug}`,
            404
        );
    }

    res.status(200).render('tour', {
        tour,
        title: tour.name,
    });
});

exports.logInPage = catchAssyncErr(async (req, res, next) => {
    if (res.locals.user) {
        res.status(403).render('error', {
            title: 'Access denied!',
            msg: 'You are already logged in!',
        });
    }
    res.status(201).render('logInPage', {
        title: 'Log into your account',
    });
});

exports.getMe = catchAssyncErr(async (req, res, next) => {
    res.status(201).render('account', {
        title: 'Edit your profile',
    });
});

// exports.notLoggedInError = (req, res, next) => {
//     if (!res.locals.user) {
//         res.status(403).render('error', {
//             title: 'Access denied!',
//             msg: 'Only logged in users have access to this page!',
//         });
//     }
//     next();
// };

// THIS WOULD WORK WITH TRADITIONAL FORM
exports.updateUserData = catchAssyncErr(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            name: req.body.name,
            email: req.body.email,
        },
        {
            new: true,
            runValidators: true,
        }
    );

    res.status(200).render('account', {
        title: 'Your account',
        user: updatedUser,
    });
});

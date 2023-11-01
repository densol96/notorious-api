const { promisify } = require(`util`);
const jwt = require(`jsonwebtoken`);
const bcrypt = require('bcryptjs');
const User = require(`./../models/userModel`);
const catchAsyncError = require(`./../utils/catchAssyncErr`);
const AppError = require('../utils/appError');

const signToken = (id) => {
    console.log(process.env.JWT_EXPIRES_IN);
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

exports.signUp = catchAsyncError(async (req, res) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt,
        role: req.body.role,
    });

    const token = signToken(newUser._id);

    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser,
        },
    });
});

exports.logIn = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new AppError('Please provide email and password', 400);
    }
    // Check if user exists && password is correct
    const user = await User.findOne({ email: email }).select('+password'); // Cause in the model for password select is false => therefore need to select separately with explicit +
    if (!user || !(await user.correctPassword(password, user.password))) {
        next(new AppError(`Incorrect email or password`, 401));
    }
    // If everything okey, send token to client
    const token = signToken(user._id);
    res.status(201).json({
        status: 'success',
        token,
    });
});

exports.protect = catchAsyncError(async (req, res, next) => {
    // 1) Getting token and check if it's there
    let token;
    if (req.headers?.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(` `)[1];
    }

    if (!token) {
        throw new AppError(
            'You are not logged in! Please log in to get access!',
            401
        );
    }

    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const user = await User.findOne({ _id: decoded.id });

    if (!user) {
        throw new AppError('This user no longer exists!', 401);
    }

    // 4) Check if user changed password after token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
        throw new AppError(
            `User recently changed password! Please try to log in again!`,
            401
        );
    }
    // Grant access to protected route
    req.user = user;
    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // roles ["admin", "lead-guide"]
        if (!roles.includes(req.user.role)) {
            throw new AppError(
                'You do not have permission to perform this action!',
                403
            );
        }
        next();
    };
};
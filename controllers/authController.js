const { promisify } = require(`util`);
const jwt = require(`jsonwebtoken`);
const bcrypt = require('bcryptjs');
const User = require(`./../models/userModel`);
const catchAsyncError = require(`./../utils/catchAssyncErr`);
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
const crypto = require(`crypto`);

const signToken = (id) => {
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
        // passwordChangedAt: req.body.passwordChangedAt,
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
        throw new AppError(`Incorrect email or password`, 401);
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

// send a reset-token to user's email
exports.forgotPassword = catchAsyncError(async (req, res, next) => {
    // 1) Get the user based on POSTed email
    const email = req.body.email;
    const user = await User.findOne({ email });
    if (!user) {
        throw new AppError('There is no user with such email!', 404);
    }
    // 2) Genearte the reset token (check the instance method in the User Model)
    const resetToken = await user.createPasswordResetToken();
    // we have validators in place in the Schema that run for saves
    await user.save({ validateBeforeSave: false });

    // 3) Send it to user's email
    const resetURL = `${req.protocol}://${req.get(
        'host'
    )}/api/v1/users/reset-password/${resetToken}`;

    const message = `Hey, ${user.name}! Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\n
    If you didn't forget your password, please ignore this email!`;

    try {
        await sendEmail({
            email,
            subject: 'Your password reset token (valid for 10 min)',
            message,
        });
    } catch (err) {
        user.createPasswordResetToken = undefined;
        user.paswordResetExpiry = undefined;
        await user.save({ validateBeforeSave: false });
        throw new AppError(
            'There was an error send the email Try again later!',
            500
        );
    }

    res.status(200).json({
        status: 'success',
        message: 'Token sent to email!',
    });
});

exports.resetPassword = catchAsyncError(async (req, res, next) => {
    // 1) Get user based on the token
    const hashedToken = crypto
        .createHash(`sha256`)
        .update(req.params.token)
        .digest(`hex`);

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });
    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
        throw new AppError('Token is invalid or has expired!', 400);
    }

    // 3) Update changedPasswordAt property for the user
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    await user.save();
    // 4) Log the user in, send JWT
    const token = signToken(user._id);

    res.status(200).json({
        status: 'success',
        token,
    });
});

exports.updatePassword = catchAsyncError(async (req, res, next) => {
    // 1) Get user from the collection
    // 2) Check is the old password is correct
    // 3) If so, update the password
    // 4) Log user in, send JWT
});

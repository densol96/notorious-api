const { promisify } = require(`util`);
const jwt = require(`jsonwebtoken`);
const bcrypt = require('bcryptjs');
const User = require(`./../models/userModel`);
const catchAsyncError = require(`./../utils/catchAssyncErr`);
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
const crypto = require(`crypto`);
const { use } = require('../router/userRouter');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

const createSendToken = (user, statusCode, res, message) => {
    const token = signToken(user._id);

    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true, // browser unable to modify/access the cookie, only auto store and send with every request
    };
    if (process.env.NODE_ENV.trim() === 'production') {
        cookieOptions.secure = true; // will be sent on HTTPS connection only
    }
    res.cookie(`jwt`, token, cookieOptions);

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        },
        message,
    });
};

exports.signUp = catchAsyncError(async (req, res) => {
    // create the User
    const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
    });

    // User.emailConfirmed is false by default. Ask the user to confirm the email before they can get the JWT

    const emailConfirmationToken = await user.createEmailConfirmationToken();
    await user.save({ validateBeforeSave: false });

    const emailConfirmURL = `${req.protocol}://${req.get(
        'host'
    )}/api/v1/users/email-confirmation/${emailConfirmationToken}`;

    const message = `Welcome to our app, ${user.name}! In order to confirm your email and activate ypur account, please press the link: ${emailConfirmURL} (should be a GET request for this route)`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'NATOURS API: Please, confirm your email!',
            message,
        });
    } catch (err) {
        await User.findOneAndDelete({ email: user.email });
        throw new AppError(
            'Registration is currently unavailable! Please get in touch with the administrator or try again later!',
            500
        );
    }

    res.status(201).json({
        status: 'success',
        message:
            'Account has been created, but you need to confirm your email first! Please, check your inbox!',
    });
});

exports.confirmEmail = catchAsyncError(async (req, res, next) => {
    const hashedConfirmToken = crypto
        .createHash(`sha256`)
        .update(req.params.token)
        .digest(`hex`);

    const user = await User.findOne({
        emailConfirmationToken: hashedConfirmToken,
    });

    user.emailConfirmed = true;
    user.emailConfirmationToken = undefined;
    await user.save({ validateBeforeSave: false });

    const message = `Your email has been confirmed! You can now log in at ${
        req.protocol
    }://${req.get('host')}/api/v1/users/login`;

    res.status(201).json({
        status: 'success',
        message,
        data: {
            user: {
                email: user.email,
                name: user.name,
                emailConfirmed: user.emailConfirmed,
            },
        },
    });
});

exports.logIn = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new AppError('Please provide email and password', 400);
    }
    // Check if user exists && password is correct
    const user = await User.findOne({ email: email }).select(
        '+password emailConfirmed'
    ); // Cause in the model for password select is false => therefore need to select separately with explicit +
    if (!user) {
        throw new AppError(`No user with such email!`, 401);
    }

    console.log('I am here!');
    console.log(user);
    if (!user.emailConfirmed) {
        throw new AppError(
            'Email has not been confirmed yet! Please check your inbox!',
            403
        );
    }

    if (user.accountLocked()) {
        throw new AppError(
            'Too many wrong attempts to log in! Your account has been locked! Try again later!',
            403
        );
    }

    if (!(await user.correctPassword(password, user.password))) {
        user.loginAttempts += 1;
        const updates = {
            loginAttempts: user.loginAttempts,
        };
        if (user.loginAttempts >= +process.env.WRONG_PASSWORD_LIMIT) {
            updates.tempBan = new Date(
                Date.now() + +process.env.WRONG_PASSWORD_BAN_MIN * 60 * 1000
            );
            updates.loginAttempts = 0;
        }
        await User.findOneAndUpdate({ email }, updates);

        throw new AppError(
            `Incorrect password! You have ${
                +process.env.WRONG_PASSWORD_LIMIT - user.loginAttempts
            } attempts left! `,
            401
        );
    }

    // If everything okey, send token to client
    createSendToken(user, 201, res);
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
    createSendToken(user, 201, res);
});

exports.updatePassword = catchAsyncError(async (req, res, next) => {
    // 1) Get user from the collection
    const user = await User.findOne({ _id: req.user.id }).select('+password');

    if (!user) throw new AppError(`No user with this email found!`, 404);
    // 2) Check is the old password is correct
    if (!(await user.correctPassword(req.body.oldPassword, user.password)))
        throw new AppError(`Wrong password!`, 400);
    // 3) If so, update the password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    // 4) Log user in, send JWT
    createSendToken(user, 201, res);
});

const mongoose = require(`mongoose`);
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require(`crypto`);

// name, email, photo, password, passwordCOnfirm
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A user must have a name'],
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'A user must have an email'],
        unique: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: validator.isEmail,
            message: 'You must provide a valid email!',
        },
    },
    photo: {
        type: String,
        trim: true,
        default: 'default.jpg',
    },
    password: {
        type: String,
        required: [true, 'A user must have a password'],
        minlength: [8, 'A password must have at least 8 characters!'],
        select: false, // will not show up in output queries from DB
    },
    passwordConfirm: {
        type: String,
        required: [true, 'You must confirm your password!'],
        validate: {
            // THIS ONLY WORKS ON CREATE / SAVE
            validator: function (val) {
                return this.password === val;
            },
            message: 'You must provide a valid password!',
        },
    },
    passwordChangedAt: {
        type: Date,
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user',
    },
    passwordResetToken: String,
    passwordResetExpiry: Date,
    active: {
        type: Boolean,
        default: true,
        select: false,
    },
    loginAttempts: {
        type: Number,
        default: 0,
    },
    tempBan: {
        type: Date,
    },
    emailConfirmationToken: String,
    emailConfirmed: {
        type: Boolean,
        default: false,
    },
});

userSchema.set('collection', 'users');

// On creating a new document
userSchema.pre('save', async function (next) {
    // Only run this function if password was actually modified
    if (!this.isModified('password')) return next();

    // Hash the password with CPU cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    // will work cause type: String in Schema is used for user input validation
    this.passwordConfirm = undefined;
    next();
});

// On resetting the password
userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || this.isNew) return next();
    // Just in case token gets issued after the password changed at
    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userSchema.pre(/^find/, function (next) {
    // query middleware --- this = current query
    this.find({ active: { $ne: false } });
    this.select('-__v');
    next();
});

// Is an instance method => will be available on any document
userSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
) {
    console.log(candidatePassword);
    console.log(userPassword);
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (timestampJWT) {
    if (this.passwordChangedAt) {
        const passwordChangedTimestampInMS =
            this.passwordChangedAt.getTime() / 1000;
        // False mean not changed
        return passwordChangedTimestampInMS > timestampJWT;
    }
    return false;
};

// Will use this function to create a random token using weaker encryption, such as SHA256. Make sure to .call .bind this function to make this a current object used.
// Examples for usage ---> password reset token, email confirmation, 2-
const createRandomToken = function (encryptedField) {
    const randomToken = crypto.randomBytes(32).toString(`hex`);
    const encryptedRandomToken = crypto
        .createHash(`sha256`)
        .update(randomToken)
        .digest(`hex`);
    this[encryptedField] = encryptedRandomToken;
    return randomToken;
};

userSchema.methods.createPasswordResetToken = async function () {
    // will act as a reset password
    // this will be only valid for a short time and then the supposed user will change the password => we can use a weaker alghoritmn
    const resetToken = createRandomToken.call(this, 'passwordResetToken');
    // make it valid for 10 minutes
    this.passwordResetExpiry = Date.now() + 10 * 60 * 1000;
    return resetToken;
};

userSchema.methods.createEmailConfirmationToken = async function () {
    const emailConfirmationToken = createRandomToken.call(
        this,
        'emailConfirmationToken'
    );
    return emailConfirmationToken;
};

userSchema.methods.accountLocked = function () {
    if (this.tempBan) {
        return Date.now() < this.tempBan;
    }
    return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;

const mongoose = require(`mongoose`);
const validator = require('validator');
const bcrypt = require('bcryptjs');

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
        type: 'String',
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user',
    },
});

userSchema.set('collection', 'users');

userSchema.pre('save', async function (next) {
    // Only run this function if password was actually modified
    if (!this.isModified('password')) return next();
    // Hash the password with CPU cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    // will work cause type: String in Schema is used for user input validation
    this.passwordConfirm = undefined;

    next();
});

// Is an instance method => will be available on any document
userSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
) {
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

const User = mongoose.model('User', userSchema);

module.exports = User;
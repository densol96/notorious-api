const User = require(`./../models/userModel`);
const catchAsyncError = require(`./../utils/catchAssyncErr`);
const AppError = require('../utils/appError');
const handlerFactory = require('./handlerFactory.js');

const sharp = require('sharp');
const multer = require('multer');

// const multerStorage = multer.diskStorage({
//     // request, req.file, callback (sort of like next in express)
//     destination: (req, file, cb) => {
//         cb(null, 'public/img/users');
//     },
//     filename: (req, file, cb) => {
//         // user-id-timestamp.jpeg  --> this will guarantee there are not dupliocate names
//         const extension = file.mimetype.split('/')[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${extension}`);
//     },
// });
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(
            new AppError('Not an image! Please upload an image only!', 400),
            false
        );
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
});

exports.uploadUserPhotoMW = upload.single('photo');

exports.resizeImage = async (req, res, next) => {
    if (req.file) {
        req.file.filename = `user-${req.user._id.toString()}-${Date.now()}.jpeg`;
        await sharp(req.file.buffer)
            .resize(500, 500)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`public/img/users/${req.file.filename}`);
    }
    next();
};

const filterObj = (obj, ...allowedFields) => {
    const filtered = {};
    Object.keys(obj).forEach((key) => {
        if (allowedFields.includes(key)) {
            filtered[key] = obj[key];
        }
    });
    return filtered;
};

exports.getAllUsers = catchAsyncError(async (req, res, next) => {
    const users = await User.find();

    // SEND RESPONSE
    res.status(201).json({
        status: 'success',
        results: users.length,
        data: {
            users,
        },
    });
});

exports.updateMe = catchAsyncError(async (req, res, next) => {
    // 1) Create an error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
        throw new AppError(
            "This route is not for password updates! Please use '/change-my-password' route to change your password!",
            400
        );
    }
    // 2) Filtered out unwanted fields f.e. role("admin")
    const filteredUpdates = filterObj(req.body, 'name', 'email');

    // check if the avatar was updated!
    if (req.file) {
        filteredUpdates.photo = req.file.filename;
    }

    //3) Update user document
    const updatedUser = await User.findOneAndUpdate(
        { _id: req.user.id },
        filteredUpdates,
        {
            new: true, // return an updated user
            runValidators: true,
        }
    );

    res.status(201).json({
        status: 'success',
        data: {
            user: updatedUser,
        },
    });
});

// De-activate
exports.deleteMe = catchAsyncError(async (req, res, next) => {
    await User.findOneAndUpdate({ _id: req.user.id }, { active: false });

    res.status(204).json({
        status: 'success',
        data: null,
        message: 'Your account has been deleted successfully!',
    });
});

exports.getMe = (req, res, next) => {
    req.params.id = req.user._id;
    next();
};

// Real delete for users with permission of "admin"
exports.deleteUser = handlerFactory.deleteDocument(User);

// Not for updating the password
exports.updateUser = handlerFactory.updateDocument(User);
exports.getUser = handlerFactory.getDocument(User);
exports.getAllUserS = handlerFactory.getAllDocuments(User);

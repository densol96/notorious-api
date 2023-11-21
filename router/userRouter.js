const express = require('express');
const {
    getAllUsers,
    createUser,
    getUser,
    updateUser,
    deleteUser,
    updateMe,
    deleteMe,
    getMe,
} = require('../controllers/userController');

const {
    protect,
    signUp,
    confirmEmail,
    logIn,
    forgotPassword,
    resetPassword,
    updatePassword,
    restrictTo,
} = require('./../controllers/authController');

const router = express.Router();

router.post(`/signup`, signUp);
router.get('/email-confirmation/:token', confirmEmail);
router.post(`/login`, logIn);
router.post(`/forgot-password`, forgotPassword);
router.patch(`/reset-password/:token`, resetPassword);

// From this point on, all router require protect middleware (user needs to be logged in), so let's use shared middleware
router.use(protect);
router.patch(`/change-my-password`, updatePassword);
router.patch(`/update-me`, updateMe);
router.delete(`/delete-me`, deleteMe);
router.get(`/get-me`, getMe, getUser);
// prettier-ignore
router.route('/')
    .get(getAllUsers);

// FROM now on only admin can make following requests
router.use(restrictTo('admin'));
// prettier-ignore
router
    .route('/:id')
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser);

module.exports = router;

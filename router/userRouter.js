const express = require('express');
const {
    getAllUsers,
    createUser,
    getUser,
    updateUser,
    deleteUser,
    updateMe,
    deleteMe,
} = require('../controllers/userController');

const {
    protect,
    signUp,
    confirmEmail,
    logIn,
    forgotPassword,
    resetPassword,
    updatePassword,
} = require('./../controllers/authController');

const router = express.Router();

router.post(`/signup`, signUp);
router.get('/email-confirmation/:token', confirmEmail);
router.post(`/login`, logIn);
router.post(`/forgot-password`, forgotPassword);
router.patch(`/reset-password/:token`, resetPassword);
router.patch(`/change-my-password`, protect, updatePassword);
router.patch(`/update-me`, protect, updateMe);
router.delete(`/delete-me`, protect, deleteMe);
// prettier-ignore
router.route('/')
    .get(getAllUsers)
// .post(createUser);
// prettier-ignore
router.route('/:id')
// .get(getUser)
// .patch(updateUser)
// .delete(deleteUser);

module.exports = router;

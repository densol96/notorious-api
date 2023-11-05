const express = require('express');
const {
    getAllUsers,
    createUser,
    getUser,
    updateUser,
    deleteUser,
} = require('../controllers/userController');
const {
    signUp,
    logIn,
    forgotPassword,
    resetPassword,
} = require('./../controllers/authController');

const router = express.Router();

router.post(`/signup`, signUp);
router.post(`/login`, logIn);
router.post(`/forgot-password`, forgotPassword);
router.patch(`/reset-password/:token`, resetPassword);
// prettier-ignore
router.route('/')
    .get(getAllUsers)
    .post(createUser);
// prettier-ignore
router.route('/:id')
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser);

module.exports = router;

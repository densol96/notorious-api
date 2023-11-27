const express = require('express');
const router = express.Router();

const {
    getMainPage,
    getOverview,
    getTourPage,
    logInPage,
    getMe,
    notLoggedInError,
    updateUserData,
} = require('../controllers/viewController');

const {
    protect,
    isLoggedIn,
    logOut,
} = require('../controllers/authController.js');

router.get('/', isLoggedIn, getMainPage);
router.get('/overview', isLoggedIn, getOverview);
router.get('/tours/:slug', isLoggedIn, getTourPage);
router.get('/login', isLoggedIn, logInPage);
router.get('/me', protect, getMe);
router.post('/submit-user-data', protect, updateUserData);

module.exports = router;

const express = require('express');
const router = express.Router();

const {
    getMainPage,
    getOverview,
    getTourPage,
    logInPage,
} = require('../controllers/viewController');
const { protect, isLoggedIn } = require('../controllers/authController.js');

router.use(isLoggedIn);

router.get('/', getMainPage);
router.get('/overview', getOverview);
router.get('/tours/:slug', getTourPage);
router.get('/login', logInPage);

module.exports = router;

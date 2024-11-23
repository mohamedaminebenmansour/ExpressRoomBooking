const express = require('express');
const viewsController = require('./../Controllers/viewsController');
const authController = require('./../Controllers/authController');
const router = express.Router();

router.get('/', authController.isLoggedIn, viewsController.getOverviewRoom);

router.get('/signup', authController.isLoggedIn, viewsController.getLoginSignUp);
router.get('/forgottenpassword', authController.isLoggedIn, viewsController.getForgotPasswrd);
router.get('/', authController.isLoggedIn, viewsController.getOverviewRoom);
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/room/:slug', authController.isLoggedIn, viewsController.getRoom);
router.get('/reset/:token', authController.isLoggedIn, viewsController.resetPasswrd);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);

router.get('/me', authController.protect, viewsController.getAccount)
router.get('/managerooms', authController.protect, viewsController.roomsManagement)
router.get('/manageusers', authController.protect, viewsController.usersManagement)
router.get('/addroom', authController.protect, viewsController.addRoom)
router.get('/updateroom/:roomId', authController.protect, viewsController.updateRoom)

router.get('/bookroom/:roomId', authController.protect, viewsController.bookRoom)
router.get('/mybooking', authController.protect, viewsController.myBooking)
router.get('/updatebook/:bookId', authController.protect, viewsController.updateBook)


/*
router.get(
    '/my-tours',
    bookingController.createBookingCheckout,
    authController.protect,
    viewsController.getMyTours
);
//router.get('/', authController.isLoggedIn, viewsController.getOverview);
*/
router.post(
    '/submit-user-data',
    authController.protect,
    viewsController.updateUserData
);

router.post(
    '/submit-user-passwrd',
    authController.protect,
    viewsController.updateUserData
);



module.exports = router;
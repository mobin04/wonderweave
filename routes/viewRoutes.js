const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

router.get(
  '/',
  // bookingController.createBookingCheckout,
  authController.isUserLoggedIn,
  viewsController.getOverview,
);

router.get(
  '/tour/:slug',
  authController.isUserLoggedIn,
  authController.protect,
  viewsController.getTour,
);

router.get('/signup', viewsController.getSignUpForm);
router.get('/email-verify/:id', viewsController.emailVerificationPage);

router.get('/book-now/:id', authController.protect,bookingController.isBooked, viewsController.bookNow);
router.get('/success-booking', authController.protect, viewsController.successBooking);

router.get('/add-review/:tourId', authController.protect, viewsController.manageReview);
router.get('/update-review/:tourId', authController.protect, viewsController.manageReview);
router.get('/get-my-reviews', authController.protect, viewsController.getReviews);

router.get('/manage-tours', authController.protect, authController.restrictTo('admin'), viewsController.getTours)
router.get('/create-tour', authController.protect, authController.restrictTo('admin', 'lead-guide'), viewsController.createTour)
router.get('/edit-tour/:tourId', authController.protect, authController.restrictTo('admin', 'lead-guide'), viewsController.editTour)

router.get('/manage-users', authController.protect, authController.restrictTo('admin'), viewsController.manageUsers)

router.get('/manage-reviews', authController.protect, authController.restrictTo('admin', 'lead-guide'), viewsController.adminManageReview)

router.get(
  '/login',
  authController.isUserLoggedIn,
  viewsController.getLoginForm,
);

router.get('/me', authController.protect, viewsController.getAccount);
router.get('/my-tours', authController.protect, viewsController.getMyTours);


// router.post( // This for URL-Encoded route
//   '/submit-user-data',
//   authController.protect,
//   viewsController.updateUserData,
// );

module.exports = router;

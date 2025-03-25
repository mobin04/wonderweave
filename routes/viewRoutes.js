const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

router.get(
  '/',
  authController.isUserLoggedIn,
  viewsController.getOverview,
);

router.get(
  '/login',
  authController.isUserLoggedIn,
  viewsController.getLoginForm,
);

router.get('/signup', viewsController.getSignUpForm);
router.get('/email-verify/:id', viewsController.emailVerificationPage);

router.get(
  '/tour/:slug',
  authController.isUserLoggedIn,
  authController.protect,
  viewsController.getTour,
);

router.use(authController.protect);

router.get(
  '/book-now/:id',
  bookingController.isBooked,
  viewsController.bookNow,
);
router.get('/success-booking', viewsController.successBooking);
router.get('/add-review/:tourId', viewsController.manageReview);
router.get('/update-review/:tourId', viewsController.manageReview);
router.get('/get-my-reviews', viewsController.getReviews);
router.get('/me', viewsController.getAccount);
router.get('/my-tours', viewsController.getMyTours);

router.get(
  '/manage-users',
  authController.restrictTo('admin'),
  viewsController.manageUsers,
);

router.use(authController.restrictTo('admin', 'lead-guide'));

router.get('/manage-tours', viewsController.getTours);
router.get('/create-tour', viewsController.createTour);
router.get('/edit-tour/:tourId', viewsController.editTour);
router.get('/manage-reviews', viewsController.adminManageReview);
router.get('/manage-bookings', viewsController.manageBookings);

// router.post( // This for URL-Encoded route
//   '/submit-user-data',
//   authController.protect,
//   viewsController.updateUserData,
// );

module.exports = router;

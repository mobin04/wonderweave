const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

router.use(viewsController.alerts)

// Public Routes (No Authentication Required)
router.get('/', 
  // bookingController.createBookingCheckout, // Commented out as per original code
  authController.isUserLoggedIn, 
  viewsController.getOverview
);

router.get('/login', 
  authController.isUserLoggedIn, 
  viewsController.getLoginForm
);

router.get('/signup', viewsController.getSignUpForm);
router.get('/email-verify/:id', viewsController.emailVerificationPage);

// Authentication Required Routes
router.get('/me', 
  authController.protect, 
  viewsController.getAccount
);

// Tour-Related Routes
router.get('/tour/:slug', 
  authController.isUserLoggedIn,
  authController.protect, 
  viewsController.getTour
);

router.get('/my-tours', 
  authController.protect, 
  viewsController.getMyTours
);

// Booking-Related Routes
router.get('/book-now/:id', 
  authController.protect,
  bookingController.isBooked, 
  viewsController.bookNow
);

// router.get('/success-booking', 
//   authController.protect, 
//   viewsController.successBooking
// );

// Review-Related Routes
router.get('/add-review/:tourId', 
  authController.protect, 
  viewsController.manageReview
);

router.get('/update-review/:tourId', 
  authController.protect, 
  viewsController.manageReview
);

router.get('/get-my-reviews', 
  authController.protect, 
  viewsController.getReviews
);

// Admin and Lead Guide Routes
router.get('/manage-tours', 
  authController.protect, 
  authController.restrictTo('admin'), 
  viewsController.getTours
);

router.get('/create-tour', 
  authController.protect, 
  authController.restrictTo('admin', 'lead-guide'), 
  viewsController.createTour
);

router.get('/edit-tour/:tourId', 
  authController.protect, 
  authController.restrictTo('admin', 'lead-guide'), 
  viewsController.editTour
);

router.get('/manage-users', 
  authController.protect, 
  authController.restrictTo('admin'), 
  viewsController.manageUsers
);

router.get('/manage-reviews', 
  authController.protect, 
  authController.restrictTo('admin', 'lead-guide'), 
  viewsController.adminManageReview
);

router.get('/manage-bookings', 
  authController.protect,
  authController.restrictTo('admin', 'lead-guide'),
  viewsController.manageBookings
)

// Commented out URL-Encoded route as per original code
// router.post('/submit-user-data', 
//   authController.protect,
//   viewsController.updateUserData
// );

module.exports = router;
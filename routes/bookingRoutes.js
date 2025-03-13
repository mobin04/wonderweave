const express = require('express');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router.get('/tours/:id/bookings', bookingController.getBookingsByTour);
router.get('/users/:id/bookings', bookingController.getBookingsByUser);

router.get(
  '/checkout-session/:tourID',
  authController.protect,
  bookingController.getCheckoutSession,
);

// router.use(authController.restrictTo('admin', 'lead-guide'));

router
  .route('/')
  .get(authController.restrictTo('admin', 'lead-guide') ,bookingController.getAllBookings)
  .post(
    bookingController.checkAvailability,
    // authController.restrictTo('admin', 'lead-guide', 'user'),
    bookingController.createBooking,
  );

router
  .route('/:id')
  .get(authController.restrictTo('admin', 'lead-guide') ,bookingController.getBooking)
  .patch(authController.restrictTo('admin', 'lead-guide') ,bookingController.updateBooking)
  .delete(authController.restrictTo('admin', 'lead-guide') ,bookingController.deleteBooking);

module.exports = router;

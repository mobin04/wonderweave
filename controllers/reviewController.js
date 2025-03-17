const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const Booking = require('../models/bookingModel');
const AppError = require('../utils/appError');
// const catchAsync = require('../utils/catchAsync');

exports.setTourUserIds = (req, res, next) => {
  // ALLOW NESTED ROUTES
  // if req.body don't have tour, then assign it from req.param.userId
  if (!req.body.tour) req.body.tour = req.params.tourId;
  // if req.body don't have user, then assign it from req.param.userId
  if (!req.body.user) req.body.user = req.user.id; // req.user came from protect middleware
  next();
}; //Middleware function for createReview controller below.(call this in review router)

// Middleware to check if the user has booked the tour
exports.checkIfBooked = catchAsync(async (req, res, next) => {
  const { tourId } = req.params;
  const user = req.user.id;

  const bookedTour = await Booking.findOne({
    tour: tourId,
    user,
  });

  if (!bookedTour) {
    return next(
      new AppError('You can only review tours that you have booked.', 403),
    );
  }

  next();
});

// Factory function
exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);

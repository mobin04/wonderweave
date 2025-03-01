const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');
// const catchAsync = require('../utils/catchAsync');


exports.setTourUserIds = (req, res, next) => {
  // ALLOW NESTED ROUTES
  // if req.body don't have tour, then assign it from req.param.userId
  if (!req.body.tour) req.body.tour = req.params.tourId;
  // if req.body don't have user, then assign it from req.param.userId
  if (!req.body.user) req.body.user = req.user.id; // req.user came from protect middleware
  next();
}; //Middleware function for createReview controller below.(call this in review router)

// Factory function
exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review); 

// review / rating / createdAt / ref to tour / ref to user
const mongoose = require('mongoose');
const Tour = require('./tourModel');
const AppError = require('../utils/appError');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      require: [true, 'Review cannot be empty!'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      require: [true, 'Review must belong to a tour!'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      require: [true, 'Review must belong to a user!'],
    },
  },
  {
    // USED FOR VIRTUAL PROPERTIES
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

//Compound Index: Ensure one review per user per tour (Database level)
//If a user tries to submit another review for the same tour, MongoDB will reject it
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

//If a user tries to submit another review for the same tour (error handling)
reviewSchema.pre('save', async function (next) {
  // 'this' refers to the document being saved (the review document).
  // this.constructor refers to the Model (e.g., the Review model).

  // Query the database to find if a review already exists for this tour and user.
  const existingUser = await this.constructor.findOne({
    tour: this.tour,
    user: this.user,
  });
  if (existingUser) {
    return next(new AppError('You have already reviewed this tour!', 400));
  }
  next();
});

//ADDING .POPULATE() METHOD IN QUERY MIDDLEWARE
reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name', // No need to populate the tour anymore in this case
  // }).populate({
  //   path: 'user',
  //   select: 'name photo'
  // })

  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

// IMPLEMETING CALUCLATE AVERAGE RATINGS.(.static)
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  //Aggregation ('this' now point to the model bcz of .statics method)
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },

    {
      $group: {
        _id: '$tour', // Groups by tour ID
        nRating: { $sum: 1 }, // Counts the number of reviews
        avgRating: { $avg: '$rating' }, // Computes the average rating
      },
    },
  ]);
  // console.log(stats);

  // If there are reviews, update the tour
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      //eg:stats[0].nRatings → 3
      //   stats[0].avgRating → 4.0
      ratingsQuantity: stats[0].nRating, // Update total number of ratings
      ratingsAverage: stats[0].avgRating, // Update average rating
    });
  } else {
    // If no reviews remain, reset default rating
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5, // Default rating
    });
  }
};

// CALCULATING AVERAGE RATING AFTER CREATE REVIEW
reviewSchema.post('save', function () {
  //this point to the current review
  //Calling calcAverageRatings
  this.constructor.calcAverageRatings(this.tour); // this.constructor points to the model
});

// CALCULATING AVERAGE RATING AFTER UPDATE OR DELETE REVIEW
reviewSchema.post(/^findOneAnd/, async (doc) => {
  if (doc) {
    // doc is the updated review document.
    await doc.constructor.calcAverageRatings(doc.tour); //doc.tour => tourId from the review
  }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;

const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');

// const validator = require('validator');

//CREATING THE SCHEMA
const tourSchema = new mongoose.Schema(
  {
    //data validators.
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal then 40 character'],
      minlength: [10, 'A tour name must have more or equal then 10 character'],
      // validate: [validator.isAlpha, 'Tour name must only contain characters'], // CUSTOM VALIDATOR LIBRARY
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.7,
      min: [1, 'Rating must be above one 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a name'],
    },
    dates: [
      {
        date: {
          type: Date,
          required: [true, 'A tour must have avaliable date!'],
        },
        participants: {
          type: Number,
          default: 0,
        },
        soldOut: {
          type: Boolean,
          default: false,
        },
      },
    ],
    priceDiscount: {
      type: Number,
      // CUSTOM VALIDATOR
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below the regular price',
      },
    },
    summary: {
      type: String,
      trim: true, // used to remove extra spaces
      required: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    // EMBEDED OBJECT
    startLocation: {
      //GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    // EMBEDDING LOCATIONS ARRAY IN TOUR MODEL
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number], // [longitude, latitude]
        address: String, // Optional: "123 Main St, Paris"
        description: String, // Optional: "Eiffel Tower"
        day: Number, // The day of the tour when visiting this location
      },
    ],
    // EMBEDDING TOUR GUIDES
    guides: [
      {
        type: mongoose.Schema.ObjectId, // ObjectId will reference to the user document
        ref: 'User', // Document name of the stored objectId
      },
    ],
  },
  {
    // SCHEMA OPTIONS
    toJSON: { virtuals: true }, // parsing the virtual to output
    toObject: { virtuals: true }, // data getting outputed as an object
  },
);

//IMPLEMENTING COMPOUND INDEXS FOR FASTER PERFORMANCE
// tourSchema.index({ price: 1 });
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' }); // Add geospatial index for efficient queries

//VIRTUAL PROPERTIES
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// VIRTUAL POPULATE METHOD instread of keeping child IDs
tourSchema.virtual('reviews', {
  ref: 'Review', // The model we want to populate from
  foreignField: 'tour', // The field in Review that refers to Tour
  localField: '_id', // The field in Tour that matches tour field in Review
});

// 1) DOCUMENT MIDDLEWARE: it runs before .save() and .create()
//PRE()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// TOUR GUIDEs MIDDLEWARE (IN EMBEDDING WAY)
// tourSchema.pre('save', async function (next) {
//   //Extract User IDs
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises); // Wait for All Promises to Resolve, and overwrite the guide
//   next();
// });

// TOUR GUIDEs MIDDLEWARE (IN CHILD REFERENCING WAY)

//POST()
//  Runs after save or created the document: post()
/*tourSchema.post('save', (doc, next) => {
  console.log(doc);
  next();
});*/

// 2) QUERY MIDDLEWARE
//PRE()
// This trigger all method which is start with find
// tourSchema.pre('find', function(next){});
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});

// QUERY MIDDLEWARE FOR .POPULATE() METHOD for apply all find querys
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -failedLoginAttempts',
  });
  next();
});

//POST()
// tourSchema.post(/^find/, function (docs, next) {
//   console.log(`Query took ${Date.now() - this.start} milliseconds`);
//   next();
// });

// 3) AGGREGATION MIDDLEWARE
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });

//CREATING THE MODEL
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;

const multer = require('multer');
const sharp = require('sharp');
const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
// // Tour file read here
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`),
// );

const multerStorage = multer.memoryStorage();
// Test the uploaded file is an image (Only upload images)
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image!, Please upload only images.', 400), false);
  }
};

// Initialize Multer
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// If we have  mix we could done like this. (upload.fields([]))
exports.uploadTourImages = upload.fields([
  // it produce req.files
  { name: 'imageCover', maxCount: 1 }, // imageCover field only upload one img
  { name: 'images', maxCount: 3 }, // images field only upload 3 imgs
]);

// if we didn't have this imageCover instread only have one field which accept multiple images or multiple files at the same time we could have done it like this.
// upload.single('image'); it produce req.file
// upload.array('images', 5); it produce req.files

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  if (!req.params.id) {
    const tourName = req.body.name.toLowerCase();
    const formatedName = tourName.split(' ').join('-');
    req.body.imageCover = `tour-${formatedName}-${Date.now()}-cover.jpeg`; // Set a coverImage name
  } else {
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`; // Set a coverImage name
  }

  // 1) Processing the cover image
  await sharp(req.files.imageCover[0].buffer) // Sharp is an image resize tool
    .resize(2000, 1333) //it resize the image to square 500 width and 500 height.
    .toFormat('jpeg') // Format the image to jpeg.
    .jpeg({ quality: 90 }) // Qualilty set to 90%.
    .toFile(`public/img/tours/${req.body.imageCover}`); //path to the file | file Name

  // 2) Images
  req.body.images = [];

  await Promise.all(
    // Await all the promises
    req.files.images.map(async (file, i) => {
      let fileName;

      if (!req.params.id) {
        const tourName = req.body.name.toLowerCase();
        fileName = tourName.split(' ').join('-');
        req.body.name = req.body.name.toLowerCase();
        fileName = `tour-${req.body.name}-${Date.now()}-${i + 1}.jpeg`;
      } else {
        fileName = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      }

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${fileName}`);

      req.body.images.push(fileName);
    }),
  );

  next();
});

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

// ROUTE HANDLERS
exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour); //Factory handler function

/*exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});*/

exports.getTourStats = catchAsync(async (req, res, next) => {
  // AGREGATION PIPELINE
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }, // can use $match multiple times
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
  ]);

  res.status(201).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numToursStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: `$_id` }, // Adding new _id field to document
    },
    {
      $project: {
        _id: 0, // 1-True, 0-False for projection
      },
    },
    {
      $sort: { numToursStarts: -1 }, // 1 for Assending, -1 for Decending for sorting
    },
    {
      $limit: 12,
    },
  ]);

  res.status(201).json({
    status: 'success',
    data: {
      plan,
    },
  });
});

// 'tours-within/:distance/center/:latlng/unit/:unit'
// tours-within/123/center/34.111745,-118.113491/unit/mi
exports.getToursWithIn = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  // Calculate the radius  if it is km or mi
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    return next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng',
        400,
      ),
    );
  }

  const tours = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius], // [longitude, latitude]
      },
    },
  });

  res.status(200).json({
    status: 'success',
    result: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  // Convert distance multiplier based on the unit (miles or kilometers)
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    return next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng',
        400,
      ),
    );
  }

  // Geospatial aggregation using $geoNear
  const distances = await Tour.aggregate([
    {
      // $geoNear always need to be the first stage
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1], // MongoDB expects [longitude, latitude]
        },
        distanceField: 'distance', // Name of the field to store calculated distance
        distanceMultiplier: multiplier, // Converts meters to miles or km
      },
    },
    {
      $project: {
        distance: 1, // Include calculated distance
        name: 1, // Include only the 'name' field in the output
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});


// ADD LEAD-GUIDE OR GUIDE IN TO TOUR
exports.addLeadGuide = catchAsync(async (req, res, next) => {
  const { guideId } = req.body; // Get guide ID from request body
  const { tourId } = req.params; // Get tour ID from URL

  const tour = await Tour.findById(tourId).populate('guides'); // Populate guides to access roles

  if (!tour) {
      return next(new AppError('Tour not found', 404));
  }

  // Check if the new guide is already in the tour
  if (tour.guides.some(guide => guide._id.toString() === guideId)) {
      return next(new AppError('Guide is already assigned!', 400));
  }


  // Add guide to guides array
  tour.guides.push(guideId);
  
  await tour.save();

  res.status(200).json({ 
      status: 'success',
      message: "Lead guide added successfully!",
      tour,
  });
});

// REMOVE LEAD-GUIDE OR GUIDE FROM TOUR
exports.removeGuide = catchAsync(async (req, res, next) => {
  const { guideId } = req.body; // Guide ID from request body
  const { tourId } = req.params; // Tour ID from URL

  // Find the tour
  const tour = await Tour.findById(tourId);

  if (!tour) {
      return next(new AppError('Tour not found', 404));
  }

  // Remove guide from the guides array
  // tour.guides = tour.guides.filter(id => id.toString() !== guideId.toString());
  tour.guides.pull(guideId);
  tour.markModified('guides');
  await tour.save();

  res.status(200).json({
      status: 'success',
      message: 'Guide removed successfully!',
      tour
  });
});


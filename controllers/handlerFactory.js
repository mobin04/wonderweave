const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No Document found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError('No Document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    // This method is much more simple
    // ✅ Parse dates and locations before saving
    if (req.body.dates) {
      req.body.dates = JSON.parse(req.body.dates);
    }
    if (req.body.locations) {
      req.body.locations = JSON.parse(req.body.locations);
    }
    if (req.body.startLocation) {
      req.body.startLocation = JSON.parse(req.body.startLocation);
    }
    if (req.body.startDates) {
      req.body.startDates = JSON.parse(req.body.startDates);
    }
    

    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
    // try {
    //   // create new tour
    //   // const newTour = new Tour({})
    //   // newTour.save();

    // } catch (err) {
    //   res.status(400).json({
    //     status: 'fail',
    //     message: err.message,
    //   });
    // }
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);

    const doc = await query;

    if (!doc) {
      //throw error to global err handler
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    //To Allow nested GET reviews on Tour
    let filter = {}; // Empty object, if there is no tourId (it's a small hack)
    if (req.params.tourId) filter = { tour: req.params.tourId }; // Filtering by tourId if provided

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    // const doc = await features.query.explain();// To get the stats
    const doc = await features.query;

    // SENT RESPONSE
    res.status(200).json({
      success: 'success',
      result: doc.length,
      data: {
        data: doc,
      },
    });
  });

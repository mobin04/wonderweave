const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res) => {
  // 1) Get tour data from collection
  const tours = await Tour.find();

  // 2) Build the template

  // 3) Render that template using Tour data from 1)

  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1)Get the data, for the requested tour (including reviws and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user', //only need this fields to populate
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name!', 404));
  }

  // 2)Build the template

  // 3)Render template using data from 1)

  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

exports.getLoginForm = (req, res, next) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
};

// exports.updateUserData = (req, res) => {
//   // req.data is come from URL-ENCODED from account.pug
//   // console.log('UPDATING USER', req.body);
//   // const updatedUser = await User.findByIdAndUpdate(
//   //   req.user.id,
//   //   {
//   //     name: req.body.name, // the name and email come from the template that assign name.
//   //     email: req.body.email,
//   //   },
//   //   {
//   //     new: true,
//   //     runValidators: true,
//   //   },
//   // );
//   res.status(200).render('account', {
//     title: 'Your account',
//     // user: updatedUser,
//   });
// };

const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Review = require('../models/reviewModel');

const Booking = require('../models/bookingModel');

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

// Booking Controller
exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1) Find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  // 2) Find tours with the returned IDs
  const tourIDs = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } }); //This will return all tours with _id matching any of the provided tour IDs.

  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1) Get the data, for the requested tour (including reviws and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user', //only need this fields to populate
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name!', 404));
  }

  const booking = await Booking.findOne({ tour: tour.id, user: req.user.id });
  const review = await Review.findOne({ tour: tour.id, user: req.user.id });

  // 2)Build the template

  // 3)Render template using data from 1)

  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    booking,
    tour,
    review,
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

exports.getSignUpForm = (req, res) => {
  res.status(200).render('signUp', {
    title: 'Create new account',
  });
};

exports.emailVerificationPage = async (req, res, next) => {
  const newUser = await User.findById(req.params.id);

  if (!newUser) {
    return next(new AppError('No user found', 404));
  }
  const { email } = newUser;

  res.status(200).render('emailVerify', {
    title: 'Verify Your email',
    email,
  });
};

exports.bookNow = async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);

  res.status(200).render('bookingPage', {
    title: 'Book your tour',
    tour,
  });
};

// exports.successBooking = async (req, res, next) => {
//   const { tourId, tourDate, selectedDate } = req.query;

//   res.status(200).render('bookingSuccess', {
//     title: 'Booking Successful',
//     tourId,
//     tourDate,
//     selectedDate,
//   });
// };

exports.manageReview = async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId);

  const review = await Review.findOne({
    tour: req.params.tourId,
    user: req.user.id,
  });

  res.status(200).render('reviewPage', {
    title: 'New Review',
    tour,
    review,
  });
};

exports.getReviews = async (req, res, next) => {
  const reviews = await Review.find({ user: req.user.id }).populate({
    path: 'tour',
  });

  res.status(200).render('allReviews', {
    title: 'Reviews',
    reviews,
  });
};

exports.getTours = async (req, res, next) => {
  const tours = await Tour.find();

  res.status(200).render('TourManageAdmin', {
    title: 'Manage-Tours',
    tours,
  });
};

exports.createTour = (req, res, next) => {
  res.status(200).render('createTourForm', {
    title: 'Create Tour',
  });
};

exports.editTour = async (req, res, next) => {
  const { tourId } = req.params;
  const tour = await Tour.findById(tourId);

  res.status(200).render('createTourForm', {
    title: 'Edit Tour',
    tour,
  });
};

exports.manageUsers = async (req, res, next) => {
  try {
    // Fetch tours with guide details populated
    const tours = await Tour.find().populate('guides');
    const users = await User.find().select('+active');

    // Create a map of guides and their tours
    const guidesMap = {};

    tours.forEach((tour) => {
      tour.guides.forEach((guide) => {
        if (!guidesMap[guide.email]) {
          guidesMap[guide.email] = {
            name: guide.name,
            email: guide.email,
            photo: guide.photo,
            role: guide.role,
            tours: [],
          };
        }
        guidesMap[guide.email].tours.push(tour.name);
      });
    });

    // Convert map to an array
    const guidesArray = Object.values(guidesMap);

    // Render the template with users and guides data
    res.status(200).render('manageUserAdmin', {
      title: 'Manage Users',
      tours,
      users,
      guides: guidesArray,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching data', error });
  }
};

exports.adminManageReview = async (req, res, next) => {
  const reviews = await Review.find().populate({
    path: 'tour',
  });

  res.status(200).render('manageReviewAdmin', {
    title: 'Manage Reviews',
    reviews,
  });
};

exports.manageBookings = async (req, res, next) => {
  const bookings = await Booking.find()
  .populate('user')  // Populate the 'user' field
  .populate('tour');  // Populate the 'tour' field

  res.status(200).render('manageBookingsAdmin', {
    title: 'Manage Bookings',
    bookings,
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

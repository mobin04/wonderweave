// eslint-disable-next-line import/no-extraneous-dependencies
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get currently booked tour.
  const tour = await Tour.findById(req.params.tourID);

  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourID}&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email, // req.user came from the protect route middleware
    client_reference_id: req.params.tourID, // Store the tour ID in the session for future reference
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://natours.dev/img/tours/${tour.imageCover}`],
          },
        },
        quantity: 1,
      },
    ],
  });

  // 3) Send session to frontend
  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  // THIS IS ONLY TEMPERORY, because it UNSECURE: everyone can make bookings without paying.
  const { tour, user, price } = req.query; // get the details from query string.

  // If no tour, user, price then call next();
  if (!tour && !user && !price) return next();
  await Booking.create({ tour, user, price });

  // Redirecing to home '/'
  res.redirect(req.originalUrl.split('?')[0]);
  // next();
});

// Check if selected tour date is available
exports.checkAvailability = catchAsync(async (req, res, next) => {
  const { tourId, selectedDate } = req.body;

  const tour = await Tour.findById(tourId);

  if (!tour) {
    return next(new AppError('There is no tour with that ID!', 400));
  }
  // Find the selected date within the tour's available dates
  const tourDate = tour.dates.find(
    (d) => d.date.getTime() === new Date(selectedDate).getTime(),
  );

  if (!tourDate) {
    return next(
      new AppError('Selected date is not avaliable for this tour!', 400),
    );
  }

  if (tourDate.soldOut) {
    return next(new AppError('This tour date is already fully booked', 400));
  }

  req.tourDate = tourDate;
  req.tour = tour;
  next();
});

exports.createBooking = catchAsync(async (req, res, next) => {
  const { tour, tourDate } = req;
  const { price, selectedDate } = req.body;
  const userId = req.user.id;

  tourDate.participants += 1;

  if (tourDate.participants >= tour.maxGroupSize) {
    tourDate.soldOut = true;
  }

  await tour.save();

  const newBooking = await Booking.create({
    tour: tour._id,
    user: userId,
    price,
    selectedDate,
  });

  res.status(200).json({
    status: 'success',
    data: {
      booking: newBooking,
    },
  });
});

// Get bookings for a specific tour (Nested route: /tours/:id/bookings)
exports.getBookingsByTour = async (req, res, next) => {
  const booking = await Booking.find({ tour: req.params.id });

  res.status(200).json({
    status: 'success',
    result: booking.length,
    data: {
      booking,
    },
  });
};

// Get All bookings for a specific user (Nested route: /user/:id/bookings)
exports.getBookingsByUser = async (req, res, next) => {
  const booking = await Booking.find({ user: req.params.id });

  res.status(200).json({
    status: 'success',
    result: booking.length,
    data: {
      booking,
    },
  });
};

// Factory Handler
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);

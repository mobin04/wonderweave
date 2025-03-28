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
  // console.log(`Image URL: https://natours.dev/img/tours/${tour.imageCover}`);

  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    // success_url: `${req.protocol}://${req.get('host')}/success-booking/?tourId=${req.tourId}&selectedDate=${req.selectedDate}`,
    success_url: `${req.protocol}://${req.get('host')}/my-tours?alert=booking`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email, // req.user came from the protect route middleware
    client_reference_id: req.params.tourID, // Store the tour ID in the session for future reference

    metadata: {
      userId: req.user.id,
      selectedDate: req.params.date, // Store the selected date
    },

    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`],
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

// exports.createBookingCheckout = catchAsync(async (req, res, next) => {
//   // THIS IS ONLY TEMPERORY, because it UNSECURE: everyone can make bookings without paying.
//   const { tour, user, price } = req.query; // get the details from query string.

//   // If no tour, user, price then call next();
//   if (!tour && !user && !price) return next();
//   await Booking.create({ tour, user, price });

//   // Redirecing to home '/'
//   res.redirect(req.originalUrl.split('?')[0]);
//   // next();
// });

// Check if selected tour date is available
exports.checkAvailability = catchAsync(async (req, res, next) => {
  const tourId = req.params.tourID;
  const selectedDate = req.params.date;

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
    return next(
      new AppError(
        'The selected date is no longer available due to reaching maximum participants',
        400,
      ),
    );
  }

  req.selectedDate = selectedDate;
  req.tourDate = tourDate.date;
  req.tourId = tourId;
  next();
});

exports.isBooked = catchAsync(async (req, res, next) => {
  const tourId = req.params.id;
  const user = req.user.id;

  const bookedTour = await Booking.findOne({
    tour: tourId,
    user,
  });

  if (bookedTour) {
    return next(new AppError('You already booked this tour!', 403));
  }

  next();
});

// exports.createBooking = catchAsync(async (req, res, next) => {
//   const { tourId, selectedDate } = req.body;
//   const userId = req.user.id;

//   const tour = await Tour.findById(tourId);

//   if (!tour) {
//     return next(new AppError('Tour not found with that id', 404));
//   }

//   // Find the tour date in the tour.dates array
//   const tourDateIndex = tour.dates.findIndex(
//     (date) => date.date.toISOString() === new Date(selectedDate).toISOString(),
//   );

//   if (tourDateIndex === -1) {
//     return next(new AppError('Selected date not found in tour dates', 400));
//   }

//   // Increase the participants count
//   tour.dates[tourDateIndex].participants += 1;

//   // Check if the tour is sold out
//   if (tour.dates[tourDateIndex].participants >= tour.maxGroupSize) {
//     tour.dates[tourDateIndex].soldOut = true;
//   }

//   await tour.save();

//   const newBooking = await Booking.create({
//     tour: tour._id,
//     user: userId,
//     price: tour.price,
//     selectedDate,
//   });

//   res.status(200).json({
//     status: 'success',
//     data: {
//       booking: newBooking,
//     },
//   });
// });

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

const createBookingCheckout = async (session) => {
  try {
    const tour = session.client_reference_id; // Get tour ID
    const user = session.metadata.userId; // Get user ID from metadata
    const price = session.amount_total / 100; // Convert from cents to dollars
    const selectedDate = session.metadata.selectedDate; // Get selected date from metadata

    await Booking.create({
      tour,
      user,
      price,
      selectedDate,
    });

    console.log('✅ Booking created successfully!');
  } catch (err) {
    console.error('❌ Error creating booking:', err);
  }
};

exports.webhookCheckout = async (req, res) => {
  const signature = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`❌ Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook error: ${err.message}`);
  }
  
  console.log('✅ Webhook received:', event.type); // Log event type

  if (event.type === 'checkout.session.completed') {
    await createBookingCheckout(event.data.object); 
  }

  res.status(200).json({ received: true });
};


// Factory Handler
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);

exports.deleteBooking = catchAsync(async (req, res, next) => {
  // 1) Find the booking
  const userBooking = await Booking.findById(req.params.id);
  if (!userBooking) {
    return next(new AppError('No booking found with that ID', 404));
  }

  // 2) Find the related tour
  const tour = await Tour.findById(userBooking.tour);
  if (!tour) {
    return next(new AppError('No tour found for this booking', 404));
  }

  // 3) Find the correct tour date in the dates array
  const tourDateIndex = tour.dates.findIndex(
    (date) => date.date.toISOString() === new Date(userBooking.selectedDate).toISOString()
  );

  if (tourDateIndex !== -1) {
    // Decrease participants count
    tour.dates[tourDateIndex].participants -= 1;

    // Ensure the tour is not marked as sold out if participants decrease
    if (tour.dates[tourDateIndex].participants < tour.maxGroupSize) {
      tour.dates[tourDateIndex].soldOut = false;
    }

    await tour.save(); // Save changes to the tour
  }

  // 4) Delete the booking
  await Booking.findByIdAndDelete(req.params.id);

  // 5) Send response
  res.status(204).json({
    status: 'success',
    data: null,
  });
});


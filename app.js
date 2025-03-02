// Import required modules
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

// Set Pug as the view engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES

// Serve static files (CSS, JS, images, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Set security-related HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          'blob:',
          'https://api.mapbox.com',
          'https://cdnjs.cloudflare.com',
        ],
        connectSrc: [
          "'self'",
          'https://api.mapbox.com',
          'https://events.mapbox.com',
          'ws://127.0.0.1:*', // ✅ Allow WebSockets for Parcel HMR
          'ws://localhost:*', // ✅ Allow WebSockets for local dev
        ],
        imgSrc: ["'self'", 'data:', 'https://*.mapbox.com'],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://api.mapbox.com',
          'https://fonts.googleapis.com',
        ],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      },
    },
  }),
);

// Enable request logging only in development mode
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit the number of requests from the same IP to prevent abuse
const limiter = rateLimit({
  max: 100, // Max 100 requests
  windowMs: 60 * 60 * 1000, // Within 1 hour
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter); // Apply rate limiting to API routes

// Parse incoming JSON requests (limit size to 10kb)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // Parse URL-encoded data
app.use(cookieParser()); // Parse cookies from incoming requests

// Protect against NoSQL query injection
app.use(mongoSanitize());

// Protect against Cross-Site Scripting (XSS) attacks
app.use(xss());

// Prevent parameter pollution (allow specific query parameters)
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

// Custom middleware to log request time and cookies
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.cookies);
  next();
});

// 3) ROUTES

// Define route handlers for different parts of the app
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

// Handle all unmatched routes with a custom error message
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler middleware
app.use(globalErrorHandler);

// Export the app module
module.exports = app;

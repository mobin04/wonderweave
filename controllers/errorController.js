/* eslint-disable node/no-unsupported-features/es-syntax */

const AppError = require('../utils/appError');

// HANDLING INVALID DATABASE IDs
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

// HANDLING DUPLICATE DATABASE FIELDS
const handleDuplicateFieldsDB = (err) => {
  const message = `Duplicate field value: '${err.keyValue.name}' Please use another value!`;
  return new AppError(message, 400);
};

//HANDLE VALIDATION ERROR
const handleValidationErrorDB = (err) => {
  //loop over the error message.
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

// HANDLE JSONWEBTOKEN ERROR
const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

// HANDLE JWT EXPIRED ERROR
const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

// FOR DEVELOPMENT
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

//FOR PRODUCTION
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    // only send operational error
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // Programing or other unknown error: don't leak details to client
  } else {
    // 1) Log error
    console.error('ERROR 💥', err);
    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Somethng went very wrong!',
    });
  }
};

// GLOBAL ERROR HANDLINING MIDDLEWARE 👑
module.exports = (err, req, res, next) => {
  // console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    //A hard copy of err
    let error = { ...err };

    // HANDLING INVALID DATABASE IDs
    if (err.name === 'CastError') error = handleCastErrorDB(error);

    // HANDLING DUPLICATE DATABASE FIELDS
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);

    // HANDLING MONGOOSE VALIDATION ERROR
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);

    // HANDLE JSONWEBTOKEN ERROR
    if (err.name === 'JsonWebTokenError') error = handleJWTError();

    // HANDLE JWT TOKEN EXPIRES ERROR
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};

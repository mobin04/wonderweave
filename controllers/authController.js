/* eslint-disable arrow-body-style */
/* eslint-disable import/no-extraneous-dependencies */
const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

// GENERATING TOKEN
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Send token as response function
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  // Cookie options
  const cookieOptions = {
    expires: new Date( // Convert the days into millisecond
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true, //This ensure that cookie cannot be accesed or modified in anyway by the browser
  };

  // Defining the cookie
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true; //only secure in production
  res.cookie('jwt', token, cookieOptions);

  //remove the password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

// 1) IMPLEMENT SIGNUP MIDDLEWARE FUNCTION
exports.signup = catchAsync(async (req, res, next) => {
  // it only store specific fields for security purpose
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  // Send token as response
  createSendToken(newUser, 201, res);
});

// 2) IMPLEMENT LOGIN MIDDLEWARE FUNCTION
exports.login = catchAsync(async (req, res, next) => {
  // STEPS TO IMPLEMENT LOGIN MIDDLEWARE :)

  const { email, password } = req.body;

  // 1) Check if email and password exists.
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  // if the email is incorrect
  if (!user) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // Cheking if account is locked due to failed Login Attempts
  if (user.isLocked()) {
    if (Date.now() > user.lockUntil) {
      // Unlock account if lock time has expired
      user.failedLoginAttempts = 0;
      user.lockUntil = undefined;
    } else {
      return next(
        new AppError('Maximum login attempts exceeded, try again later.', 403),
      );
    }
  }

  if (!(await user.correctPassword(password, user.password))) {
    // Adding failed login attempt by 1
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= 5) {
      user.lockUntil = Date.now() + 15 * 60 * 1000;
    }
    await user.save({ validateBeforeSave: false }); // save the changes
    return next(new AppError('Incorrect email or password', 401));
  }

  //if user and password is correct then reset the failedLoginAttempt and lockUntil;
  user.failedLoginAttempts = 0;
  user.lockUntil = undefined;
  await user.save({ validateBeforeSave: false });

  // 3) if everything ok, send token to client.
  createSendToken(user, 200, res);
});

// IMPLEMENT A SIMPLE LOG OUT MIDDLEWARE.
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: 'success',
  });
};

// 3) PROTECTING THE ROUTES MIDDLEWARE FUNCTION.
exports.protect = catchAsync(async (req, res, next) => {
  //STEPS TO IMPLEMENT THE PROTECTED ROUTE :)

  // 1) Getting token and check of it's there,
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]; //to get the second value using index
  } else if (req.cookies.jwt) {
    //get the token from the cookie
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access', 401),
    );
  }

  // 2) Token Verification,
  // promisify(): convert callback based function into promises
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists,
  const currentUser = await User.findById(decode.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token does not exists.', 401),
    );
  }

  // 4) Check if user changed password after the token was issued,
  if (currentUser.changedPasswordAfter(decode.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again', 401),
    );
  }

  // GRAND ACCESS TO PROTECTED ROUTE
  req.user = currentUser; // *(IMPORTANT) to set the current log in user data into req.user
  next();
});

// CHECKS WHETHER A USER IS LOGGED IN BASED ON A JSON WEB TOKEN (JWT) STORED IN COOKIES.
exports.isUserLoggedIn = async (req, res, next) => {
  // Check if there is a JWT cookie present in the request
  if (req.cookies.jwt) {
    try {
      // 1) Verify the token using the JWT secret key
      const decode = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET,
      );

      // 2) Check if the user still exists in the database
      const currentUser = await User.findById(decode.id);
      if (!currentUser) {
        return next(); // If user does not exist, move to the next middleware
      }

      // 3) Check if the user changed their password after the token was issued
      if (currentUser.changedPasswordAfter(decode.iat)) {
        return next(); // If password was changed, move to the next middleware (logout user)
      }

      // 4) If all checks pass, store the user in res.locals
      // This makes the user data accessible in views (e.g., templates)
      res.locals.user = currentUser;

      return next(); // Move to the next middleware
    } catch (err) {
      return next(); // If an error occurs (e.g., token verification fails), move to the next middleware
    }
  }
  next(); // If no JWT cookie is present, move to the next middleware
};

// 4) IMPLEMENTING (RESTRICTION) AUTHORIZATION
//(...roles) => it using rest paramenter
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin','lead-guide']. if role='user'=> So permission denied
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    }

    next();
  };
};

// 5) IMPLEMENTING FORGOT PASSWORD FUNCTIONALITY,(vid: 135)
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // STEPS TO IMPLEMENT :)
  // 1) Get user based on POSTed email,
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with that email address.', 404));
  }

  // 2) Generate the random reset token,
  const resetToken = user.createPasswordResetToken(); //store the reset Token
  await user.save({ validateBeforeSave: false }); // save the modified fields in order to work

  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot you password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nif you didn't forget your password, Please ignore this email!`;

  //handling error
  try {
    await sendEmail({
      // sending the email to user
      email: user.email,
      subject: `Your password reset token (valid for 10 min)`,
      message,
    });
    res.status(200).json({
      status: 'success',
      message: 'token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false }); // save the modified fields in order to work

    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500,
      ),
    );
  }
});

// 6) IMPLEMENT PASSWORD RESET FUNCTIONALITY.
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto //encrypt the user token
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken, // find the matched token
    passwordResetExpires: { $gt: Date.now() }, // check exp date greater than data.now
  });

  // 2) If token has not expired, and there is a user, Set the new password
  if (!user) {
    return next(new AppError('Token is invalid or expired', 400));
  }
  user.password = req.body.password; // if no error, Set the new password and undefining the token and exp
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined; // remove these field from the database
  user.passwordResetExpires = undefined;
  await user.save(); // Always use save for running all the validator (not update())

  // 3) Update changedPasswordAt property for the current user.
  // 4) Log the user in, send the JWT
  createSendToken(user, 200, res);
});

// 7) IMPLEMENT, UPDATING THE CURRENT USER PASSWORD
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get the user from the collection
  const user = await User.findById(req.user.id).select('+password');

  if (!user) {
    return next(new AppError('User does not exists!', 404));
  }

  // 2) Check if POSTed password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // 3) if password is correct, update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
});

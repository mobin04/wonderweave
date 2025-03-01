const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {}; // Create an empty object to store filtered properties

  // Loop through each key in the object
  Object.keys(obj).forEach((el) => {
    // Check if the key is in the allowedFields array
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el]; // Add it to the new object, Copy value from obj to newObj
    }
  });

  return newObj; // Return the filtered object
};

// ROUTE HANDLERS

// Middleware for getUser factory handler (passing userId to param)
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// 2) UPDATING THE CURRENT USER DATA.
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMypassword.',
        400,
      ),
    );
  }
  // 2) Filtered out unwanted fields names that are not allowed to be updated.
  const filteredBody = filterObj(req.body, 'name', 'email');

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true, // turn on the validation
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

// 3) DELETING THE CURRENT USER (active status turn to false)
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!, Please use /signup instread',
  });
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);

// Do NOT update passwords with this!
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

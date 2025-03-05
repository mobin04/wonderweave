const multer = require('multer'); // for file uploading functionality.
const sharp = require('sharp');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

// Configure Multer Storage
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users'); // Save files in "public/img/users" folder
//   },
//   filename: (req, file, cb) => {
//     // user-12345asdf-333322221111.jpeg
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

//Upload is now happen in buffer not directly to the filesystem.
const multerStorage = multer.memoryStorage(); // Storage changed to memoryStorage

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

// Exporting the fully configured middleware.
exports.uploadUserPhoto = upload.single('photo');

//IMPLEMENTING THE IMAGE RESIZING MIDDLEWARE.
// it work after the photo was uploaded.
exports.resizeUserPhoto = (req, res, next) => {
  // if there is no image Just return next().
  if (!req.file) return next();

  //Put image filename on req.file.filename(So we can use it in update me route handler)
  req.file.filename = `user-${req.user.id}-${Date.now()}`;

  // req.file.buffer is avaliable after image stored to memoryStorage.
  sharp(req.file.buffer) // Sharp is an image resize tool
    .resize(500, 500) //it resize the image to square 500 width and 500 height.
    .toFormat('jpeg') // Format the image to jpeg.
    .jpeg({ quality: 90 }) // Qualilty set to 90%.
    .toFile(`public/img/users/${req.file.filename}`); //path to the file | file Name

  next();
};

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

  // if user update photo then assign a photo property to filteredBody
  if (req.file) filteredBody.photo = req.file.filename;

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

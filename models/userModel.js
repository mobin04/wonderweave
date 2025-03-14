const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator'); //npm validator for custom validation
// eslint-disable-next-line import/no-extraneous-dependencies
const bcrypt = require('bcryptjs');

//CREATING USER SCHEMA.
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email!'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email!'], //Ensure the correct email format
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password!'],
    minlength: 8,
    select: false, // never show on output
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password!'],
    // This only work on .save() or .create()
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'password are not the same',
    },
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
});

// Query middleware
userSchema.pre('save', async function (next) {
  // check if the password was not modified
  // Only run this function if password was actually modified
  if (!this.isModified('password')) {
    return next();
  }

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  //Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

// UPDATE CHANGEDPASSWORDAT PROPERTY FOR THE CURRENT USER.(PASSWORD RESET FUNCTIONALITY)
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000; // substact by 1-sec bcoz passwordChangedAt must be greater than JWTTimeStamp otherwise user get error! (this help to set passwordChangedAt on 1-sec past)
  next();
});

// Exclude inactive users from the output
userSchema.pre(/^find/, function (next) {
  // this point to current query
  this.find({ active: { $ne: false } });
  next();
});

// INSTANCE METHOD checking if two passwords are correct
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  //bcrypt.compare() used to compare
  return await bcrypt.compare(candidatePassword, userPassword);
};

// INSTANCE METHOD: checking if user change password after token issued
userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    // change passwordChangedAt date to seconds (10-digit )
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );

    return JWTTimeStamp < changedTimeStamp; //eg: 100 < 200 => true otherwise false
  }

  return false;
};

//INSTANCE METHOD: Generate the random reset token,
userSchema.methods.createPasswordResetToken = function () {
  //generate random token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash the token before saving it in the database
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  // Set token expiry (10-min)
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  // sent via the email into these unencrypted token
  return resetToken;
};

// INSTANCE METHOD check if lockUntil greaterthan date.now();
userSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

userSchema.methods.createEmailVerificationToken = function(){
  const verificationToken = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
  return verificationToken;
}

const User = mongoose.model('User', userSchema);
module.exports = User;

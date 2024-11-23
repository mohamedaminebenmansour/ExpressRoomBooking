const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');
const crypto = require('crypto');
const dotenv = require('dotenv');



dotenv.config({ path: './config.env' });

const signToken = id => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

/*we use this same code 4 times So I need to create a function
!!!DRY: Dont Repeat Yourself!!!
const token = signToken(user._id);
  res.status(200).json({
    status: 'ok',
    token: token,
    data: {
      user: user
    }
  }); */
let tokenout;
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  tokenout = token;
  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIES_EXPIRES_IN * 1000 * 60 * 60 * 24),
    httpOnly: true
  }

  res.cookie('jwt', token, cookieOptions);


  user.password = undefined;//dont show the password when creating new user

  res.status(statusCode)
    .json({
      status: 'ok',
      token: token,
      data: {
        user: user
      }
    });
}

exports.signup = catchAsync(async (req, res, next) => {
  //this is line is not secure because everything is request body
  //const newUser = await User.create(req.body);
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    photo: req.body.photo,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role
  });
  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser, url).sendWelcome();
  createSendToken(newUser, 201, res);

  const token = signToken(newUser._id);
});

exports.login = catchAsync(async (req, res, next) => {

  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  // 2) Check if user exists and password is correct
  const user = await User.findOne({ email: email }).select('+password');

  if (!user || !await user.correctPassword(password, user.password)) {
    return next(new AppError('Incorrect email or password!', 401));
  }

  // 3) If everything is ok, send token to client
  createSendToken(user, 200, res);
});

exports.logout = (req, res, next) => {
  res.cookie("this", "mohamed")
  res.cookie('jwt', 'loggedout');
  tokenout = 'loggedout'
  res.status(200).json({ status: 'ok' });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  } else {
    token = tokenout;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  if (await currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});
//Only for rendered pages, no errors
exports.isLoggedIn = async (req, res, next) => {
  res.cookie("hello", "hello")

  if (5 > 3) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        tokenout,
        process.env.JWT_SECRET
      );
      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }
      res.cookie("jwt", tokenout, {
        expires: new Date(Date.now() + process.env.JWT_COOKIES_EXPIRES_IN * 1000 * 60 * 60 * 24),
        httpOnly: true
      })

      res.locals.user = currentUser;
      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }
      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles is an array ['admin','lead-guide]
    if (!roles.includes(req.user.role)) {
      return next(new AppError("You do not have premission to perform this action", 403));
    }
    next();
  }
}
exports.forgotPasswrd = async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new AppError('No user with that email address exists.', 404)
    );
  }
  // 2)Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  // 3) Send email to user 
  //const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;//http://127.0.0.1:3000/reset/
  const resetURL = `${req.protocol}://${req.get('host')}/reset/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {/*
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message
    });*/

    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'ok',
      message: 'Token sent to email!'
    });
  } catch (err) {

    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }

};

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1) get user based on the token

  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });
  //2)if token has not expired, and there is user , set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  //3)Update changedPasswordAt property for the user
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  //4)log the user in , send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // User.findByIdAndUpdate will NOT work as intended!
  /*The qustion here: why we didn't do something like user.findByIdAndUpdate?
  it is for two reasons:
  ONE: the first one is that this validation here 
    "passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        // This only works on CREATE and SAVE!!!
        validator: function(el) {
            return el === this.password;
        },
        message: 'Passwords are not the same!'
      }"is not going to work,
    And that's basically because this.password is not defined when we update, 
    so when we use "findByIdAndUpdate", because internally, behind the scenes,
    Mongoose does not really keep the current object in memory,and so therefore, this here is not going to work.

  !!!it's really important to keep in mind not to use update for anything related to passwords!!!
  TWO: these two pre-saved Middlewares are also not going to work.So, if we used simply update for updating the password,
    then that password would not be encrypted, which is this first Middleware, and then also, the passwordChangedAt
    timestamp would also not be set, okay?
 */

  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
});
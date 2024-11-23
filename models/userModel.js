const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');


const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  photo: {
    type: String,
    default: 'default.jpg'
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'guide', 'lead-guide'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false//never show up in any output when select it not creating a password
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!'
    }
  },
  passwrdChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();
  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  // Delete passwordConfirm field (IMPORTANT!)
  /*we have required on usershema , now you might wonder wyh this works?
  because we actuallay set passwrd confirm  to a require but that simply
  means that it's a required input , not it's required to actually be presisted. */

  this.passwordConfirm = undefined;
  next();
})
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwrdChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  //this points to the current query
  //this.find({active : true});//
  this.find({ active: { $ne: false } })
  next();
})
/*for the first time now we're gonna create somthingc called an INSTANCE METHOD
so an instance method is absically a method that is gonna available on all documents
of a certain collection */
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword)
};

userSchema.methods.changedPasswordAfter = async function (JWTTimestamp) {
  if (this.passwrdChangedAt) {
    const changedTimestamp = parseInt(this.passwrdChangedAt.getTime() / 1000, 10);
    console.log(`JWTTimestamp=${JWTTimestamp} 
    changedTimestamp=${changedTimestamp}`)
    return JWTTimestamp < changedTimestamp;
  }
  console.log(" I m In userSchema.methods.changedPasswordAfter")
  //false:: means NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  //Generata new token (plain text)
  const resetToken = crypto.randomBytes(20).toString('hex');
  //crypto the resetToken
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  console.log({ resetToken }, this.passwordResetToken);
  //set the resetToken to expire in 15 minutes
  this.passwordResetExpires = Date.now() + 15 * 1000 * 60;
  return resetToken;
}


const User = mongoose.model('User', userSchema);

module.exports = User;
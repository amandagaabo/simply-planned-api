const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const SALT_WORK_FACTOR = 10
const MIN_PASSWORD_LENGTH = 8
const MAX_PASSWORD_LENGTH = 65

// setup schema
const userSchema = mongoose.Schema({
  email: {
    type: String,
    set: email => email.toLowerCase(),
    required: [true, 'email is required'],
    validate: {
      isAsync: false,
      validator: validator.isEmail,
      message: 'invalid email'
    }
  },
  password: {
    type: String,
    required: [true, 'password is required'],
    minlength: [MIN_PASSWORD_LENGTH, `password is too short, please use at least ${MIN_PASSWORD_LENGTH} characters`],
    maxlength: [MAX_PASSWORD_LENGTH, `password is too long, please use less than ${MAX_PASSWORD_LENGTH} characters`]
  },
  firstName: {
    type: String,
    required: [true, 'first name is required']
  },
  lastName: {
    type: String,
    required: [true, 'last name is required']
  }
});

// validate password: make sure it has at least 1 number
userSchema.path('password').validate(password => {
  const hasNumber = /\d/
  return hasNumber.test(password)
}, 'password must contain at least 1 number')

// validate password: make sure it has at least 1 letter
userSchema.path('password').validate(password => {
  const hasLetter = /[A-Za-z]/
  return hasLetter.test(password)
}, 'password must contain at least 1 letter')

// mongoose middleware that runs before save to salt and hash the password
userSchema.pre('save', function (next) {
  let user = this

  // only hash the password if it has been modified or is new
  if (!user.isModified('password')) return next()

  // hash the password with bcrypt auto-salter
  bcrypt.hash(user.password, SALT_WORK_FACTOR, function (err, hash) {
    if (err) return next(err)

    // override the password with the hashed one
    user.password = hash
    next()
  })
});

// setup apiRepr method to be returned so password is never sent to front end
userSchema.methods.apiRepr = function () {
  return {
    id: this._id,
    email: this.email,
    firstName: this.firstName,
    lastName: this.lastName
  }
};

// check if password if matches password in database for user email
userSchema.methods.matchPassword = function (password) {
  return bcrypt.compare(password, this.password)
};

// setup mongoose model for User
const User = mongoose.model('User', userSchema);

// export User model
module.exports = User;

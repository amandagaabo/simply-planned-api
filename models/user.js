const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const SALT_WORK_FACTOR = 10
const MIN_PASSWORD_LENGTH = 8
const MAX_PASSWORD_LENGTH = 65

mongoose.Promise = global.Promise;

const UserSchema = mongoose.Schema({
  email: {
    type: String,
    set: email => email.toLowerCase(),
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: MIN_PASSWORD_LENGTH,
    maxlength: MAX_PASSWORD_LENGTH
  },
  firstName: {type: String, default: ''},
  lastName: {type: String, default: ''}
});

UserSchema.methods.apiRepr = function() {
  return {
    email: this.email || '',
    firstName: this.firstName || '',
    lastName: this.lastName || ''
  };
};

UserSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

UserSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, SALT_WORK_FACTOR);
};

const User = mongoose.model('User', UserSchema);

module.exports = User;

const jwt = require('jsonwebtoken');
const User = require('../models/user');
const {JWT_SECRET, JWT_EXPIRY} = require('../config/config');

const createAuthToken = function(user) {
  return jwt.sign({user}, JWT_SECRET, {
    subject: user.email,
    expiresIn: JWT_EXPIRY,
    algorithm: 'HS256'
  });
};

exports.loginSubmit = function (req, res) {
  const authToken = createAuthToken(req.user.apiRepr());
  res.json({authToken});
};

exports.refreshToken = function (req, res) {
  const authToken = createAuthToken(req.user);
  res.json({authToken});
};

exports.signUpSubmit = function (req, res) {


};

exports.logout = function (req, res) {
  req.logout();
  res.status(200).json({message: 'Successfully logged out'});
};

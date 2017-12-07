//const User = require('../models/user');

exports.landingPage = function (req, res) {
  res.status(200).json({message: '/ route connected'})
};

exports.loginPage = function (req, res) {
  res.status(200).json({message: '/login route connected'})
};

exports.loginSubmit = function (req, res) {
  res.status(200).json({message: '/login route connected'})
};

exports.logout = function (req, res) {
  res.status(200).json({message: '/logout route connected'})
};

exports.signUpSubmit = function (req, res) {
  res.status(200).json({message: '/sign-up route connected'})
};

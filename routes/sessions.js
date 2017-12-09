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
  // get new user data from request
  const newUser = {
    email: req.body.email,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    password: req.body.password
  }

  User.findOne({ email: req.body.email.toLowerCase() })
  .then(user => {
    // check that email is not already in the database
    if (user) {
      return res.status(422).json({message: 'user with email already exist'})
    }

    // if no errors, add user to database
    User.create(newUser)
    .then((user) => {
      // log the user in
      req.login(user, function () {
        res.status(200).json({user})
      })
    }).catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'});
    })
  })

};

exports.logout = function (req, res) {
  req.logout();
  res.status(200).json({message: 'Successfully logged out'});
};

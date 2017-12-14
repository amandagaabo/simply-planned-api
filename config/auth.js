const {Strategy: LocalStrategy} = require('passport-local');

// Assigns the Strategy export to the name JwtStrategy using object destructuring
const {Strategy: JwtStrategy, ExtractJwt} = require('passport-jwt');

const User = require('./../models/user');
const {JWT_SECRET} = require('./config');

const localStrategy = new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },

  function (email, password, callback) {
    let user;
    User.findOne({ email: email.toLowerCase()})
      .then(_user => {
        user = _user;
        if (!user) {
          console.log('no user, reject promise')
          return Promise.reject({
            reason: 'LoginError',
            message: 'Incorrect email or password'
          });
        }
        return user.validatePassword(password);
      })
      .then(isValid => {
        if (!isValid) {
          return Promise.reject({
            reason: 'LoginError',
            message: 'Incorrect email or password'
          });
        }
        return callback(null, user);
      })
      .catch(err => {
        if (err.reason === 'LoginError') {
          return callback(null, false, err);
        }
        return callback(err, false);
      });
});

const jwtStrategy = new JwtStrategy(
  {
    secretOrKey: JWT_SECRET,
    // look for the JWT as a Bearer auth header
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
    // only allow HS256 tokens - the same as the ones we issue
    algorithms: ['HS256']
  },
  function(payload, done) {
    done(null, payload.user);
  }
);

module.exports = {localStrategy, jwtStrategy};

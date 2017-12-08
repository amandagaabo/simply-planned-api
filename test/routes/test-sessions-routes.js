const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');
const {JWT_SECRET} = require('../../config/config');
const {app, runServer, closeServer} = require('../../server');
const User = require('../../models/user');

const should = chai.should();
chai.use(chaiHttp);

describe('Sessions Routes', function() {
  const email = 'john@gmail.com';
  const password = 'fakepassword123';
  const firstName = 'john';
  const lastName = 'smith';

  before(function () {
    return runServer();
  });

  after(function () {
    return closeServer();
  });

  beforeEach(function() {
    return User.hashPassword(password).then(password =>
      User.create({
        email,
        password,
        firstName,
        lastName
      })
    );
  });

  afterEach(function () {
    return User.remove({});
  });

  describe('POST requests to /login', function () {
    it('should fail with no credentials ', function() {
      return chai.request(app)
        .post('/login')
        .then(function() {
          should.fail(null, null, 'Request should not succeed')
        })
        .catch(function(err) {
          if (err instanceof chai.AssertionError) {
            throw err;
          }
          const res = err.response;
          res.should.have.status(400);
        });
    });

    it('should fail with incorrect email', function () {
      return chai.request(app)
        .post('/login')
        .send({email: 'wrongEmail', password})
        .then(() =>
          should.fail(null, null, 'Request should not succeed')
        )
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }
          const res = err.response;
          res.should.have.status(401);
        });
    });

    it('should fail with incorrect password', function () {
      return chai.request(app)
        .post('/login')
        .send({email, password: 'wrongPassword'})
        .then(() =>
          should.fail(null, null, 'Request should not succeed')
        )
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }
          const res = err.response;
          res.should.have.status(401);
        });
    });

    it('should return a valid auth token on successful login', function () {
      return chai.request(app)
        .post('/login')
        .send({email, password})
        .then(res => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          const token = res.body.authToken;
          token.should.be.a('string');
          const payload = jwt.verify(token, JWT_SECRET, {
            algorithm: ['HS256']
          });
          payload.user.should.deep.equal({
            email,
            firstName,
            lastName
          });
        });
    });

  });

  describe('POST requests to /refresh', function () {
    it('Should reject requests with no credentials', function () {
      return chai.request(app)
        .post('/refresh')
        .then(function() {
          should.fail(null, null, 'Request should not succeed')
        })
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }
          const res = err.response;
          res.should.have.status(401);
        });
    });

    it('Should reject requests with an invalid token', function () {
      const token = jwt.sign(
        {
          email,
          firstName,
          lastName
        },
        'wrongSecret',
        {
          algorithm: 'HS256',
          expiresIn: '7d'
        }
      );

      return chai.request(app)
        .post('/refresh')
        .set('Authorization', `Bearer ${token}`)
        .then(function() {
          should.fail(null, null, 'Request should not succeed')
        })
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          res.should.have.status(401);
        });
    });

    it('Should reject requests with an expired token', function () {
      const token = jwt.sign(
        {
          user: {
            email,
            firstName,
            lastName
          },
          exp: Math.floor(Date.now() / 1000) - 10 // Expired ten seconds ago
        },
        JWT_SECRET,
        {
          algorithm: 'HS256',
          subject: email
        }
      );

      return chai.request(app)
        .post('/refresh')
        .set('authorization', `Bearer ${token}`)
        .then(function() {
          should.fail(null, null, 'Request should not succeed')
        })
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          res.should.have.status(401);
        });
    });

    it('Should return a valid auth token with a new expiry date on successful refresh', function () {
      const token = jwt.sign(
        {
          user: {
            email,
            firstName,
            lastName
          }
        },
        JWT_SECRET,
        {
          subject: email,
          expiresIn: '7d',
          algorithm: 'HS256'
        }
      );

      const decoded = jwt.decode(token);

      return chai.request(app)
        .post('/refresh')
        .set('authorization', `Bearer ${token}`)
        .then(res => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          const token = res.body.authToken;
          token.should.be.a('string');
          const payload = jwt.verify(token, JWT_SECRET, {
            algorithm: ['HS256']
          });
          payload.user.should.deep.equal({
            email,
            firstName,
            lastName
          });
          payload.exp.should.be.at.least(decoded.exp);
        });
    });
  });

  it('GET requests to /logout should respond with status 200', function() {
    return chai.request(app)
      .get('/logout')
      .then(function(res) {
        res.should.have.status(200);
      });
  });

  it.skip('POST requests to /sign-up should respond with status 200', function() {
    return chai.request(app)
      .post('/sign-up')
      .then(function(res) {
        res.should.have.status(200);
        res.should.be.json;
      });
  });

});

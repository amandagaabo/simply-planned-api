const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');
const {JWT_SECRET} = require('../../config/config');
const {app, runServer, closeServer} = require('../../server');
const User = require('../../models/user');

const should = chai.should();
chai.use(chaiHttp);

describe('Sessions Routes', function() {
  const email = 'user@gmail.com';
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
    it('should failwith no credentials ', function() {
      return chai.request(app)
        .pot('/login')
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

  it.only('GET requests to /logout should have status 200', function() {
    return chai.request(app)
      .get('/logout')
      .then(function(res) {
        res.should.have.status(200);
      });
  });

  it('POST requests to /sign-up should have status 200', function() {
    return chai.request(app)
      .post('/sign-up')
      .then(function(res) {
        res.should.have.status(200);
        res.should.be.json;
      });
  });

});

const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');
const {JWT_SECRET} = require('../../config/config');
const {app, runServer, closeServer} = require('../../server');
const User = require('../../models/user');

const should = chai.should();
chai.use(chaiHttp);

function clearDB() {
  return User.remove({})
}

describe('Sessions Routes', function() {
  let userId;
  const email = 'john@gmail.com';
  const password = 'fakepassword123';
  const firstName = 'john';
  const lastName = 'smith';

  before(function () {
    return runServer(databaseUrl='mongodb://localhost/simply-planned-test')
    .then(function() {
      return clearDB()
    })
  });

  beforeEach(function() {
    return User.hashPassword(password).then(password =>
      User.create({
        email,
        password,
        firstName,
        lastName
      })
      .then(function(res) {
        userId = res._id;
      })
    );
  });

  afterEach(function () {
    return clearDB();
  });

  after(function () {
    return closeServer();
  });

  describe('POST requests to /login', function () {
    it('should fail with no credentials ', function() {
      return chai.request(app)
        .post('/login')
        .send({email:"", password:""})
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
          payload.user.id.should.equal(`${userId}`);
          payload.user.email.should.equal(email);
          payload.user.firstName.should.equal(firstName);
          payload.user.lastName.should.equal(lastName);
        });
    });

  });

  describe('POST requests to /refresh', function () {
    it('should reject requests with no credentials', function () {
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

    it('should reject requests with an invalid token', function () {
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

    it('should reject requests with an expired token', function () {
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

    it('should return a valid auth token with a new expiry date on successful refresh', function () {
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

  describe('POST requests to /sign-up', function() {
    it.skip('should fail with email that is already in use', function() {
      return chai.request(app)
        .post('/sign-up')
        .send({
          email,
          password,
          firstName,
          lastName
        })
        .then(function() {
          should.error()
        })
    });

    it('should create new user on successful submit', function() {
      const newEmail = "user2@gmail.com"
      const newPassword = "Password123"
      const newFirstName = "Jane"
      const newLastName = "Doe"
      let user;

      return chai.request(app)
        .post('/sign-up')
        .send({
          email: newEmail,
          password: newPassword,
          firstName: newFirstName,
          lastName: newLastName
        })
        .then(res => {
          res.should.have.status(201);
          res.body.should.be.an('object');
          res.body.should.include.keys(
            'email',
            'firstName',
            'lastName'
          );
          res.body.email.should.equal(newEmail);
          res.body.firstName.should.equal(newFirstName);
          res.body.lastName.should.equal(newLastName);
          return User.findOne({
            email: newEmail
          });
        })
        .then(_user => {
          user=_user
          user.should.not.be.null;
          user.firstName.should.equal(newFirstName);
          user.lastName.should.equal(newLastName);
          // password should be hashed so it should not equal the submitted password
          user.password.should.not.equal(newPassword);
        })

    });
  })

});

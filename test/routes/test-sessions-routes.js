const chai = require('chai');
const chaiHttp = require('chai-http');
const {app} = require('../../server');

const should = chai.should();
chai.use(chaiHttp);

describe('Sessions Routes', function() {

  it('GET requests to / should have status 200', function() {
    return chai.request(app)
      .get('/')
      .then(function(res) {
        res.should.have.status(200);
        res.should.be.json;
      });
  });

  it('GET requests to /login should have status 200', function() {
    return chai.request(app)
      .get('/login')
      .then(function(res) {
        res.should.have.status(200);
        res.should.be.json;
      });
  });

  it('POST requests to /login should have status 200', function() {
    return chai.request(app)
      .post('/login')
      .then(function(res) {
        res.should.have.status(200);
        res.should.be.json;
      });
  });

  it('GET requests to /logout should have status 200', function() {
    return chai.request(app)
      .get('/logout')
      .then(function(res) {
        res.should.have.status(200);
        res.should.be.json;
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

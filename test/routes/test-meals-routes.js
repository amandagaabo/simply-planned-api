const chai = require('chai');
const chaiHttp = require('chai-http');
const {app} = require('../../server');

const should = chai.should();
chai.use(chaiHttp);

describe('Meals Routes', function() {

  it('GET requests to /meals should have status 200', function() {
    return chai.request(app)
      .get('/meals')
      .then(function(res) {
        res.should.have.status(200);
        res.should.be.json;
      });
  });

  it('POST requests to /meals should have status 200', function() {
    return chai.request(app)
      .post('/meals')
      .then(function(res) {
        res.should.have.status(200);
        res.should.be.json;
      });
  });


});

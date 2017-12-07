const chai = require('chai');
const chaiHttp = require('chai-http');
const {app} = require('../../server');

const should = chai.should();
chai.use(chaiHttp);

describe('Groceries Routes', function() {

  it('GET requests to /groceries should have status 200', function() {
    return chai.request(app)
      .get('/groceries')
      .then(function(res) {
        res.should.have.status(200);
        res.should.be.json;
      });
  });

  it('POST requests to /groceries/add should have status 200', function() {
    return chai.request(app)
      .post('/groceries/add')
      .then(function(res) {
        res.should.have.status(200);
        res.should.be.json;
      });
  });

  it('POST requests to /groceries/:item/delete should have status 200', function() {
    return chai.request(app)
      .post('/groceries/:item/delete')
      .then(function(res) {
        res.should.have.status(200);
        res.should.be.json;
      });
  });

});

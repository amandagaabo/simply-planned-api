const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
chai.use(chaiHttp);
const mongoose = require('mongoose');

const {app, runServer, closeServer} = require('../../server');
const Grocery = require('../../models/grocery');

const seedData = [
  { user: "59f7734fd1a16c0012dd20f3", name: "apples", checked: false },
  { user: "59f7734fd1a16c0012dd20f3", name: "bananas", checked: false },
  { user: "59f7734fd1a16c0012dd20f3", name: "chicken", checked: true },
  { user: "59f7734fd1a16c0012dd20f3", name: "pasta", checked: false },
  { user: "59f7734fd1a16c0012dd20f1", name: "pasta", checked: false }
]

function seedGroceryData() {
  return Grocery.insertMany(seedData);
}

// function to clear database
function clearDB() {
  return Grocery.remove({})
}

describe('Groceries Routes', function() {
  before(function() {
   return runServer()
   .then(function() {
     return clearDB()
   });
  });

  beforeEach(function() {
    return seedGroceryData();
  });

  afterEach(function() {
    return clearDB();
  });

  after(function() {
    return closeServer();
  })

  it('GET requests to /groceries should return all groceries for the user', function() {
    return chai.request(app)
      .get('/groceries')
      .send( {user: "59f7734fd1a16c0012dd20f3"} )
      .then(function(res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.groceries.should.have.lengthOf(4);
      });
  });

  it('POST request to /groceries/add should respond with the new grocery item', function() {
    const newGrocery = {name: "candy canes", user: "59f7734fd1a16c0012dd20f3"}

    return chai.request(app)
      .post('/groceries/add')
      .send(newGrocery)
      .then(function(res) {
        res.should.have.status(201);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.include.keys('id', 'name', 'user', 'checked');
        res.body.name.should.equal(newGrocery.name);
        res.body.user.should.equal(newGrocery.user);
        // because Mongo should have created id on insertion
        res.body.id.should.not.be.null;
        return Grocery.findById(res.body.id);
      })
      .then(function(grocery) {
        grocery.name.should.equal(newGrocery.name);
        grocery.checked.should.equal(false);
      });
  });

  it('POST requests to /groceries/:id should remove grocery item and respond with 204', function() {
    let grocery;

    return Grocery
      .findOne()
      .then(function(_grocery) {
        grocery = _grocery;
        return chai.request(app)
        .post(`/groceries/${grocery.id}`)
      })
      .then(function(res) {
        res.should.have.status(204);
        return Grocery.findById(grocery.id);
      })
      .then(function(_grocery) {
        should.not.exist(_grocery);
      });
  });

});

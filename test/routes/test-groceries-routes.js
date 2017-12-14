const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const {JWT_SECRET} = require('../../config/config');
const {app, runServer, closeServer} = require('../../server');
const Grocery = require('../../models/grocery');
const User = require('../../models/user');

const should = chai.should();
chai.use(chaiHttp);

// grocery data
const seedData = [
  { user: "59f7734fd1a16c0012dd20f3", name: "apples", checked: false },
  { user: "59f7734fd1a16c0012dd20f3", name: "bananas", checked: false },
  { user: "59f7734fd1a16c0012dd20f3", name: "chicken", checked: true },
  { user: "59f7734fd1a16c0012dd20f3", name: "pasta", checked: false },
  { user: "59f7734fd1a16c0012dd20f1", name: "pasta", checked: false }
]
// new user data
let userId;
const email = 'john@gmail.com';
const password = 'fakepassword123';
const firstName = 'john';
const lastName = 'smith';

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
    algorithm: 'HS256',
    subject: email,
    expiresIn: '7d'
  }
);

function seedGroceryData() {
  return Grocery.insertMany(seedData);
}

// function to clear database
function clearDB() {
  return Grocery.remove({})
  .then(function() {
    return User.remove({})
  })
}

describe('Groceries Routes', function() {
  before(function() {
   return runServer(databaseUrl='mongodb://localhost/simply-planned-test')
   .then(function() {
     return clearDB()
   });
  });

  beforeEach(function() {
    return seedGroceryData()
    .then(function() {
      return User.hashPassword(password).then(password =>
        User.create({
          email,
          password,
          firstName,
          lastName
        })
        .then(function (res) {
          userId = res.id;
        })
      );
    });
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
      .set('authorization', `Bearer ${token}`)
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
      .set('authorization', `Bearer ${token}`)
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
        .set('authorization', `Bearer ${token}`)
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

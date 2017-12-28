const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');

const { JWT_SECRET } = require('../../config/config');
const { app, runServer, closeServer } = require('../../server');
const Grocery = require('../../models/grocery');
const User = require('../../models/user');

chai.use(chaiHttp);

// new user data
let token;
let userID;
const email = 'john@gmail.com';
const password = 'fakepassword123';
const firstName = 'john';
const lastName = 'smith';

// generate grocery data with userID
function generateSeedData(userID) {
  return [
    { user: userID, name: 'apples', checked: false },
    { user: userID, name: 'bananas', checked: false },
    { user: userID, name: 'chicken', checked: true },
    { user: userID, name: 'pasta', checked: false },
    // this should be different to test only getting current user groceries
    { user: '59f7734fd1a16c0012dd20f1', name: 'pasta', checked: false }
  ];
}

let groceriesInDB;

// create token with userID
function createToken(userID) {
  return jwt.sign(
    {
      user: {
        id: userID,
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
}


// clear database collections
function clearDB() {
  return Grocery.remove({})
    .then(() => {
      return User.remove({});
    });
}

describe('Groceries Routes', () => {
  before(() => {
    return runServer(databaseUrl='mongodb://localhost/simply-planned-test')
      .then(() => {
        return clearDB()
      });
  });

  beforeEach(() => {
    return User.hashPassword(password)
      .then((password) => {
        return User.create({
          email,
          password,
          firstName,
          lastName
        })
          .then((res) => {
            // save id for token and grocery seeding
            return userID = res.id;
          })
          .then((userID) => {
            token = createToken(userID);
            const seedData = generateSeedData(userID);
            return Grocery.insertMany(seedData);
          })
          .then((groceries) => {
            // save groceries for access in update test
            groceriesInDB = groceries;
          });
      });
  });

  afterEach(() => {
    return clearDB();
  });

  after(() => {
    return closeServer();
  });

  it('GET requests to /groceries should return all groceries for the user', () => {
    return chai.request(app)
      .get('/groceries')
      .set('authorization', `Bearer ${token}`)
      .then((res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.body.groceries.should.have.lengthOf(4);
      });
  });

  it('POST request to /groceries/add should respond with the new grocery item', () => {
    const newGrocery = { itemName: 'candy canes' };

    return chai.request(app)
      .post('/groceries/add')
      .set('authorization', `Bearer ${token}`)
      .send(newGrocery)
      .then((res) => {
        res.should.have.status(201);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.include.keys('id', 'name', 'checked');
        res.body.name.should.equal(newGrocery.itemName);
        // because Mongo should have created id on insertion
        res.body.id.should.not.be.null;
        return Grocery.findById(res.body.id);
      })
      .then((grocery) => {
        grocery.name.should.equal(newGrocery.itemName);
        grocery.checked.should.equal(false);
      });
  });

  it('POST requests to /groceries/update should update the grocery item checked field', () => {
    return chai.request(app)
      .post('/groceries/update')
      .set('authorization', `Bearer ${token}`)
      .send({
        itemID: groceriesInDB[0]._id,
        checked: groceriesInDB[0].checked
      })
      .then((res) => {
        res.should.have.status(201);
        res.body.checked.should.equal(!groceriesInDB[0].checked);
      });
  });

  it('POST requests to /groceries/delete should remove grocery items with checked = true and respond with 204', () => {
    return chai.request(app)
      .post('/groceries/delete')
      .set('authorization', `Bearer ${token}`)
      .then((res) => {
        res.should.have.status(204);
        return Grocery.find({ user: userID });
      })
      .then((groceries) => {
        groceries.should.have.lengthOf(3);
      });
  });
});

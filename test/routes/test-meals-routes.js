const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');

const { JWT_SECRET } = require('../../config/config');
const { app, runServer, closeServer } = require('../../server');
const Meal = require('../../models/meal');
const User = require('../../models/user');

chai.use(chaiHttp);


// new user data
let token;
let userID;
const email = 'john@gmail.com';
const password = 'fakepassword123';
const firstName = 'john';
const lastName = 'smith';

// generate seed data
function generateSeedData(userID) {
  return [
    {
      user: userID,
      date: '2017-12-03',
      breakfast: 'oatmeal',
      lunch: 'grilled chicken salad',
      dinner: 'burger and sweet potato fries'
    },
    {
      user: userID,
      date: '2017-12-04',
      breakfast: 'cereal',
      lunch: 'turkey and cheese wrap',
      dinner: 'pasta and red sauce with veggies'
    },
    {
      user: userID,
      date: '2017-12-05',
      breakfast: 'eggs and potatoes',
      lunch: 'spinach and pear salad',
      dinner: 'pork chops and veggies'
    },
    {
      user: userID,
      date: '2017-12-06'
    },
    {
      user: userID,
      date: '2017-12-07',
      breakfast: 'eggs and toast',
      lunch: 'turkey sub and fries',
      dinner: 'grilled cheese and soup'
    },
    {
      user: userID,
      date: '2017-12-08',
      breakfast: 'cereal',
      lunch: 'ham and swiss wrap',
      dinner: 'chicken fingers and sweet potato fries'
    },
    {
      user: userID,
      date: '2017-12-09',
      breakfast: 'oatmeal with bananas and walnuts',
      lunch: 'cobb salad',
      dinner: 'turkey and mashed potatoes'
    },
    // same user, out of date range for testing get request for the weeks meals
    {
      user: userID,
      date: '2017-12-25',
      breakfast: 'cereal',
      lunch: 'grilled cheese',
      dinner: 'burger and fries'
    },
    // different user to test that get request only gets meals for the current user
    {
      user: '59f7734fd1a16c0012dd20f3',
      date: '2017-12-09',
      breakfast: 'oatmeal with blueberries',
      lunch: 'fruit salad',
      dinner: 'steak and potatoes'
    }
  ];
}

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

// function to clear database
function clearDB() {
  return Meal.remove({})
    .then(() => {
      return User.remove({});
    });
}

describe('Meals Routes', () => {
  before(() => {
    return runServer(databaseUrl = 'mongodb://localhost/simply-planned-test')
      .then(() => {
        return clearDB();
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
            return userID = res.id;
          })
          .then(() => {
            return token = createToken(userID);
          })
          .then(() => {
            return generateSeedData(userID);
          })
          .then((seedData) => {
            return Meal.insertMany(seedData);
          });
      });
  });

  afterEach(() => {
    return clearDB();
  });

  after(() => {
    return closeServer();
  });

  it('GET requests to /meals should respond with meals between query startDate and endDate for the current user', () => {
    return chai.request(app)
      .get('/meals?startDate=2017-12-03&endDate=2017-12-09')
      .set('authorization', `Bearer ${token}`)
      .then((res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.body.meals.should.have.lengthOf(7);
      });
  });

  it('POST requests to /meals/update should update meal', () => {
    const updateData = {
      date: '2017-12-03',
      mealName: 'breakfast',
      mealItem: 'chocolate chip pancakes'
    };

    return chai.request(app)
      .post('/meals/update')
      .set('authorization', `Bearer ${token}`)
      .send(updateData)
      .then((res) => {
        res.should.have.status(201);
        return Meal.find({ user: userID, date: '2017-12-03' });
      })
      .then((meal) => {
        meal[0].breakfast.should.equal(updateData.mealItem);
      });
  });
});

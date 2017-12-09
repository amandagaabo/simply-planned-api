const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const {JWT_SECRET} = require('../../config/config');
const {app, runServer, closeServer} = require('../../server');
const Meal = require('../../models/meal');
const User = require('../../models/user');

const should = chai.should();
chai.use(chaiHttp);

const seedData = [
  {
    user: "59f7734fd1a16c0012dd20f3",
    date: "2017-12-03",
    breakfast: "oatmeal",
    lunch: "grilled chicken salad",
    dinner: "burger and sweet potato fries"
  },
  {
    user: "59f7734fd1a16c0012dd20f3",
    date: "2017-12-04",
    breakfast: "cereal",
    lunch: "turkey and cheese wrap",
    dinner: "pasta and red sauce with veggies"
  },
  {
    user: "59f7734fd1a16c0012dd20f3",
    date: "2017-12-05",
    breakfast: "eggs and potatoes",
    lunch: "spinach and pear salad",
    dinner: "pork chops and veggies"
  },
  {
    user: "59f7734fd1a16c0012dd20f3",
    date: "2017-12-06"
  },
  {
    user: "59f7734fd1a16c0012dd20f3",
    date: "2017-12-07",
    breakfast: "eggs and toast",
    lunch: "turkey sub and fries",
    dinner: "grilled cheese and soup"
  },
  {
    user: "59f7734fd1a16c0012dd20f3",
    date: "2017-12-08",
    breakfast: "cereal",
    lunch: "ham and swiss wrap",
    dinner: "chicken fingers and sweet potato fries"
  },
  {
    user: "59f7734fd1a16c0012dd20f3",
    date: "2017-12-09",
    breakfast: "oatmeal with bananas and walnuts",
    lunch: "cobb salad",
    dinner: "turkey and mashed potatoes"
  }
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


function seedMealData() {
  return Meal.insertMany(seedData);
}

// function to clear database
function clearDB() {
  return Meal.remove({})
  .then(function() {
    return User.remove({})
  })
}

describe('Meals Routes', function() {
  before(function() {
   return runServer()
   .then(function() {
     return clearDB()
   });
  });

  beforeEach(function() {
    return seedMealData()
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

  it('GET requests to /meals should respond with meals between query startDate and endDate', function() {
    return chai.request(app)
      .get('/meals?startDate=2017-12-03&endDate=2017-12-09')
      .set('authorization', `Bearer ${token}`)
      .send( {user: "59f7734fd1a16c0012dd20f3"} )
      .then(function(res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.meals.should.have.lengthOf(7);
      });
  });

  it('POST requests to /meals/:id should update meal', function() {
    const updateData = {
        breakfast: 'chocolate chip pancakes'
      };

    return Meal
      .findOne()
      .then(function(meal) {
        updateData.id = meal.id;

        return chai.request(app)
          .post(`/meals/${meal.id}`)
          .set('authorization', `Bearer ${token}`)
          .send(updateData);
      })
      .then(function(res) {
        res.should.have.status(204);

        return Meal.findById(updateData.id);
      })
      .then(function(meal) {
        meal.breakfast.should.equal(updateData.breakfast);
      });
  });

});

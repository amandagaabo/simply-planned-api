require('dotenv').config();
const mongoose = require('mongoose');
const { DATABASE_URL } = require('../config/config');
const Grocery = require('../models/grocery');
const User = require('../models/user');
const Meal = require('../models/meal');

// make Mongoose use built in es6 promises
mongoose.Promise = global.Promise;

// connect to database
mongoose.connect(DATABASE_URL, { useMongoClient: true }, (err) => {
  if (err) {
    throw err;
  }
  console.log('connected to database');

  // setup data
  const groceries = [
    { user: '59f7734fd1a16c0012dd20f3', name: 'apples', checked: false },
    { user: '59f7734fd1a16c0012dd20f3', name: 'bananas', checked: false },
    { user: '59f7734fd1a16c0012dd20f3', name: 'chicken', checked: true },
    { user: '59f7734fd1a16c0012dd20f3', name: 'pasta', checked: false }
  ];

  const meals = [
    {
      user: '59f7734fd1a16c0012dd20f3',
      date: '2017-12-03',
      breakfast: 'oatmeal',
      lunch: 'grilled chicken salad',
      dinner: 'burger and sweet potato fries'
    },
    {
      user: '59f7734fd1a16c0012dd20f3',
      date: '2017-12-04',
      breakfast: 'cereal',
      lunch: 'turkey and cheese wrap',
      dinner: 'pasta and red sauce with veggies'
    },
    {
      user: '59f7734fd1a16c0012dd20f3',
      date: '2017-12-05',
      breakfast: 'eggs and potatoes',
      lunch: 'spinach and pear salad',
      dinner: 'pork chops and veggies'
    },
    {
      user: '59f7734fd1a16c0012dd20f3',
      date: '2017-12-06'
    },
    {
      user: '59f7734fd1a16c0012dd20f3',
      date: '2017-12-07',
      breakfast: 'eggs and toast',
      lunch: 'turkey sub and fries',
      dinner: 'grilled cheese and soup'
    },
    {
      user: '59f7734fd1a16c0012dd20f3',
      date: '2017-12-08',
      breakfast: 'cereal',
      lunch: 'ham and swiss wrap',
      dinner: 'chicken fingers and sweet potato fries'
    },
    {
      user: '59f7734fd1a16c0012dd20f3',
      date: '2017-12-09',
      breakfast: 'oatmeal with bananas and walnuts',
      lunch: 'cobb salad',
      dinner: 'turkey and mashed potatoes'
    }
  ];

  const users = [
    {
      email: 'john@gmail.com',
      password: 'fakepassword123',
      firstName: 'john',
      lastName: 'smith'
    },
    {
      email: 'sally@gmail.com',
      password: 'fakepassword123',
      firstName: 'sally',
      lastName: 'johnson'
    }
  ];


  User.remove({})
    .then(() => {
      return Meal.remove({});
    })
    .then(() => {
      return Grocery.remove({});
    })
    .then(() => {
      // add new users
      return User.create(users);
    })
    .then(() => {
      // find a user id
      return User.findOne()
        .then((user) => {
          // change user ids to one that was added to the db
          groceries.map(grocery => grocery.user = user._id);
          meals.map(meal => meal.user = user._id);

          // add new groceries
          return Grocery.create(groceries);
        });
    })
    .then(() => {
      // add new meals
      return Meal.create(meals);
    })
    .then(() => {
      // exit script, return zero to say it worked with no errors
      process.exit(0);
    });
});

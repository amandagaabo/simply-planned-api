require('dotenv').config();
const mongoose = require('mongoose');
const {DATABASE_URL} = require('../config/config');
const Grocery = require('../models/grocery');
// const User = require('../models/user');
// const Meal = require('../models/meal');

// make Mongoose use built in es6 promises
mongoose.Promise = global.Promise

// connect to database
mongoose.connect(DATABASE_URL, {useMongoClient: true}, err => {
  if (err) {
    throw err
  }
  console.log('connected to database')

// setup data
  const groceries = [
    { user: "59f7734fd1a16c0012dd20f3", name: "apples", checked: false },
    { user: "59f7734fd1a16c0012dd20f3", name: "bananas", checked: false },
    { user: "59f7734fd1a16c0012dd20f3", name: "chicken", checked: true },
    { user: "59f7734fd1a16c0012dd20f3", name: "pasta", checked: false }
  ]

// save to database
  // empty database grocery and meal collections
  Grocery.remove({})
    // .then(() => {
    //   return Meal.remove({})
    // })
    .then(() => {
      // add new groceries
      return Grocery.create(groceries)
    })
    // .then(() => {
    //   // add new meals
    //   return Meal.create(meals)
    // })
    .then(() => {
      console.log('database seeded')
      // exit script, return zero to say it worked with no errors
      process.exit(0)
    })
})

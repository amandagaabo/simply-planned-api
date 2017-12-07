const Meal = require('../models/meal');

exports.mealsPage = function (req, res) {
  res.status(200).json({message: '/meals route connected'})
};

exports.update = function (req, res) {
  res.status(200).json({message: '/meals update route connected'})
};

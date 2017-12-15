const Meal = require('../models/meal');

exports.mealsPage = function (req, res) {
  Meal
  .find({
    user: req.user.id,
    date: {
      $gte: req.query.startDate,
      $lte: req.query.endDate
    }
  })
  .sort({date: 1})
  .then(meals => {
    console.log('meals found:', meals)
    res.status(200).json( {meals} )
  }).catch(err => {
    console.error(err);
    res.status(500).json({message: 'Internal server error'});
  });

};

exports.update = function (req, res) {
  const toUpdate = {};
  const updateableFields = ['breakfast', 'lunch', 'dinner'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  Meal
    .findByIdAndUpdate(req.params.id, {$set: toUpdate})
    .then(meal => {
      res.status(204).json({meal})
    }).catch(err => {
      res.status(500).json({message: 'Internal server error'})
    });
};

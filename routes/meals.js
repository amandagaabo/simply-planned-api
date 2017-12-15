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
    res.status(200).json( {meals} )
  }).catch(err => {
    console.error(err);
    res.status(500).json({message: 'Internal server error'});
  });
};

exports.update = function (req, res) {
  const user = req.user.id;
  const date = req.body.date;
  const mealName = req.body.mealName;
  const mealItem = req.body.mealItem;

  Meal
    .find({user, date})
    .then( meal => {
      if (meal.length === 1) {
        meal[0][mealName] = mealItem;
        return meal[0].save()
      }
      else if (meal.length === 0) {
        return Meal
        .create({
          user,
          date,
          [mealName]: mealItem
        })
      }
    })
    .then( meal => {
      res.status(201).json({meal})
    }).catch(err => {
      res.status(500).json({message: 'Internal server error'})
    });
};

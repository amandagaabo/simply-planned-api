const Meal = require('../models/meal');

exports.mealsPage = (req, res) => {
  Meal
    .find({
      user: req.user.id,
      date: {
        $gte: req.query.startDate,
        $lte: req.query.endDate
      }
    })
    .sort({ date: 1 })
    .then((meals) => {
      res.status(200).json({ meals });
    }).catch((err) => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
};

exports.update = (req, res) => {
  const user = req.user.id;
  const { date, mealName, mealItem } = req.body;

  Meal
    .findOne({ user, date })
    .then((meal) => {
      // if meal exists, update it
      if (meal) {
        meal[mealName] = mealItem;
        return meal.save();
      }
      // if a meal is not found, create a new one
      return Meal
        .create({
          user,
          date,
          [mealName]: mealItem
        });
    })
    .then((meal) => {
      res.status(201).json({ meal });
    }).catch(() => {
      res.status(500).json({ message: 'Internal server error' });
    });
};

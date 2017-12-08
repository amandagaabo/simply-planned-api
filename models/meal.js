const mongoose = require('mongoose');

// setup schema
const mealSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    required: true
  },
  date: Date,
  breakfast: String,
  lunch: String,
  dinner: String
});

// setup mongoose model
const Meal = mongoose.model('Meal', mealSchema);

// export model
module.exports = Meal;

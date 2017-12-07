const mongoose = require('mongoose');

// setup schema
const grocerySchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    required: true
  },
  name: String,
  checked: Boolean
});

// setup mongoose model
const Grocery = mongoose.model('Grocery', grocerySchema);

// export model
module.exports = Grocery;

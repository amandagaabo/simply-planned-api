const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

// setup schema
const grocerySchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  checked: {
    type: Boolean,
    default: false
  }
});

// setup api representation
grocerySchema.methods.apiRepr = function() {
  return {
    id: this._id,
    name: this.name,
    checked: this.checked
  };
}

// setup mongoose model
const Grocery = mongoose.model('Grocery', grocerySchema);

// export model
module.exports = Grocery

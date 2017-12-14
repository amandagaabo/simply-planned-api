const Grocery = require('../models/grocery');

exports.list = function (req, res) {
  const user = req.user.id

  Grocery
  .find( {user} )
  .then(_groceries => {
    const groceries = _groceries.map(grocery => grocery.apiRepr())

    res.status(200).json( {groceries} )
  }).catch(err => {
    console.error(err);
    res.status(500).json({message: 'Internal server error'});
  });

};

exports.create = function (req, res) {
  const user = req.user.id;
  const name = req.body.itemName;
  const checked = false;

  Grocery
  .create({
    user,
    name,
    checked
  })
  .then( grocery => {
    res.status(201).json( grocery.apiRepr() )
  }).catch(err => {
    console.error(err);
    res.status(500).json({message: 'Internal server error'});
  });
};

exports.delete = function (req, res) {
  Grocery
  .findByIdAndRemove(req.params.id)
  .then(grocery => {
    res.status(204).end()
  }).catch(err => {
    res.status(500).json({message: 'Internal server error'})
  });
};

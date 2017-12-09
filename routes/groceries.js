const Grocery = require('../models/grocery');

exports.list = function (req, res) {
  Grocery
  .find( {user: req.body.user} )
  .then(groceries => {
    res.status(200).json( {groceries} )
  }).catch(err => {
    console.error(err);
    res.status(500).json({message: 'Internal server error'});
  });

};

exports.create = function (req, res) {
  Grocery
  .create({
    user: req.body.user,
    name: req.body.name
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

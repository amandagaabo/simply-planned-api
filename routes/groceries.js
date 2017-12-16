const Grocery = require('../models/grocery');

exports.list = function (req, res) {
  const user = req.user.id
  console.log('user id from req', user)

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


exports.update = function (req, res) {
  const itemID = req.body.itemID;
  const checked = !req.body.checked;

  Grocery
  .findById(itemID)
  .then( grocery => {
    grocery.checked = checked;
    return grocery.save()
  })
  .then( grocery => {
    res.status(201).json( grocery.apiRepr() )
  }).catch(err => {
    console.error(err);
    res.status(500).json({message: 'Internal server error'});
  });
};

exports.delete = function (req, res) {
  const userID = req.user.id

  Grocery
  .remove({user: userID, checked: true})
  .then(() => {
    res.status(204).json({message: 'checked items removed'})
  }).catch(err => {
    res.status(500).json({message: 'Internal server error'})
  });
};

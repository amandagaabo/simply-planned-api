// bring in model here once it exists

exports.list = function (req, res) {
  res.status(200).json({message: '/groceries route connected'})
};

exports.create = function (req, res) {
  res.status(200).json({message: '/groceries create route connected'})
};

exports.delete = function (req, res) {
  res.status(200).json({message: '/groceries delete route connected'})
};

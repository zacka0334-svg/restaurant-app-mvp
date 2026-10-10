const mongoose = require('mongoose');

// Stops a bad id like /api/menu/abc before it reaches the database,
// so the server answers 400 instead of crashing.
function validateId(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: `"${req.params.id}" is not a valid id` });
  }
  next();
}

module.exports = validateId;

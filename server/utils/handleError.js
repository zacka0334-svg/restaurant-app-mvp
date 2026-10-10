// One place that turns errors into the right HTTP status code.
function handleError(res, error) {
  // Mongoose schema rules failed (required, min, enum, ...)
  if (error.name === 'ValidationError') {
    const message = Object.values(error.errors).map((e) => e.message).join(' ');
    return res.status(400).json({ message });
  }
  // A value had the wrong type, e.g. a bad id or "abc" as price
  if (error.name === 'CastError') {
    return res.status(400).json({ message: `Invalid value for ${error.path}` });
  }
  // Unique index broken, e.g. same email or table number twice
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue || {})[0] || 'field';
    return res.status(409).json({ message: `This ${field} already exists` });
  }
  console.error(error);
  return res.status(500).json({ message: 'Server error, please try again' });
}

module.exports = handleError;

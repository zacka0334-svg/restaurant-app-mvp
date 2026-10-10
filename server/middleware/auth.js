const jwt = require('jsonwebtoken');
const User = require('../models/User');

// protect: the request must carry "Authorization: Bearer <token>".
// If the token is valid, the logged-in user is put in req.user.
async function protect(req, res, next) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // throws if fake or expired
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'User no longer exists' });
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token is invalid or expired' });
  }
}

// managerOnly: use after protect. Lets only managers through.
function managerOnly(req, res, next) {
  if (req.user && req.user.role === 'manager') return next();
  return res.status(403).json({ message: 'Only a manager can do this' });
}

module.exports = { protect, managerOnly };

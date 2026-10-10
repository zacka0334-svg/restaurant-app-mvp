const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const handleError = require('../utils/handleError');

const PASSWORD_REGEX = /^(?=.*\d).{8,}$/; // at least 8 characters with a digit

function makeToken(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
}

// Only the safe fields go back to the app (never the password).
function publicUser(user) {
  return { id: user._id, fullName: user.fullName, email: user.email, role: user.role };
}

// POST /api/auth/register
async function register(req, res) {
  try {
    const { fullName, email, password, role } = req.body || {};
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Full name, email and password are required' });
    }
    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({ message: 'Password must be at least 8 characters and contain a digit' });
    }
    if (role && !['customer', 'manager'].includes(role)) {
      return res.status(400).json({ message: 'Role must be customer or manager' });
    }
    const exists = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (exists) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }
    const hashed = await bcrypt.hash(password, 10); // never store the plain password
    const user = await User.create({ fullName, email, password: hashed, role: role || 'customer' });
    return res.status(201).json({ token: makeToken(user), user: publicUser(user) });
  } catch (error) {
    return handleError(res, error);
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    // +password: the hash is hidden by default, we need it here to compare
    const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select('+password');
    const ok = user && (await bcrypt.compare(password, user.password));
    if (!ok) {
      return res.status(401).json({ message: 'Incorrect email or password' });
    }
    return res.status(200).json({ token: makeToken(user), user: publicUser(user) });
  } catch (error) {
    return handleError(res, error);
  }
}

// GET /api/auth/me  (protected) - who am I?
async function me(req, res) {
  return res.status(200).json({ user: publicUser(req.user) });
}

module.exports = { register, login, me };

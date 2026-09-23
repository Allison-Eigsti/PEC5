const bcrypt = require('bcryptjs');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { clearAuthCookie, setAuthCookie, signToken } = require('../utils/token');

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function validateRegistration({ name, email, password }) {
  const normalizedName = String(name || '').trim();
  const normalizedEmail = normalizeEmail(email);
  const plainPassword = String(password || '');

  if (normalizedName.length < 2 || normalizedName.length > 80) {
    throw new AppError('Name must be between 2 and 80 characters.', 400);
  }

  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
    throw new AppError('Please provide a valid email address.', 400);
  }

  if (plainPassword.length < 8 || plainPassword.length > 72) {
    throw new AppError('Password must be between 8 and 72 characters.', 400);
  }

  return {
    name: normalizedName,
    email: normalizedEmail,
    password: plainPassword,
  };
}

async function register(req, res) {
  const { name, email, password } = validateRegistration(req.body);
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new AppError('An account with that email already exists.', 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash });
  const token = signToken(user._id);

  setAuthCookie(res, token);
  res.status(201).json({ user: User.toSafeUser(user) });
}

async function login(req, res) {
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || '');

  if (!email || !password) {
    throw new AppError('Email and password are required.', 400);
  }

  const user = await User.findOne({ email }).select('+passwordHash');
  const passwordMatches = user ? await bcrypt.compare(password, user.passwordHash) : false;

  if (!user || !passwordMatches) {
    throw new AppError('Invalid email or password.', 401);
  }

  const token = signToken(user._id);

  setAuthCookie(res, token);
  res.json({ user: User.toSafeUser(user) });
}

function logout(req, res) {
  clearAuthCookie(res);
  res.json({ message: 'You have been logged out.' });
}

function me(req, res) {
  res.json({ user: User.toSafeUser(req.user) });
}

module.exports = { login, logout, me, register };

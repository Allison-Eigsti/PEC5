const jwt = require('jsonwebtoken');

const TOKEN_COOKIE = 'pec5_token';
const DEFAULT_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured on the server.');
  }

  return process.env.JWT_SECRET;
}

function signToken(userId) {
  return jwt.sign(
    { sub: String(userId) },
    getJwtSecret(),
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      issuer: 'pec5-api',
      audience: 'pec5-web',
    },
  );
}

function verifyToken(token) {
  return jwt.verify(token, getJwtSecret(), {
    issuer: 'pec5-api',
    audience: 'pec5-web',
  });
}

function getCookieOptions() {
  const configuredSameSite = (process.env.COOKIE_SAME_SITE || 'lax').toLowerCase();
  const sameSite = ['lax', 'strict', 'none'].includes(configuredSameSite)
    ? configuredSameSite
    : 'lax';

  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' || sameSite === 'none',
    sameSite,
    path: '/',
  };
}

function setAuthCookie(res, token) {
  res.cookie(TOKEN_COOKIE, token, {
    ...getCookieOptions(),
    maxAge: DEFAULT_MAX_AGE,
  });
}

function clearAuthCookie(res) {
  const { path } = getCookieOptions();
  res.clearCookie(TOKEN_COOKIE, { path });
}

module.exports = {
  TOKEN_COOKIE,
  clearAuthCookie,
  setAuthCookie,
  signToken,
  verifyToken,
};

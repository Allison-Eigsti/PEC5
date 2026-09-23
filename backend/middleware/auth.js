const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { TOKEN_COOKIE, verifyToken } = require('../utils/token');

async function resolveUserFromRequest(req) {
  const token = req.cookies?.[TOKEN_COOKIE];

  if (!token) {
    return null;
  }

  let payload;

  try {
    payload = verifyToken(token);
  } catch {
    return null;
  }

  if (!payload.sub) {
    return null;
  }

  try {
    return await User.findById(payload.sub);
  } catch {
    return null;
  }
}

const requireAuth = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.[TOKEN_COOKIE];

  if (!token) {
    throw new AppError('You must be signed in to do that.', 401);
  }

  let payload;

  try {
    payload = verifyToken(token);
  } catch {
    throw new AppError('Your session is invalid or has expired.', 401);
  }

  let user;

  try {
    user = await User.findById(payload.sub);
  } catch {
    throw new AppError('Your session is invalid or has expired.', 401);
  }

  if (!user) {
    throw new AppError('The user for this session no longer exists.', 401);
  }

  req.user = user;
  next();
});

const optionalAuth = asyncHandler(async (req, res, next) => {
  req.user = await resolveUserFromRequest(req);
  next();
});

module.exports = { optionalAuth, requireAuth };

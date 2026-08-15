const ApiError = require('../utils/apiError.js');
const asyncHandler = require('../utils/asyncHandler.js');
const { verifyToken } = require('../utils/jwt.js');
const User = require('../models/user.model.js');

const authMiddleware = asyncHandler(async (req, res, next) => {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.token) {
    token = req.headers.token;
  }
  

  if (!token) {
    throw new ApiError(401, 'Authentication token missing');
  }

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new ApiError(401, 'User associated with token no longer exists');
    }

    if (user.isDeleted) {
      throw new ApiError(403, 'Account has been deactivated');
    }

    if (user.isBlocked) {
      throw new ApiError(403, 'Account has been blocked by administrator');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(401, 'Invalid or expired token');
  }
});

module.exports = authMiddleware;

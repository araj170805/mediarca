const mongoose = require('mongoose');

/**
 * Middleware that checks if MongoDB is connected before allowing
 * write operations. Returns a clean 503 response instead of an
 * unhandled Mongoose MongoServerSelectionError (500).
 */
const requireDB = (req, res, next) => {
  const state = mongoose.connection.readyState;
  // 1 = connected, 2 = connecting
  if (state === 1 || state === 2) {
    return next();
  }

  return res.status(503).json({
    success: false,
    statusCode: 503,
    message: 'Database is currently unreachable. Please try again shortly.',
    errors: [],
  });
};

module.exports = requireDB;

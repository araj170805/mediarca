const ApiError = require('../utils/apiError.js');

const errorHandler = (err, req, res, next) => {
  let error = err;


  if (err.name === 'MongoServerSelectionError' || err.name === 'MongoNetworkError') {
    error = new ApiError(
      503,
      'Database is currently unreachable. Please try again in a moment.',
      [],
      err.stack
    );
  }

  // MongooseError — generic Mongoose error
  else if (err.name === 'MongooseError') {
    error = new ApiError(503, 'Database error. Please try again.', [], err.stack);
  }

  // Mongoose CastError — invalid ObjectId
  else if (err.name === 'CastError') {
    error = new ApiError(400, `Invalid ${err.path}: ${err.value}`, [], err.stack);
  }

  // Mongoose ValidationError — schema validation
  else if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    error = new ApiError(400, messages.join('. '), messages, err.stack);
  }

  // MongoDB duplicate key error (11000)
  else if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {}).join(', ');
    error = new ApiError(400, `Duplicate value for field: ${field}. Please use a different value.`, [], err.stack);
  }

  // JWT Errors
  else if (err.name === 'JsonWebTokenError') {
    error = new ApiError(401, 'Invalid token. Please login again.', [], err.stack);
  } else if (err.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Session expired. Please login again.', [], err.stack);
  }

  // Wrap any other non-ApiError
  else if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, [], err.stack);
  }

  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors || [],
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  };

  return res.status(error.statusCode).json(response);
};

module.exports = errorHandler;

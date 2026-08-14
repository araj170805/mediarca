const ApiError = require('../utils/apiError.js');

const validateRequest = (schema) => {
  return (req, res, next) => {
    if (!schema) return next();

    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      const errorMessages = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
      return next(new ApiError(400, 'Validation Error', errorMessages));
    }

    next();
  };
};

module.exports = validateRequest;

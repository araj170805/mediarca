const asyncHandler = require('../utils/asyncHandler.js');
const ApiResponse = require('../utils/apiResponse.js');
const GoogleAuthService = require('../services/googleAuth.service.js');
const ApiError = require('../utils/apiError.js');

/**
 * POST /api/v1/auth/google/patient
 * Body: { idToken: "<Firebase ID token from Google sign-in>" }
 *
 * Signs in or creates a patient account using Google.
 */
const googlePatientAuth = asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    throw new ApiError(400, 'Firebase ID token is required');
  }

  const result = await GoogleAuthService.googlePatientAuth(idToken);

  const statusCode = result.isNewUser ? 201 : 200;
  const message = result.isNewUser
    ? 'Patient account created and signed in via Google successfully'
    : 'Signed in via Google successfully';

  res.status(statusCode).json(new ApiResponse(statusCode, result, message));
});

/**
 * POST /api/v1/auth/google/admin/verify
 * Body: { idToken: "<Firebase ID token from Google sign-in>" }
 *
 * Verifies admin identity via Google. Only works if the Google email
 * belongs to an existing admin account. Does NOT create new admins.
 */
const googleAdminVerification = asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    throw new ApiError(400, 'Firebase ID token is required');
  }

  const result = await GoogleAuthService.googleAdminVerification(idToken);

  res.status(200).json(new ApiResponse(200, result, result.message));
});

/**
 * POST /api/v1/auth/google/receptionist
 * Body: { idToken: "<Firebase ID token from Google sign-in>" }
 *
 * Allows an existing receptionist to log in via their Google account
 * (Google email must match their authorized clinic email).
 */
const googleReceptionistAuth = asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    throw new ApiError(400, 'Firebase ID token is required');
  }

  const result = await GoogleAuthService.googleReceptionistAuth(idToken);

  res.status(200).json(new ApiResponse(200, result, 'Receptionist signed in via Google successfully'));
});

module.exports = {
  googlePatientAuth,
  googleAdminVerification,
  googleReceptionistAuth,
};

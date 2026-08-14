const asyncHandler = require('../utils/asyncHandler.js');
const ApiResponse = require('../utils/apiResponse.js');
const AuthService = require('../services/auth.service.js');

const sendOTP = asyncHandler(async (req, res) => {
  const { email, purpose } = req.body;
  const result = await AuthService.sendOTP(email, purpose);
  res.status(200).json(new ApiResponse(200, result, 'OTP sent successfully'));
});

const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp, purpose } = req.body;
  const result = await AuthService.verifyOTP(email, otp, purpose);
  res.status(200).json(new ApiResponse(200, result, 'OTP verified successfully'));
});

const registerPatient = asyncHandler(async (req, res) => {
  const result = await AuthService.registerPatient(req.body);
  res.status(201).json(new ApiResponse(201, result, 'Patient registered successfully'));
});

const registerReceptionist = asyncHandler(async (req, res) => {
  const result = await AuthService.registerReceptionist(req.body);
  res.status(201).json(new ApiResponse(201, result, 'Receptionist registered successfully'));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await AuthService.login({ email, password });
  res.status(200).json(new ApiResponse(200, result, 'Login successful'));
});

const getMe = asyncHandler(async (req, res) => {
  const user = await AuthService.getMe(req.user._id);
  res.status(200).json(new ApiResponse(200, user, 'Profile retrieved successfully'));
});

const setPassword = asyncHandler(async (req, res) => {
  const result = await AuthService.setPassword(req.user._id, req.body);
  res.status(200).json(new ApiResponse(200, result, result.message));
});

module.exports = {
  sendOTP,
  verifyOTP,
  registerPatient,
  registerReceptionist,
  login,
  getMe,
  setPassword,
};

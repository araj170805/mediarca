const asyncHandler = require('../utils/asyncHandler.js');
const ApiResponse = require('../utils/apiResponse.js');
const UserService = require('../services/user.service.js');

const updateProfile = asyncHandler(async (req, res) => {
  const user = await UserService.updateProfile(req.user._id, req.body);
  res.status(200).json(new ApiResponse(200, user, 'Profile updated successfully'));
});

const getFamilyMembers = asyncHandler(async (req, res) => {
  const members = await UserService.getFamilyMembers(req.user._id);
  res.status(200).json(new ApiResponse(200, { familyMembers: members }, 'Family members retrieved successfully'));
});

const addFamilyMember = asyncHandler(async (req, res) => {
  const members = await UserService.addFamilyMember(req.user._id, req.body);
  res.status(201).json(new ApiResponse(201, members, 'Family member added successfully'));
});

const updateFamilyMember = asyncHandler(async (req, res) => {
  const { memberId } = req.params;
  const members = await UserService.updateFamilyMember(req.user._id, memberId, req.body);
  res.status(200).json(new ApiResponse(200, members, 'Family member updated successfully'));
});

const deleteFamilyMember = asyncHandler(async (req, res) => {
  const { memberId } = req.params;
  const members = await UserService.deleteFamilyMember(req.user._id, memberId);
  res.status(200).json(new ApiResponse(200, members, 'Family member removed successfully'));
});

// Admin Controllers
const getAllUsers = asyncHandler(async (req, res) => {
  const data = await UserService.getAllUsers(req.query);
  res.status(200).json(new ApiResponse(200, data, 'Users retrieved successfully'));
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await UserService.getUserById(req.params.id);
  res.status(200).json(new ApiResponse(200, user, 'User details retrieved successfully'));
});

const blockUser = asyncHandler(async (req, res) => {
  const user = await UserService.blockUser(req.params.id);
  res.status(200).json(new ApiResponse(200, user, 'User blocked successfully'));
});

const unblockUser = asyncHandler(async (req, res) => {
  const user = await UserService.unblockUser(req.params.id);
  res.status(200).json(new ApiResponse(200, user, 'User unblocked successfully'));
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await UserService.softDeleteUser(req.params.id);
  res.status(200).json(new ApiResponse(200, user, 'User soft-deleted successfully'));
});

module.exports = {
  updateProfile,
  getFamilyMembers,
  addFamilyMember,
  updateFamilyMember,
  deleteFamilyMember,
  getAllUsers,
  getUserById,
  blockUser,
  unblockUser,
  deleteUser,
};

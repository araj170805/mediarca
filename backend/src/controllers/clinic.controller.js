const asyncHandler = require('../utils/asyncHandler.js');
const ApiResponse = require('../utils/apiResponse.js');
const ClinicService = require('../services/clinic.service.js');

const createClinic = asyncHandler(async (req, res) => {
  const clinic = await ClinicService.createClinic(req.body, req.user._id);
  res.status(201).json(new ApiResponse(201, clinic, 'Clinic created successfully'));
});

const updateClinicStatus = asyncHandler(async (req, res) => {
  const clinic = await ClinicService.updateClinicStatus(req.params.id, req.body, req.user._id);
  res.status(200).json(new ApiResponse(200, clinic, 'Clinic status updated successfully'));
});

const getClinicsForAdmin = asyncHandler(async (req, res) => {
  const data = await ClinicService.getClinicsForAdmin(req.query);
  res.status(200).json(new ApiResponse(200, data, 'Admin clinics list retrieved'));
});

const getClinicsPublic = asyncHandler(async (req, res) => {
  const data = await ClinicService.getClinicsPublic(req.query);
  res.status(200).json(new ApiResponse(200, data, 'Clinics retrieved successfully'));
});

const getClinicById = asyncHandler(async (req, res) => {
  const data = await ClinicService.getClinicById(req.params.id);
  res.status(200).json(new ApiResponse(200, data, 'Clinic details retrieved successfully'));
});

const updateOwnClinic = asyncHandler(async (req, res) => {
  const clinic = await ClinicService.updateOwnClinic(req.user.clinicId, req.body);
  res.status(200).json(new ApiResponse(200, clinic, 'Clinic information updated successfully'));
});

module.exports = {
  createClinic,
  updateClinicStatus,
  getClinicsForAdmin,
  getClinicsPublic,
  getClinicById,
  updateOwnClinic,
};

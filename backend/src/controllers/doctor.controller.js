const asyncHandler = require('../utils/asyncHandler.js');
const ApiResponse = require('../utils/apiResponse.js');
const DoctorService = require('../services/doctor.service.js');

const addDoctor = asyncHandler(async (req, res) => {
  const doctor = await DoctorService.addDoctor(req.user.clinicId, req.body);
  res.status(201).json(new ApiResponse(201, doctor, 'Doctor added successfully'));
});

const updateDoctor = asyncHandler(async (req, res) => {
  const doctor = await DoctorService.updateDoctor(req.params.id, req.user.clinicId, req.body);
  res.status(200).json(new ApiResponse(200, doctor, 'Doctor updated successfully'));
});

const toggleDoctorStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const doctor = await DoctorService.toggleDoctorStatus(req.params.id, req.user.clinicId, isActive);
  res.status(200).json(new ApiResponse(200, doctor, 'Doctor status updated successfully'));
});

const getDoctorsByClinic = asyncHandler(async (req, res) => {
  const doctors = await DoctorService.getDoctorsByClinic(req.user.clinicId);
  res.status(200).json(new ApiResponse(200, doctors, 'Clinic doctors retrieved successfully'));
});

const searchDoctors = asyncHandler(async (req, res) => {
  const data = await DoctorService.searchDoctors(req.query);
  res.status(200).json(new ApiResponse(200, data, 'Doctors retrieved successfully'));
});

const getDoctorProfile = asyncHandler(async (req, res) => {
  const data = await DoctorService.getDoctorProfile(req.params.id);
  res.status(200).json(new ApiResponse(200, data, 'Doctor profile retrieved successfully'));
});

module.exports = {
  addDoctor,
  updateDoctor,
  toggleDoctorStatus,
  getDoctorsByClinic,
  searchDoctors,
  getDoctorProfile,
};

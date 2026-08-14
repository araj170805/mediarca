const asyncHandler = require('../utils/asyncHandler.js');
const ApiResponse = require('../utils/apiResponse.js');
const AppointmentWindowService = require('../services/appointmentWindow.service.js');

const createWindow = asyncHandler(async (req, res) => {
  const window = await AppointmentWindowService.createWindow(
    req.user.clinicId,
    req.user._id,
    req.body
  );
  res.status(201).json(new ApiResponse(201, window, 'Appointment window created successfully'));
});

const updateWindowStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const window = await AppointmentWindowService.updateWindowStatus(
    req.params.id,
    req.user.clinicId,
    status
  );
  res.status(200).json(new ApiResponse(200, window, 'Window status updated successfully'));
});

const updateWindow = asyncHandler(async (req, res) => {
  const window = await AppointmentWindowService.updateWindow(
    req.params.id,
    req.user.clinicId,
    req.body
  );
  res.status(200).json(new ApiResponse(200, window, 'Appointment window updated successfully'));
});

const getClinicWindows = asyncHandler(async (req, res) => {
  const data = await AppointmentWindowService.getClinicWindows(req.user.clinicId, req.query);
  res.status(200).json(new ApiResponse(200, data, 'Clinic windows retrieved successfully'));
});

const getDoctorWindows = asyncHandler(async (req, res) => {
  const windows = await AppointmentWindowService.getDoctorWindows(req.params.doctorId);
  res.status(200).json(new ApiResponse(200, windows, 'Doctor windows retrieved successfully'));
});

module.exports = {
  createWindow,
  updateWindowStatus,
  updateWindow,
  getClinicWindows,
  getDoctorWindows,
};

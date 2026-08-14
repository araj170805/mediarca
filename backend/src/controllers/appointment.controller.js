const asyncHandler = require('../utils/asyncHandler.js');
const ApiResponse = require('../utils/apiResponse.js');
const AppointmentService = require('../services/appointment.service.js');

const bookAppointment = asyncHandler(async (req, res) => {
  const appointment = await AppointmentService.bookAppointment(req.user._id, req.body);
  res.status(201).json(new ApiResponse(201, appointment, 'Appointment booked successfully'));
});

const getPatientAppointments = asyncHandler(async (req, res) => {
  const data = await AppointmentService.getPatientAppointments(req.user._id, req.query);
  res.status(200).json(new ApiResponse(200, data, 'Patient appointments retrieved successfully'));
});

const cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await AppointmentService.cancelAppointment(
    req.params.id,
    req.user._id,
    req.user.role
  );
  res.status(200).json(new ApiResponse(200, appointment, 'Appointment cancelled successfully'));
});

const getClinicAppointments = asyncHandler(async (req, res) => {
  const data = await AppointmentService.getClinicAppointments(req.user.clinicId, req.query);
  res.status(200).json(new ApiResponse(200, data, 'Clinic appointments retrieved successfully'));
});

const confirmAppointment = asyncHandler(async (req, res) => {
  const appointment = await AppointmentService.confirmAppointment(
    req.params.id,
    req.user.clinicId,
    req.user._id
  );
  res.status(200).json(new ApiResponse(200, appointment, 'Appointment confirmed successfully'));
});

const rejectAppointment = asyncHandler(async (req, res) => {
  const appointment = await AppointmentService.rejectAppointment(
    req.params.id,
    req.user.clinicId,
    req.user._id
  );
  res.status(200).json(new ApiResponse(200, appointment, 'Appointment rejected successfully'));
});

const completeAppointment = asyncHandler(async (req, res) => {
  const appointment = await AppointmentService.completeAppointment(
    req.params.id,
    req.user.clinicId
  );
  res.status(200).json(new ApiResponse(200, appointment, 'Appointment marked as completed'));
});

const getPatientHistoryForClinic = asyncHandler(async (req, res) => {
  const history = await AppointmentService.getPatientHistoryForClinic(
    req.user.clinicId,
    req.params.patientId
  );
  res.status(200).json(new ApiResponse(200, history, 'Patient appointment history retrieved'));
});

const getAdminAppointments = asyncHandler(async (req, res) => {
  const data = await AppointmentService.getAdminAppointments(req.query);
  res.status(200).json(new ApiResponse(200, data, 'Admin appointments list retrieved'));
});

module.exports = {
  bookAppointment,
  getPatientAppointments,
  cancelAppointment,
  getClinicAppointments,
  confirmAppointment,
  rejectAppointment,
  completeAppointment,
  getPatientHistoryForClinic,
  getAdminAppointments,
};

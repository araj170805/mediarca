const asyncHandler = require('../utils/asyncHandler.js');
const ApiResponse = require('../utils/apiResponse.js');
const User = require('../models/user.model.js');
const Clinic = require('../models/clinic.model.js');
const DoctorClinic = require('../models/doctor.clinic.js');
const Appointment = require('../models/Appointment.model.js');

const getAdminStats = asyncHandler(async (req, res) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    totalPatients,
    totalReceptionists,
    totalClinics,
    activeClinics,
    pendingClinics,
    blockedUsers,
    appointmentsToday,
  ] = await Promise.all([
    User.countDocuments({ isDeleted: false }),
    User.countDocuments({ role: 'patient', isDeleted: false }),
    User.countDocuments({ role: 'receptionist', isDeleted: false }),
    Clinic.countDocuments({}),
    Clinic.countDocuments({ approvalStatus: 'approved', isActive: true }),
    Clinic.countDocuments({ approvalStatus: 'pending' }),
    User.countDocuments({ isBlocked: true, isDeleted: false }),
    Appointment.countDocuments({ bookedAt: { $gte: startOfDay } }),
  ]);

  const stats = {
    totalUsers,
    totalPatients,
    totalReceptionists,
    totalClinics,
    activeClinics,
    pendingClinics,
    blockedUsers,
    appointmentsToday,
  };

  res.status(200).json(new ApiResponse(200, stats, 'Admin dashboard statistics retrieved'));
});

const getReceptionistStats = asyncHandler(async (req, res) => {
  const clinicId = req.user.clinicId;
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [
    todaysAppointments,
    pendingAppointments,
    confirmedAppointments,
    completedAppointments,
    activeDoctors,
  ] = await Promise.all([
    Appointment.countDocuments({ clinicId, bookedAt: { $gte: startOfDay } }),
    Appointment.countDocuments({ clinicId, status: 'pending' }),
    Appointment.countDocuments({ clinicId, status: 'confirmed' }),
    Appointment.countDocuments({ clinicId, status: 'completed' }),
    DoctorClinic.countDocuments({ clinicId, isActive: true }),
  ]);

  const stats = {
    todaysAppointments,
    pendingAppointments,
    confirmedAppointments,
    completedAppointments,
    activeDoctors,
  };

  res.status(200).json(new ApiResponse(200, stats, 'Receptionist dashboard statistics retrieved'));
});

module.exports = {
  getAdminStats,
  getReceptionistStats,
};

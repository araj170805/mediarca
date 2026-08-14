const AppointmentWindow = require('../models/AppointmentWindow.model.js');
const DoctorClinic = require('../models/doctor.clinic.js');
const ApiError = require('../utils/apiError.js');

class AppointmentWindowService {
  // Receptionist: Create Appointment Window
  static async createWindow(clinicId, receptionistId, { doctorId, date, startTime, endTime }) {
    const doctor = await DoctorClinic.findOne({ _id: doctorId, clinicId, isActive: true });
    if (!doctor) {
      throw new ApiError(404, 'Doctor not found or inactive in your clinic');
    }

    const window = await AppointmentWindow.create({
      date,
      startTime,
      endTime,
      status: 'open',
      createdBy: receptionistId,
      doctorId,
      clinicId,
    });

    return window;
  }

  // Receptionist: Update Window Status (open / closed)
  static async updateWindowStatus(windowId, clinicId, status) {
    const validStatuses = ['open', 'closed'];
    if (!validStatuses.includes(status)) {
      throw new ApiError(400, 'Invalid status. Must be "open" or "closed"');
    }

    const window = await AppointmentWindow.findOneAndUpdate(
      { _id: windowId, clinicId },
      { status },
      { new: true }
    );

    if (!window) {
      throw new ApiError(404, 'Appointment window not found in your clinic');
    }

    return window;
  }

  // Receptionist: Edit Window details
  static async updateWindow(windowId, clinicId, updateData) {
    const allowed = ['date', 'startTime', 'endTime', 'status', 'doctorId'];
    const update = {};

    Object.keys(updateData).forEach((key) => {
      if (allowed.includes(key)) update[key] = updateData[key];
    });

    const window = await AppointmentWindow.findOneAndUpdate(
      { _id: windowId, clinicId },
      update,
      { new: true, runValidators: true }
    );

    if (!window) {
      throw new ApiError(404, 'Appointment window not found in your clinic');
    }

    return window;
  }

  // Receptionist: List Clinic Windows
  static async getClinicWindows(clinicId, { doctorId, date, status, page = 1, limit = 20 }) {
    const query = { clinicId };

    if (doctorId) query.doctorId = doctorId;
    if (status) query.status = status;
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [windows, total] = await Promise.all([
      AppointmentWindow.find(query)
        .populate('doctorId', 'name specialization consultationFee')
        .populate('createdBy', 'name email')
        .sort({ date: 1, startTime: 1 })
        .skip(skip)
        .limit(Number(limit)),
      AppointmentWindow.countDocuments(query),
    ]);

    return {
      windows,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  // Public: Get Open Windows for a Doctor
  static async getDoctorWindows(doctorId) {
    const windows = await AppointmentWindow.find({
      doctorId,
      status: 'open',
      date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    })
      .populate('clinicId', 'name address location')
      .sort({ date: 1, startTime: 1 });

    return windows;
  }
}

module.exports = AppointmentWindowService;

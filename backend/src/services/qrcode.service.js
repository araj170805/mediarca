const crypto = require('crypto');
const QRCode = require('../models/qrcode.model.js');
const DoctorClinic = require('../models/doctor.clinic.js');
const Clinic = require('../models/clinic.model.js');
const AppointmentWindow = require('../models/AppointmentWindow.model.js');
const ApiError = require('../utils/apiError.js');

class QRCodeService {
  static async generateQRCode({ doctorId, clinicId }) {
    const clinic = await Clinic.findById(clinicId);
    if (!clinic || !clinic.isActive || clinic.approvalStatus !== 'approved') {
      throw new ApiError(400, 'Clinic is not active or approved');
    }

    let code = `QR-DOC-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    const qr = await QRCode.create({
      doctorId,
      clinicId,
      code,
      type: 'doctor_clinic',
      isActive: true,
    });

    return qr;
  }

  static async scanQRCode(code) {
    const qrRecord = await QRCode.findOne({ code, isActive: true });
    if (!qrRecord) {
      throw new ApiError(404, 'Invalid or inactive QR Code');
    }

    const doctor = await DoctorClinic.findById(qrRecord.doctorId).populate('clinicId');
    if (!doctor || !doctor.isActive) {
      throw new ApiError(404, 'Associated doctor or clinic is inactive');
    }

    const activeWindows = await AppointmentWindow.find({
      doctorId: doctor._id,
      status: 'open',
      date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    }).sort({ date: 1, startTime: 1 });

    return {
      qrCode: qrRecord,
      doctor,
      activeWindows,
    };
  }
}

module.exports = QRCodeService;

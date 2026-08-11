const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Doctor ID is required'],
    },
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clinic',
      required: [true, 'Clinic ID is required'],
    },
    code: {
      type: String,
      required: [true, 'QR code string is required'],
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['doctor_clinic'],
      default: 'doctor_clinic',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const QRCode = mongoose.model('QRCode', qrCodeSchema);

module.exports = QRCode;

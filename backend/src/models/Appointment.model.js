const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patientType: {
      type: String,
      enum: ['self', 'family'],
      default: 'self',
      required: [true, 'Patient type is required'],
    },
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clinic',
      required: [true, 'Clinic ID is required'],
    },
    patientDetails: {
      type: Object,
      required: [true, 'Patient details snapshot is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'rejected', 'cancelled', 'completed'],
      default: 'pending',
    },
    appointmentWindowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AppointmentWindow',
      required: [true, 'Appointment window ID is required'],
    },
    familyMemberId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    bookedAt: {
      type: Date,
      default: Date.now,
    },
    confirmedAt: {
      type: Date,
      default: null,
    },
    rejectedAt: {
      type: Date,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient ID is required'],
    },
    confirmedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      // receptionist
    },
  },
  {
    timestamps: true,
  }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;

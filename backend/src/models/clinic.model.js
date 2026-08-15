const mongoose = require('mongoose');

const clinicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Clinic name is required'],
      trim: true,
    },
    uniqueClinicId: {
      type: String,
      required: [true, 'Unique clinic ID is required'],
      unique: true,
      trim: true,
    },
    authorizedEmail: {
      type: String,
      required: [true, 'Authorized email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    address: {
      type: Object,
      default: {},
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: 'approved',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      // admin user
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      // admin user
    },
  },
  {
    timestamps: true,
  }
);

clinicSchema.index({ location: '2dsphere' });

const Clinic = mongoose.model('Clinic', clinicSchema);

module.exports = Clinic;

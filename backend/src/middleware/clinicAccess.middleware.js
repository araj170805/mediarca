const ApiError = require('../utils/apiError.js');
const asyncHandler = require('../utils/asyncHandler.js');
const Clinic = require('../models/clinic.model.js');

const verifyClinicAccess = asyncHandler(async (req, res, next) => {
  // Only applicable for receptionist role
  if (req.user.role === 'receptionist') {
    if (!req.user.clinicId) {
      throw new ApiError(403, 'Receptionist is not assigned to any clinic');
    }

    const clinic = await Clinic.findById(req.user.clinicId);

    if (!clinic) {
      throw new ApiError(404, 'Assigned clinic not found');
    }

    if (!clinic.isActive) {
      throw new ApiError(403, 'Clinic is currently inactive');
    }

    req.clinic = clinic;
  }

  next();
});

module.exports = verifyClinicAccess;

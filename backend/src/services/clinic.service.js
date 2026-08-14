const Clinic = require('../models/clinic.model.js');
const DoctorClinic = require('../models/doctor.clinic.js');
const ApiError = require('../utils/apiError.js');
const { generateClinicId } = require('../utils/clinicId.js');

class ClinicService {
  // Admin: Create new Clinic with generated Clinic ID
  static async createClinic(data, adminId) {
    const { name, authorizedEmail, address, location } = data;

    const existingClinic = await Clinic.findOne({
      authorizedEmail: authorizedEmail.toLowerCase(),
    });
    if (existingClinic) {
      throw new ApiError(400, 'A clinic with this authorized email already exists');
    }

    let uniqueClinicId = generateClinicId();
    let isUnique = false;
    let attempts = 0;

    // Guarantee uniqueness for generated ID
    while (!isUnique && attempts < 10) {
      const exists = await Clinic.findOne({ uniqueClinicId });
      if (!exists) {
        isUnique = true;
      } else {
        uniqueClinicId = generateClinicId();
        attempts++;
      }
    }

    const clinic = await Clinic.create({
      name,
      uniqueClinicId,
      authorizedEmail: authorizedEmail.toLowerCase(),
      address: address || {},
      location: location || { type: 'Point', coordinates: [0, 0] },
      approvalStatus: 'approved',
      isActive: true,
      approvedBy: adminId,
      approvedAt: new Date(),
      createdBy: adminId,
    });

    return clinic;
  }

  // Admin: Update clinic approval status
  static async updateClinicStatus(clinicId, { approvalStatus, isActive }, adminId) {
    const update = {};

    if (approvalStatus) {
      const validStatuses = ['pending', 'approved', 'rejected', 'suspended'];
      if (!validStatuses.includes(approvalStatus)) {
        throw new ApiError(400, 'Invalid approval status');
      }
      update.approvalStatus = approvalStatus;
      if (approvalStatus === 'approved') {
        update.approvedBy = adminId;
        update.approvedAt = new Date();
      }
    }

    if (isActive !== undefined) {
      update.isActive = Boolean(isActive);
    }

    const clinic = await Clinic.findByIdAndUpdate(clinicId, update, { new: true });
    if (!clinic) {
      throw new ApiError(404, 'Clinic not found');
    }

    return clinic;
  }

  // Admin: List clinics
  static async getClinicsForAdmin({ search, status, page = 1, limit = 10 }) {
    const query = {};

    if (status) {
      query.approvalStatus = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { uniqueClinicId: { $regex: search, $options: 'i' } },
        { authorizedEmail: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [clinics, total] = await Promise.all([
      Clinic.find(query)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Clinic.countDocuments(query),
    ]);

    return {
      clinics,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  // Public: Search clinics near location or city
  static async getClinicsPublic({ longitude, latitude, radiusInKm = 50, city, search, page = 1, limit = 10 }) {
    const query = {
      approvalStatus: 'approved',
      isActive: true,
    };

    if (city) {
      query['address.city'] = { $regex: city, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } },
        { 'address.street': { $regex: search, $options: 'i' } },
      ];
    }

    if (longitude !== undefined && latitude !== undefined) {
      const radiusInMeters = Number(radiusInKm) * 1000;
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(longitude), Number(latitude)],
          },
          $maxDistance: radiusInMeters,
        },
      };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [clinics, total] = await Promise.all([
      Clinic.find(query).skip(skip).limit(Number(limit)),
      Clinic.countDocuments(query),
    ]);

    return {
      clinics,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  // Public: Get Clinic Details
  static async getClinicById(clinicId) {
    const clinic = await Clinic.findById(clinicId);
    if (!clinic || clinic.approvalStatus !== 'approved' || !clinic.isActive) {
      throw new ApiError(404, 'Clinic not found or inactive');
    }

    const doctors = await DoctorClinic.find({ clinicId, isActive: true });

    return {
      clinic,
      doctors,
    };
  }

  // Receptionist: Update own clinic details
  static async updateOwnClinic(clinicId, updateData) {
    const allowed = ['name', 'address', 'location'];
    const update = {};

    Object.keys(updateData).forEach((key) => {
      if (allowed.includes(key)) update[key] = updateData[key];
    });

    const clinic = await Clinic.findByIdAndUpdate(clinicId, update, { new: true });
    if (!clinic) throw new ApiError(404, 'Clinic not found');
    return clinic;
  }
}

module.exports = ClinicService;

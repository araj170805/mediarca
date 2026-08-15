const DoctorClinic = require('../models/doctor.clinic.js');
const Clinic = require('../models/clinic.model.js');
const AppointmentWindow = require('../models/AppointmentWindow.model.js');
const ApiError = require('../utils/apiError.js');

class DoctorService {
  static async addDoctor(clinicId, { name, specialization, consultationFee, doctorId }) {
    const clinic = await Clinic.findById(clinicId);
    if (!clinic || !clinic.isActive) {
      throw new ApiError(403, 'Clinic is not active');
    }

    const doctor = await DoctorClinic.create({
      name,
      specialization,
      consultationFee,
      clinicId,
      doctorId: doctorId || null,
      isActive: true,
    });

    return doctor;
  }

  // Receptionist: Update doctor in clinic
  static async updateDoctor(id, clinicId, updateData) {
    const allowed = ['name', 'specialization', 'consultationFee', 'isActive', 'doctorId'];
    const update = {};

    Object.keys(updateData).forEach((key) => {
      if (allowed.includes(key)) update[key] = updateData[key];
    });

    const doctor = await DoctorClinic.findOneAndUpdate(
      { _id: id, clinicId },
      update,
      { new: true, runValidators: true }
    );

    if (!doctor) {
      throw new ApiError(404, 'Doctor not found in your clinic');
    }

    return doctor;
  }

  // Receptionist: Toggle Doctor Status
  static async toggleDoctorStatus(id, clinicId, isActive) {
    const doctor = await DoctorClinic.findOneAndUpdate(
      { _id: id, clinicId },
      { isActive: Boolean(isActive) },
      { new: true }
    );

    if (!doctor) {
      throw new ApiError(404, 'Doctor not found in your clinic');
    }

    return doctor;
  }

  // Receptionist: Get doctors for clinic
  static async getDoctorsByClinic(clinicId) {
    const doctors = await DoctorClinic.find({ clinicId }).sort({ createdAt: -1 });
    return doctors;
  }

  // Public: Search & Filter Doctors (with GeoLocation GPS support & City filter)
  static async searchDoctors({ longitude, latitude, radiusInKm = 50, city, specialization, feeMin, feeMax, search, page = 1, limit = 10 }) {
    const doctorQuery = { isActive: true };

    if (specialization) {
      doctorQuery.specialization = { $regex: specialization, $options: 'i' };
    }

    if (feeMin !== undefined || feeMax !== undefined) {
      doctorQuery.consultationFee = {};
      if (feeMin !== undefined) doctorQuery.consultationFee.$gte = Number(feeMin);
      if (feeMax !== undefined) doctorQuery.consultationFee.$lte = Number(feeMax);
    }

    if (search) {
      doctorQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
      ];
    }

    // If GPS coordinates provided, find clinics within radius first
    if (longitude !== undefined && latitude !== undefined && !isNaN(Number(longitude)) && !isNaN(Number(latitude))) {
      try {
        const nearbyClinics = await Clinic.find({
          approvalStatus: 'approved',
          isActive: true,
          location: {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: [Number(longitude), Number(latitude)],
              },
              $maxDistance: Number(radiusInKm) * 1000,
            },
          },
        }).select('_id');

        const nearbyClinicIds = nearbyClinics.map((c) => c._id);
        doctorQuery.clinicId = { $in: nearbyClinicIds };
      } catch (geoErr) {
        // Fallback gracefully if 2dsphere index or geolocation fails
        console.warn('Geolocation query failed or 2dsphere index missing:', geoErr.message);
      }
    }

    const skip = (Number(page) - 1) * Number(limit);

    let doctors = [];
    try {
      doctors = await DoctorClinic.find(doctorQuery)
        .populate({
          path: 'clinicId',
          select: 'name address location approvalStatus isActive uniqueClinicId',
        })
        .skip(skip)
        .limit(Number(limit));
    } catch (dbErr) {
      console.warn('Doctor search DB query failed:', dbErr.message);
      return {
        doctors: [],
        pagination: { page: Number(page), limit: Number(limit), total: 0 },
      };
    }

    // Filter out doctors whose clinic is not active or approved, or does not match city filter
    doctors = doctors.filter((doc) => {
      const c = doc.clinicId;
      if (!c || !c.isActive || c.approvalStatus !== 'approved') return false;
      if (city && c.address && c.address.city) {
        return c.address.city.toLowerCase().includes(city.toLowerCase());
      }
      return true;
    });

    let windows = [];
    try {
      const doctorIds = doctors.map((d) => d._id);
      windows = await AppointmentWindow.find({
        doctorId: { $in: doctorIds },
        status: 'open',
        date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      });
    } catch (windowErr) {
      console.warn('Appointment windows query failed:', windowErr.message);
    }

    const doctorsWithWindows = doctors.map((doc) => {
      const docObj = doc.toObject();
      docObj.activeWindows = windows.filter(
        (w) => w.doctorId.toString() === doc._id.toString()
      );
      return docObj;
    });

    return {
      doctors: doctorsWithWindows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
      },
    };
  }

  // Public: Get Doctor Profile by ID
  static async getDoctorProfile(doctorId) {
    const doctor = await DoctorClinic.findById(doctorId).populate('clinicId');
    if (!doctor || !doctor.isActive) {
      throw new ApiError(404, 'Doctor not found or inactive');
    }

    const activeWindows = await AppointmentWindow.find({
      doctorId: doctor._id,
      status: 'open',
      date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    }).sort({ date: 1, startTime: 1 });

    return {
      doctor,
      activeWindows,
    };
  }
}

module.exports = DoctorService;

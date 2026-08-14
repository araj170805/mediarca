const Appointment = require('../models/Appointment.model.js');
const AppointmentWindow = require('../models/AppointmentWindow.model.js');
const User = require('../models/user.model.js');
const Notification = require('../models/Notification.model.js');
const ApiError = require('../utils/apiError.js');

class AppointmentService {
  // Patient: Book Appointment
  static async bookAppointment(patientId, { clinicId, appointmentWindowId, patientType, familyMemberId, patientDetails }) {
    const window = await AppointmentWindow.findById(appointmentWindowId);
    if (!window || window.status !== 'open') {
      throw new ApiError(400, 'Appointment window is not open or available');
    }

    if (window.clinicId.toString() !== clinicId.toString()) {
      throw new ApiError(400, 'Clinic ID mismatch for this appointment window');
    }

    const patient = await User.findById(patientId);
    if (!patient) {
      throw new ApiError(404, 'Patient not found');
    }

    let snapshot = {};

    if (patientType === 'family') {
      if (familyMemberId) {
        const member = patient.familyMembers.id(familyMemberId);
        if (!member) throw new ApiError(404, 'Family member not found in patient profile');
        snapshot = {
          name: member.name,
          relation: member.relation,
          age: member.age,
          gender: member.gender,
          phone: member.phone || patient.phone,
        };
      } else if (patientDetails) {
        snapshot = patientDetails;
      } else {
        throw new ApiError(400, 'Patient details or family member ID required for family booking');
      }
    } else {
      // Myself
      snapshot = {
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        gender: patientDetails?.gender || null,
        age: patientDetails?.age || null,
      };
    }

    const appointment = await Appointment.create({
      patientType: patientType || 'self',
      clinicId,
      patientDetails: snapshot,
      status: 'pending',
      appointmentWindowId,
      familyMemberId: familyMemberId || null,
      bookedAt: new Date(),
      patientId,
    });

    // Notify clinic receptionists
    const receptionists = await User.find({ clinicId, role: 'receptionist', isDeleted: false });
    for (const rec of receptionists) {
      await Notification.create({
        type: 'appointment_booked',
        message: `New appointment booked by ${snapshot.name} for ${window.date ? new Date(window.date).toLocaleDateString() : 'scheduled date'}.`,
        appointmentId: appointment._id,
        clinicId,
        recipientId: rec._id,
      });
    }

    return appointment;
  }

  // Patient: Get own appointments
  static async getPatientAppointments(patientId, { status, filter, page = 1, limit = 10 }) {
    const query = { patientId };

    if (status) {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [appointments, total] = await Promise.all([
      Appointment.find(query)
        .populate('clinicId', 'name address uniqueClinicId authorizedEmail')
        .populate({
          path: 'appointmentWindowId',
          populate: { path: 'doctorId', select: 'name specialization consultationFee' },
        })
        .sort({ bookedAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Appointment.countDocuments(query),
    ]);

    return {
      appointments,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  // Patient / Receptionist: Cancel Appointment
  static async cancelAppointment(appointmentId, userId, userRole) {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      throw new ApiError(404, 'Appointment not found');
    }

    if (userRole === 'patient' && appointment.patientId.toString() !== userId.toString()) {
      throw new ApiError(403, 'Unauthorized to cancel this appointment');
    }

    if (['completed', 'cancelled'].includes(appointment.status)) {
      throw new ApiError(400, `Cannot cancel an appointment with status '${appointment.status}'`);
    }

    appointment.status = 'cancelled';
    appointment.cancelledAt = new Date();
    await appointment.save();

    // Trigger notification
    if (userRole === 'patient') {
      const receptionists = await User.find({ clinicId: appointment.clinicId, role: 'receptionist' });
      for (const rec of receptionists) {
        await Notification.create({
          type: 'appointment_cancelled',
          message: `Appointment for ${appointment.patientDetails.name} has been cancelled by the patient.`,
          appointmentId: appointment._id,
          clinicId: appointment.clinicId,
          recipientId: rec._id,
        });
      }
    } else {
      await Notification.create({
        type: 'appointment_cancelled',
        message: 'Your appointment has been cancelled by the clinic.',
        appointmentId: appointment._id,
        clinicId: appointment.clinicId,
        recipientId: appointment.patientId,
      });
    }

    return appointment;
  }

  // Receptionist: Get Clinic Appointments
  static async getClinicAppointments(clinicId, { status, doctorId, date, page = 1, limit = 20 }) {
    const query = { clinicId };

    if (status) {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    let appointments = await Appointment.find(query)
      .populate('patientId', 'name email phone')
      .populate({
        path: 'appointmentWindowId',
        populate: { path: 'doctorId', select: 'name specialization' },
      })
      .sort({ bookedAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    if (doctorId) {
      appointments = appointments.filter(
        (a) =>
          a.appointmentWindowId &&
          a.appointmentWindowId.doctorId &&
          a.appointmentWindowId.doctorId._id.toString() === doctorId.toString()
      );
    }

    const total = await Appointment.countDocuments(query);

    return {
      appointments,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  // Receptionist: Confirm Appointment
  static async confirmAppointment(appointmentId, clinicId, receptionistId) {
    const appointment = await Appointment.findOne({ _id: appointmentId, clinicId });
    if (!appointment) {
      throw new ApiError(404, 'Appointment not found in your clinic');
    }

    if (appointment.status !== 'pending') {
      throw new ApiError(400, `Cannot confirm appointment currently in '${appointment.status}' state`);
    }

    appointment.status = 'confirmed';
    appointment.confirmedAt = new Date();
    appointment.confirmedBy = receptionistId;
    await appointment.save();

    // Create Notification for Patient
    await Notification.create({
      type: 'appointment_confirmed',
      message: `Your appointment at the clinic has been confirmed!`,
      appointmentId: appointment._id,
      clinicId,
      recipientId: appointment.patientId,
    });

    return appointment;
  }

  // Receptionist: Reject Appointment
  static async rejectAppointment(appointmentId, clinicId, receptionistId) {
    const appointment = await Appointment.findOne({ _id: appointmentId, clinicId });
    if (!appointment) {
      throw new ApiError(404, 'Appointment not found in your clinic');
    }

    if (appointment.status !== 'pending') {
      throw new ApiError(400, `Cannot reject appointment currently in '${appointment.status}' state`);
    }

    appointment.status = 'rejected';
    appointment.rejectedAt = new Date();
    await appointment.save();

    // Create Notification for Patient
    await Notification.create({
      type: 'appointment_rejected',
      message: 'Your appointment request was rejected by the clinic.',
      appointmentId: appointment._id,
      clinicId,
      recipientId: appointment.patientId,
    });

    return appointment;
  }

  // Receptionist: Complete Appointment
  static async completeAppointment(appointmentId, clinicId) {
    const appointment = await Appointment.findOne({ _id: appointmentId, clinicId });
    if (!appointment) {
      throw new ApiError(404, 'Appointment not found in your clinic');
    }

    if (appointment.status !== 'confirmed') {
      throw new ApiError(400, `Only confirmed appointments can be marked as completed`);
    }

    appointment.status = 'completed';
    appointment.completedAt = new Date();
    await appointment.save();

    await Notification.create({
      type: 'appointment_completed',
      message: 'Your appointment visit has been marked as completed. Thank you!',
      appointmentId: appointment._id,
      clinicId,
      recipientId: appointment.patientId,
    });

    return appointment;
  }

  // Receptionist: View Patient History
  static async getPatientHistoryForClinic(clinicId, targetPatientId) {
    const appointments = await Appointment.find({
      clinicId,
      patientId: targetPatientId,
    })
      .populate({
        path: 'appointmentWindowId',
        populate: { path: 'doctorId', select: 'name specialization' },
      })
      .sort({ bookedAt: -1 });

    return appointments;
  }

  // Admin: Get All Platform Appointments
  static async getAdminAppointments({ status, clinicId, page = 1, limit = 20 }) {
    const query = {};
    if (status) query.status = status;
    if (clinicId) query.clinicId = clinicId;

    const skip = (Number(page) - 1) * Number(limit);

    const [appointments, total] = await Promise.all([
      Appointment.find(query)
        .populate('clinicId', 'name uniqueClinicId')
        .populate('patientId', 'name email phone')
        .populate({
          path: 'appointmentWindowId',
          populate: { path: 'doctorId', select: 'name specialization' },
        })
        .sort({ bookedAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Appointment.countDocuments(query),
    ]);

    return {
      appointments,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }
}

module.exports = AppointmentService;

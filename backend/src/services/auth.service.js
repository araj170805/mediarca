const User = require('../models/user.model.js');
const OTP = require('../models/otp.model.js');
const Clinic = require('../models/clinic.model.js');
const ApiError = require('../utils/apiError.js');
const { hashPassword, comparePassword } = require('../utils/password.js');
const { generateToken } = require('../utils/jwt.js');
const { generateOTP, hashOTP, sendOTPEmail } = require('../utils/otp.js');

class AuthService {
  static async sendOTP(email, purpose) {
    const validPurposes = ['signup', 'login', 'email_verification'];
    if (!validPurposes.includes(purpose)) {
      throw new ApiError(400, 'Invalid OTP purpose');
    }

    const otp = generateOTP();
    const tokenHash = hashOTP(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await OTP.create({
      email: email.toLowerCase(),
      tokenHash,
      purpose,
      expiresAt,
    });

    await sendOTPEmail(email, otp, purpose);

    return { message: `OTP sent successfully to ${email}` };
  }

  static async verifyOTP(email, otp, purpose) {
    const tokenHash = hashOTP(otp);

    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      tokenHash,
      purpose,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      throw new ApiError(400, 'Invalid or expired OTP');
    }

    otpRecord.isVerified = true;
    otpRecord.isEmailVerified = true;
    await otpRecord.save();

    return { success: true, message: 'OTP verified successfully' };
  }

  static async registerPatient({ name, email, phone, password }) {
    const normalizedEmail = email.toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail, isDeleted: false });
    if (existingUser) {
      throw new ApiError(400, 'User with this email already exists');
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      name,
      email: normalizedEmail,
      phone: phone || null,
      password: hashedPassword,
      role: 'patient',
      isApproved: true,
      isActive: true,
      isEmailVerified: true,
      isVerified: true,
    });

    const token = generateToken({ id: user._id, role: user.role });
    const userObject = user.toObject();
    delete userObject.password;

    return { user: userObject, token };
  }

  static async registerReceptionist({ name, email, phone, password, uniqueClinicId, authorizedEmail }) {
    const normalizedEmail = (authorizedEmail || email).toLowerCase();

    // Verify clinic exists with uniqueClinicId and authorizedEmail
    const clinic = await Clinic.findOne({
      uniqueClinicId,
      authorizedEmail: normalizedEmail,
    });

    if (!clinic) {
      throw new ApiError(
        400,
        'Invalid Clinic ID or Authorized Email. Please check credentials provided by Admin'
      );
    }

    if (clinic.approvalStatus !== 'approved' || !clinic.isActive) {
      throw new ApiError(403, 'Clinic is not approved or active. Cannot register receptionist');
    }

    const existingUser = await User.findOne({ email: normalizedEmail, isDeleted: false });
    if (existingUser) {
      throw new ApiError(400, 'User account already registered for this email');
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      clinicId: clinic._id,
      name,
      email: normalizedEmail,
      phone: phone || null,
      password: hashedPassword,
      role: 'receptionist',
      isApproved: true,
      isActive: true,
      isEmailVerified: true,
      isVerified: true,
    });

    const token = generateToken({ id: user._id, role: user.role, clinicId: clinic._id });
    const userObject = user.toObject();
    delete userObject.password;

    return { user: userObject, token, clinic };
  }

  static async login({ email, password }) {
    const normalizedEmail = email.toLowerCase();

    // Special Master Admin check
    if (normalizedEmail === 'araj172007@gmail.com' && password === 'mediarca@26') {
      let adminUser = await User.findOne({ email: normalizedEmail, isDeleted: false });
      if (!adminUser) {
        const hashedPassword = await hashPassword('mediarca@26');
        adminUser = await User.create({
          name: 'MediArca Admin',
          email: normalizedEmail,
          password: hashedPassword,
          role: 'admin',
          isApproved: true,
          isActive: true,
          isEmailVerified: true,
          isVerified: true,
        });
      } else if (adminUser.role !== 'admin') {
        adminUser.role = 'admin';
        await adminUser.save();
      }
      const token = generateToken({ id: adminUser._id, role: adminUser.role });
      const userObject = adminUser.toObject();
      delete userObject.password;
      return { user: userObject, token };
    }

    const user = await User.findOne({ email: normalizedEmail, isDeleted: false });
    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    if (user.isBlocked) {
      throw new ApiError(403, 'Your account has been blocked. Please contact support');
    }

    if (!user.password) {
      throw new ApiError(
        400,
        'No password set for this account yet. Please log in using Google or set a password in your profile settings.'
      );
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid credentials');
    }

    // Check clinic status if receptionist
    if (user.role === 'receptionist' && user.clinicId) {
      const clinic = await Clinic.findById(user.clinicId);
      if (!clinic || !clinic.isActive || clinic.approvalStatus !== 'approved') {
        throw new ApiError(403, 'Your associated clinic is not active/approved');
      }
    }

    const token = generateToken({ id: user._id, role: user.role, clinicId: user.clinicId });
    const userObject = user.toObject();
    delete userObject.password;

    return { user: userObject, token };
  }

  static async setPassword(userId, { newPassword }) {
    if (!newPassword || newPassword.length < 6) {
      throw new ApiError(400, 'Password must be at least 6 characters long');
    }

    const user = await User.findById(userId);
    if (!user || user.isDeleted) {
      throw new ApiError(404, 'User not found');
    }

    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;
    await user.save();

    const userObject = user.toObject();
    delete userObject.password;

    return {
      user: userObject,
      message: 'Password set successfully. You can now log in using email and password.',
    };
  }

  static async getMe(userId) {
    const user = await User.findById(userId).select('-password').populate('clinicId');
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  }
}

module.exports = AuthService;

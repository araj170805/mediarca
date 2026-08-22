const User = require('../models/user.model.js');
const Clinic = require('../models/clinic.model.js');
const ApiError = require('../utils/apiError.js');
const { generateToken } = require('../utils/jwt.js');
const { verifyFirebaseToken } = require('../config/firebase.js');

class GoogleAuthService {
  /**
   * Patient: Google Sign-In / Sign-Up
   *
   * Flow:
   *   1. Frontend gets Firebase ID token after Google sign-in
   *   2. Frontend sends idToken to POST /api/v1/auth/google/patient
   *   3. Backend verifies token with Firebase Admin SDK
   *   4. If user exists → login; if not → auto-create patient account
   */
  static async googlePatientAuth(idToken) {
    // 1. Verify the Firebase ID token
    let decoded;
    try {
      decoded = await verifyFirebaseToken(idToken);
    } catch (err) {
      throw new ApiError(401, 'Invalid or expired Google ID token. Please sign in again.');
    }

    const { uid, email, name, picture, email_verified } = decoded;

    if (!email) {
      throw new ApiError(400, 'Google account must have an associated email address.');
    }

    const normalizedEmail = email.toLowerCase();

    // 2. Find existing user by googleId OR email
    let user = await User.findOne({
      $or: [{ googleId: uid }, { email: normalizedEmail }],
      isDeleted: false,
    });

    if (user) {
      // Existing user — verify role is patient (Google login not allowed for admin/receptionist)
      if (user.role !== 'patient') {
        throw new ApiError(
          403,
          `Google sign-in is only available for patients. ${user.role} accounts must use password login.`
        );
      }

      if (user.isBlocked) {
        throw new ApiError(403, 'Your account has been blocked. Please contact support.');
      }

      // Update Google fields if not yet linked
      if (!user.googleId) {
        user.googleId = uid;
        user.authProvider = 'google';
        user.avatar = picture || user.avatar;
        user.isEmailVerified = true;
        user.isVerified = true;
        await user.save();
      }
    } else {
      // 3. New user — auto-register as patient
      user = await User.create({
        name: name || 'Google User',
        email: normalizedEmail,
        googleId: uid,
        avatar: picture || null,
        authProvider: 'google',
        role: 'patient',
        isApproved: true,
        isActive: true,
        isEmailVerified: true,
        isVerified: true,
        password: null,
      });
    }

    // 4. Issue our own JWT
    const token = generateToken({ id: user._id, role: user.role });
    const userObject = user.toObject();
    delete userObject.password;

    return {
      user: userObject,
      token,
      isNewUser: !user.createdAt || (Date.now() - user.createdAt.getTime()) < 5000,
    };
  }

  /**
   * Admin Panel: Verify Admin Identity via Google
   *
   * This does NOT create a new account. It only verifies that the Google
   * email matches an existing admin account in our database.
   *
   * Flow:
   *   1. Admin opens admin panel and clicks "Verify with Google"
   *   2. Frontend gets Firebase ID token after Google sign-in
   *   3. Backend verifies token and checks the email belongs to an admin user
   */
  static async googleAdminVerification(idToken) {
    // 1. Verify the Firebase ID token
    let decoded;
    try {
      decoded = await verifyFirebaseToken(idToken);
    } catch (err) {
      throw new ApiError(401, 'Invalid or expired Google ID token. Please sign in again.');
    }

    const { uid, email } = decoded;

    if (!email) {
      throw new ApiError(400, 'Google account must have an associated email address.');
    }

    const normalizedEmail = email.toLowerCase();

    // 2. Find admin user with matching email
    const admin = await User.findOne({
      email: normalizedEmail,
      role: 'admin',
      isDeleted: false,
    });

    if (!admin) {
      throw new ApiError(
        403,
        'This Google account is not registered as an admin. Access denied.'
      );
    }

    if (admin.isBlocked) {
      throw new ApiError(403, 'This admin account has been blocked.');
    }

    // 3. Link Google UID to admin account if not already linked
    if (!admin.googleId) {
      admin.googleId = uid;
      admin.authProvider = 'google';
      admin.isEmailVerified = true;
      await admin.save();
    }

    // 4. Issue JWT
    const token = generateToken({ id: admin._id, role: admin.role });
    const adminObject = admin.toObject();
    delete adminObject.password;

    return {
      user: adminObject,
      token,
      message: 'Admin identity verified via Google successfully.',
    };
  }

  /**
   * Receptionist: Google sign-in verification
   *
   * Receptionists CAN use Google login if their authorized clinic email
   * matches the Google account email. This links their Google ID on first use.
   */
  static async googleReceptionistAuth(idToken) {
    let decoded;
    try {
      decoded = await verifyFirebaseToken(idToken);
    } catch (err) {
      throw new ApiError(401, 'Invalid or expired Google ID token. Please sign in again.');
    }

    const { uid, email } = decoded;

    if (!email) {
      throw new ApiError(400, 'Google account must have an associated email address.');
    }

    const normalizedEmail = email.toLowerCase();

    // Find receptionist user
    const user = await User.findOne({
      email: normalizedEmail,
      role: 'receptionist',
      isDeleted: false,
    });

    if (!user) {
      throw new ApiError(
        403,
        'No receptionist account found for this Google email. ' +
        'Please register using your Clinic ID and authorized email first.'
      );
    }

    if (user.isBlocked) {
      throw new ApiError(403, 'Your account has been blocked. Please contact support.');
    }

    // Check clinic is still active & approved
    if (user.clinicId) {
      const clinic = await Clinic.findById(user.clinicId);
      if (!clinic || !clinic.isActive || clinic.approvalStatus !== 'approved') {
        throw new ApiError(403, 'Your associated clinic is not active or approved.');
      }
    }

    // Link Google UID on first Google login
    if (!user.googleId) {
      user.googleId = uid;
      user.authProvider = 'google';
      user.isEmailVerified = true;
      await user.save();
    }

    const token = generateToken({ id: user._id, role: user.role, clinicId: user.clinicId });
    const userObject = user.toObject();
    delete userObject.password;

    return { user: userObject, token };
  }
}

module.exports = GoogleAuthService;

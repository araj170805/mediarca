const crypto = require('crypto');

const generateOTP = () => {
  // Generate 6 digit numeric code
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const hashOTP = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

const sendOTPEmail = async (email, otp, purpose) => {
  // In production, integrate with nodemailer / SendGrid / AWS SES.
  // For development & testing, log to console.
  console.log(`[OTP DISPATCH] Sent ${purpose} OTP: ${otp} to ${email}`);
  return true;
};

module.exports = {
  generateOTP,
  hashOTP,
  sendOTPEmail,
};

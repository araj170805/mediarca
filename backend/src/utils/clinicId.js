const crypto = require('crypto');

const generateClinicId = () => {
  const randomChars = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `MED-CLN-${randomChars}`;
};

module.exports = {
  generateClinicId,
};

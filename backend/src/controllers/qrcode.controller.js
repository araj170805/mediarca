const asyncHandler = require('../utils/asyncHandler.js');
const ApiResponse = require('../utils/apiResponse.js');
const QRCodeService = require('../services/qrcode.service.js');

const generateQRCode = asyncHandler(async (req, res) => {
  const { doctorId, clinicId } = req.body;
  const qr = await QRCodeService.generateQRCode({
    doctorId: doctorId || req.body.doctorId,
    clinicId: clinicId || req.user?.clinicId || req.body.clinicId,
  });
  res.status(201).json(new ApiResponse(201, qr, 'QR Code generated successfully'));
});

const scanQRCode = asyncHandler(async (req, res) => {
  const data = await QRCodeService.scanQRCode(req.params.code);
  res.status(200).json(new ApiResponse(200, data, 'QR Code scanned successfully'));
});

module.exports = {
  generateQRCode,
  scanQRCode,
};

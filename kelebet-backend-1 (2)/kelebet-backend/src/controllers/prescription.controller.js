// src/controllers/prescription.controller.js
const prisma = require('../utils/prisma');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer — store in memory, then upload to Cloudinary
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WEBP, and PDF files are allowed.'));
    }
  },
}).single('prescription');

// ── POST /api/prescriptions/upload ───────────────────────────
const uploadPrescription = (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });

    try {
      if (!req.file) return res.status(400).json({ success: false, message: 'Please upload a prescription image.' });

      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'kelebet/prescriptions', resource_type: 'auto' },
          (error, result) => error ? reject(error) : resolve(result)
        ).end(req.file.buffer);
      });

      const prescription = await prisma.prescription.create({
        data: {
          userId: req.user.id,
          imageUrl: result.secure_url,
          doctorName: req.body.doctorName,
          hospitalName: req.body.hospitalName,
        },
      });

      res.status(201).json({ success: true, message: 'Prescription uploaded! Pending verification.', prescription });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });
};

// ── GET /api/prescriptions/my ─────────────────────────────────
const getMyPrescriptions = async (req, res) => {
  try {
    const prescriptions = await prisma.prescription.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, prescriptions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/prescriptions (Admin/Pharmacist) ─────────────────
const getAllPrescriptions = async (req, res) => {
  try {
    const { status } = req.query;
    const prescriptions = await prisma.prescription.findMany({
      where: status ? { status } : {},
      include: { user: { select: { name: true, email: true, phone: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, prescriptions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/prescriptions/:id/verify (Pharmacist/Admin) ──────
const verifyPrescription = async (req, res) => {
  try {
    const { status, notes } = req.body;
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be APPROVED or REJECTED.' });
    }

    const prescription = await prisma.prescription.update({
      where: { id: req.params.id },
      data: { status, notes, pharmacistId: req.user.id, verifiedAt: new Date() },
    });

    res.json({ success: true, message: `Prescription ${status.toLowerCase()}!`, prescription });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { uploadPrescription, getMyPrescriptions, getAllPrescriptions, verifyPrescription };

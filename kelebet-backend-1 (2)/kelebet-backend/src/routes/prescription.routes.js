// src/routes/prescription.routes.js
const router = require('express').Router();
const { uploadPrescription, getMyPrescriptions, getAllPrescriptions, verifyPrescription } = require('../controllers/prescription.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.post('/upload',     protect, uploadPrescription);
router.get('/my',          protect, getMyPrescriptions);
router.get('/',            protect, authorize('ADMIN', 'PHARMACIST'), getAllPrescriptions);
router.put('/:id/verify',  protect, authorize('ADMIN', 'PHARMACIST'), verifyPrescription);

module.exports = router;

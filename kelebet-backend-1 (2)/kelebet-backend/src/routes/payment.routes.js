// src/routes/payment.routes.js
const router = require('express').Router();
const { initializePayment, verifyPayment, handleWebhook } = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/initialize', protect, initializePayment);
router.post('/verify',     protect, verifyPayment);
router.post('/webhook',    handleWebhook);   // Public — called by Chapa

module.exports = router;

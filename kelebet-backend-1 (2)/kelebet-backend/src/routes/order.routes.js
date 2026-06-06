// src/routes/order.routes.js
const router = require('express').Router();
const { createOrder, getMyOrders, getOrder, getAllOrders, updateOrderStatus, getOrderStats } = require('../controllers/order.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.post('/',              protect, createOrder);
router.get('/my',             protect, getMyOrders);
router.get('/all',            protect, authorize('ADMIN', 'PHARMACIST'), getAllOrders);
router.get('/stats',          protect, authorize('ADMIN'), getOrderStats);
router.get('/:id',            protect, getOrder);
router.put('/:id/status',     protect, authorize('ADMIN', 'PHARMACIST'), updateOrderStatus);

module.exports = router;

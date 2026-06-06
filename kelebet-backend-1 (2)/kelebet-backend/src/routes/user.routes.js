// src/routes/user.routes.js
const router = require('express').Router();
const { getAllUsers, toggleUserActive, updateUserRole, getUserStats } = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/',                   protect, authorize('ADMIN'), getAllUsers);
router.get('/stats',              protect, authorize('ADMIN'), getUserStats);
router.put('/:id/toggle-active',  protect, authorize('ADMIN'), toggleUserActive);
router.put('/:id/role',           protect, authorize('ADMIN'), updateUserRole);

module.exports = router;

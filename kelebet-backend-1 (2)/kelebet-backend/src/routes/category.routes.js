// src/routes/category.routes.js
const router = require('express').Router();
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/category.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/',       getCategories);
router.post('/',      protect, authorize('ADMIN'), createCategory);
router.put('/:id',    protect, authorize('ADMIN'), updateCategory);
router.delete('/:id', protect, authorize('ADMIN'), deleteCategory);

module.exports = router;

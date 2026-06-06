// src/routes/product.routes.js
const router = require('express').Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, addReview, getLowStock } = require('../controllers/product.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/',              getProducts);
router.get('/low-stock',     protect, authorize('ADMIN', 'PHARMACIST'), getLowStock);
router.get('/:id',           getProduct);
router.post('/',             protect, authorize('ADMIN'), createProduct);
router.put('/:id',           protect, authorize('ADMIN'), updateProduct);
router.delete('/:id',        protect, authorize('ADMIN'), deleteProduct);
router.post('/:id/reviews',  protect, addReview);

module.exports = router;

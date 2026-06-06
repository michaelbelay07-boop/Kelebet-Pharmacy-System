// src/routes/cart.routes.js
const router = require('express').Router();
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart } = require('../controllers/cart.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/',          protect, getCart);
router.post('/',         protect, addToCart);
router.put('/:id',       protect, updateCartItem);
router.delete('/clear',  protect, clearCart);
router.delete('/:id',    protect, removeFromCart);

module.exports = router;

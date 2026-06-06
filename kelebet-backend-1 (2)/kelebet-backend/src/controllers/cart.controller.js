// src/controllers/cart.controller.js
const prisma = require('../utils/prisma');

const getCart = async (req, res) => {
  try {
    const items = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { product: { select: { id: true, name: true, price: true, salePrice: true, imageUrl: true, stock: true, requiresPrescription: true } } },
    });
    const total = items.reduce((sum, i) => sum + (i.product.salePrice || i.product.price) * i.quantity, 0);
    res.json({ success: true, items, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.isActive) return res.status(404).json({ success: false, message: 'Product not found.' });
    if (product.stock < quantity) return res.status(400).json({ success: false, message: 'Not enough stock.' });

    const item = await prisma.cartItem.upsert({
      where: { userId_productId: { userId: req.user.id, productId } },
      update: { quantity: { increment: quantity } },
      create: { userId: req.user.id, productId, quantity },
      include: { product: true },
    });
    res.json({ success: true, message: 'Added to cart!', item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    if (quantity < 1) {
      await prisma.cartItem.delete({ where: { id: req.params.id } });
      return res.json({ success: true, message: 'Item removed from cart.' });
    }
    const item = await prisma.cartItem.update({ where: { id: req.params.id }, data: { quantity } });
    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    await prisma.cartItem.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Item removed.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const clearCart = async (req, res) => {
  try {
    await prisma.cartItem.deleteMany({ where: { userId: req.user.id } });
    res.json({ success: true, message: 'Cart cleared.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };

// src/controllers/order.controller.js
const prisma = require('../utils/prisma');

// ── POST /api/orders ──────────────────────────────────────────
const createOrder = async (req, res) => {
  try {
    const { items, address, phone, notes, prescriptionId, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must have at least one item.' });
    }

    // Validate products and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product || !product.isActive) {
        return res.status(400).json({ success: false, message: `Product ${item.productId} not found.` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}.` });
      }
      if (product.requiresPrescription && !prescriptionId) {
        return res.status(400).json({ success: false, message: `${product.name} requires a valid prescription.` });
      }

      const price = product.salePrice || product.price;
      totalAmount += price * item.quantity;
      orderItems.push({ productId: item.productId, quantity: item.quantity, price });
    }

    const deliveryFee = totalAmount >= 500 ? 0 : 50; // Free delivery over 500 ETB

    // Create order + deduct stock in one transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: req.user.id,
          address,
          phone,
          notes,
          prescriptionId,
          paymentMethod: paymentMethod || 'CHAPA',
          totalAmount,
          deliveryFee,
          items: { create: orderItems },
        },
        include: { items: { include: { product: true } }, user: { select: { name: true, email: true } } },
      });

      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({ where: { userId: req.user.id } });

      return newOrder;
    });

    res.status(201).json({ success: true, message: 'Order placed successfully!', order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/orders (My orders) ───────────────────────────────
const getMyOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { items: { include: { product: { select: { name: true, imageUrl: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/orders/:id ───────────────────────────────────────
const getOrder = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: { include: { product: true } },
        user: { select: { name: true, email: true, phone: true } },
        prescription: true,
      },
    });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    // Only allow owner or admin/pharmacist to view
    if (order.userId !== req.user.id && !['ADMIN', 'PHARMACIST'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/orders/all (Admin/Pharmacist) ────────────────────
const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const where = status ? { status } : {};
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { user: { select: { name: true, email: true, phone: true } }, items: true },
        orderBy: { createdAt: 'desc' },
        skip, take: parseInt(limit),
      }),
      prisma.order.count({ where }),
    ]);

    res.json({ success: true, orders, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/orders/:id/status (Admin/Pharmacist) ─────────────
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
      include: { user: { select: { name: true, email: true } } },
    });

    res.json({ success: true, message: `Order marked as ${status}`, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/orders/stats (Admin) ────────────────────────────
const getOrderStats = async (req, res) => {
  try {
    const [total, pending, delivered, revenue] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'DELIVERED' } }),
      prisma.order.aggregate({ _sum: { totalAmount: true }, where: { paymentStatus: 'PAID' } }),
    ]);

    res.json({
      success: true,
      stats: { totalOrders: total, pendingOrders: pending, deliveredOrders: delivered, totalRevenue: revenue._sum.totalAmount || 0 },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createOrder, getMyOrders, getOrder, getAllOrders, updateOrderStatus, getOrderStats };

// src/controllers/payment.controller.js
// Chapa — Ethiopian payment gateway (chapa.co)
const prisma = require('../utils/prisma');

// ── POST /api/payments/initialize ────────────────────────────
const initializePayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    if (order.userId !== req.user.id) return res.status(403).json({ success: false, message: 'Access denied.' });
    if (order.paymentStatus === 'PAID') return res.status(400).json({ success: false, message: 'Order already paid.' });

    const txRef = `KELEBET-${orderId}-${Date.now()}`;
    const amount = order.totalAmount + order.deliveryFee;

    // Call Chapa API
    const response = await fetch(`${process.env.CHAPA_BASE_URL}/transaction/initialize`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount.toString(),
        currency: 'ETB',
        email: order.user.email,
        first_name: order.user.name.split(' ')[0],
        last_name: order.user.name.split(' ')[1] || '',
        phone_number: order.user.phone || '',
        tx_ref: txRef,
        callback_url: `${process.env.CLIENT_URL}/payment/success?orderId=${orderId}`,
        return_url: `${process.env.CLIENT_URL}/orders/${orderId}`,
        customization: {
          title: 'Kelebet Pharmacy',
          description: `Payment for order #${orderId.substring(0, 8)}`,
        },
      }),
    });

    const data = await response.json();
    if (data.status !== 'success') {
      return res.status(400).json({ success: false, message: 'Payment initialization failed.', details: data });
    }

    // Save transaction reference
    await prisma.order.update({ where: { id: orderId }, data: { paymentRef: txRef } });

    res.json({ success: true, checkout_url: data.data.checkout_url, tx_ref: txRef });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/payments/verify ─────────────────────────────────
const verifyPayment = async (req, res) => {
  try {
    const { tx_ref } = req.body;

    const response = await fetch(`${process.env.CHAPA_BASE_URL}/transaction/verify/${tx_ref}`, {
      headers: { 'Authorization': `Bearer ${process.env.CHAPA_SECRET_KEY}` },
    });

    const data = await response.json();
    if (data.status !== 'success' || data.data.status !== 'success') {
      return res.status(400).json({ success: false, message: 'Payment not verified.' });
    }

    // Update order to PAID
    const order = await prisma.order.update({
      where: { paymentRef: tx_ref },
      data: { paymentStatus: 'PAID', status: 'CONFIRMED' },
    });

    res.json({ success: true, message: 'Payment verified! Your order is confirmed.', order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/payments/webhook ────────────────────────────────
// Chapa calls this URL automatically when payment completes
const handleWebhook = async (req, res) => {
  try {
    const { tx_ref, status } = req.body;
    if (status === 'success') {
      await prisma.order.update({
        where: { paymentRef: tx_ref },
        data: { paymentStatus: 'PAID', status: 'CONFIRMED' },
      });
    }
    res.json({ received: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { initializePayment, verifyPayment, handleWebhook };

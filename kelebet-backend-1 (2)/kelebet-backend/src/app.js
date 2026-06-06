// src/app.js — Kelebet Pharmacy API Entry Point
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();

// ── Security middleware ──────────────────────────────────────
app.use(helmet());
app.use(cors({
      origin: '*',
  credentials: true,
}));

// ── Rate limiting (100 requests per 15 min per IP) ──────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// ── Body parsing ─────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Logging ──────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// ── Routes ───────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth.routes'));
app.use('/api/products',      require('./routes/product.routes'));
app.use('/api/categories',    require('./routes/category.routes'));
app.use('/api/orders',        require('./routes/order.routes'));
app.use('/api/cart',          require('./routes/cart.routes'));
app.use('/api/prescriptions', require('./routes/prescription.routes'));
app.use('/api/users',         require('./routes/user.routes'));
app.use('/api/payments',      require('./routes/payment.routes'));

// ── Health check ─────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'OK', name: 'Kelebet Pharmacy API', version: '1.0.0' });
});

// ── 404 handler ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global error handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// ── Start server ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(🚀 Kelebet Pharmacy API running on http://localhost:${PORT});
    console.log(🏥 Health check: http://localhost:${PORT}/health);
});

module.exports = app;

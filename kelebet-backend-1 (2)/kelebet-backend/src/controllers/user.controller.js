// src/controllers/user.controller.js
const prisma = require('../utils/prisma');

// ── GET /api/users (Admin only) ───────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const where = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: { id: true, name: true, email: true, phone: true, role: true, isActive: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        skip, take: parseInt(limit),
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ success: true, users, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/users/:id/toggle-active (Admin only) ─────────────
const toggleUserActive = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: !user.isActive },
      select: { id: true, name: true, isActive: true },
    });
    res.json({ success: true, message: `User ${updated.isActive ? 'activated' : 'deactivated'}!`, user: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/users/:id/role (Admin only) ──────────────────────
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['CUSTOMER', 'PHARMACIST', 'ADMIN'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role.' });
    }
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });
    res.json({ success: true, message: 'Role updated!', user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/users/stats (Admin only) ────────────────────────
const getUserStats = async (req, res) => {
  try {
    const [total, customers, pharmacists, admins] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.user.count({ where: { role: 'PHARMACIST' } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
    ]);
    res.json({ success: true, stats: { total, customers, pharmacists, admins } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAllUsers, toggleUserActive, updateUserRole, getUserStats };

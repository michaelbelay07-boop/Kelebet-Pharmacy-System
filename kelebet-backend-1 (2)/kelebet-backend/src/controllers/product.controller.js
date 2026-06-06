// src/controllers/product.controller.js
const prisma = require('../utils/prisma');

// ── GET /api/products ─────────────────────────────────────────
const getProducts = async (req, res) => {
  try {
    const {
      page = 1, limit = 12,
      search, categoryId,
      requiresPrescription, minPrice, maxPrice,
      sortBy = 'createdAt', sortOrder = 'desc',
    } = req.query;

    const where = { isActive: true };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { genericName: { contains: search, mode: 'insensitive' } },
        { manufacturer: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (categoryId) where.categoryId = categoryId;
    if (requiresPrescription !== undefined) where.requiresPrescription = requiresPrescription === 'true';
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: { select: { id: true, name: true } } },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: parseInt(limit),
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      success: true,
      products,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/products/:id ─────────────────────────────────────
const getProduct = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        reviews: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/products (Admin only) ──────────────────────────
const createProduct = async (req, res) => {
  try {
    const product = await prisma.product.create({ data: req.body });
    res.status(201).json({ success: true, message: 'Product created!', product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/products/:id (Admin only) ───────────────────────
const updateProduct = async (req, res) => {
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, message: 'Product updated!', product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── DELETE /api/products/:id (Admin only) ────────────────────
const deleteProduct = async (req, res) => {
  try {
    await prisma.product.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.json({ success: true, message: 'Product removed.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/products/:id/reviews ───────────────────────────
const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await prisma.review.upsert({
      where: { userId_productId: { userId: req.user.id, productId: req.params.id } },
      update: { rating: parseInt(rating), comment },
      create: { userId: req.user.id, productId: req.params.id, rating: parseInt(rating), comment },
    });
    res.status(201).json({ success: true, message: 'Review submitted!', review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/products/low-stock (Admin) ──────────────────────
const getLowStock = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { stock: { lte: 20 }, isActive: true },
      orderBy: { stock: 'asc' },
    });
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, addReview, getLowStock };

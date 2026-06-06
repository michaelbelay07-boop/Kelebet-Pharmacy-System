// prisma/seed.js — Sample data for Kelebet Pharmacy
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Kelebet Pharmacy database...');

  // ── Admin user ──
  const adminPass = await bcrypt.hash('Admin@1234', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@kelebet.com' },
    update: {},
    create: {
      name: 'Kelebet Admin',
      email: 'admin@kelebet.com',
      password: adminPass,
      role: 'ADMIN',
      isVerified: true,
    },
  });

  // ── Pharmacist ──
  const pharmPass = await bcrypt.hash('Pharm@1234', 10);
  const pharmacist = await prisma.user.upsert({
    where: { email: 'pharmacist@kelebet.com' },
    update: {},
    create: {
      name: 'Dr. Tigist Bekele',
      email: 'pharmacist@kelebet.com',
      phone: '+251912345678',
      password: pharmPass,
      role: 'PHARMACIST',
      isVerified: true,
    },
  });

  // ── Test customer ──
  const custPass = await bcrypt.hash('Customer@1234', 10);
  await prisma.user.upsert({
    where: { email: 'customer@kelebet.com' },
    update: {},
    create: {
      name: 'Abebe Girma',
      email: 'customer@kelebet.com',
      phone: '+251987654321',
      password: custPass,
      role: 'CUSTOMER',
      isVerified: true,
    },
  });

  // ── Categories ──
  const categories = await Promise.all([
    prisma.category.upsert({ where: { name: 'Antibiotics' },    update: {}, create: { name: 'Antibiotics',    description: 'Medicines that fight bacterial infections' } }),
    prisma.category.upsert({ where: { name: 'Pain Relief' },    update: {}, create: { name: 'Pain Relief',    description: 'Painkillers and anti-inflammatory drugs' } }),
    prisma.category.upsert({ where: { name: 'Vitamins' },       update: {}, create: { name: 'Vitamins',       description: 'Vitamins and nutritional supplements' } }),
    prisma.category.upsert({ where: { name: 'Diabetes' },       update: {}, create: { name: 'Diabetes',       description: 'Diabetes management medicines' } }),
    prisma.category.upsert({ where: { name: 'Hypertension' },   update: {}, create: { name: 'Hypertension',   description: 'Blood pressure medicines' } }),
    prisma.category.upsert({ where: { name: 'Malaria' },        update: {}, create: { name: 'Malaria',        description: 'Antimalarial medicines' } }),
  ]);

  // ── Products ──
  const products = [
    { name: 'Amoxicillin 500mg', genericName: 'Amoxicillin', categoryId: categories[0].id, price: 45, stock: 200, unit: 'capsule', dosage: '500mg', manufacturer: 'Ethiopian Pharma', requiresPrescription: true },
    { name: 'Ciprofloxacin 500mg', genericName: 'Ciprofloxacin', categoryId: categories[0].id, price: 65, stock: 150, unit: 'tablet', dosage: '500mg', manufacturer: 'Addis Pharma', requiresPrescription: true },
    { name: 'Paracetamol 500mg', genericName: 'Paracetamol', categoryId: categories[1].id, price: 15, stock: 500, unit: 'tablet', dosage: '500mg', manufacturer: 'Ethiopian Pharma', requiresPrescription: false },
    { name: 'Ibuprofen 400mg', genericName: 'Ibuprofen', categoryId: categories[1].id, price: 25, stock: 300, unit: 'tablet', dosage: '400mg', manufacturer: 'Addis Pharma', requiresPrescription: false },
    { name: 'Vitamin C 1000mg', genericName: 'Ascorbic Acid', categoryId: categories[2].id, price: 120, stock: 400, unit: 'tablet', dosage: '1000mg', manufacturer: 'Mega Pharma', requiresPrescription: false },
    { name: 'Vitamin D3 5000IU', genericName: 'Cholecalciferol', categoryId: categories[2].id, price: 180, stock: 200, unit: 'capsule', dosage: '5000IU', manufacturer: 'Mega Pharma', requiresPrescription: false },
    { name: 'Metformin 500mg', genericName: 'Metformin HCl', categoryId: categories[3].id, price: 35, stock: 250, unit: 'tablet', dosage: '500mg', manufacturer: 'Ethiopian Pharma', requiresPrescription: true },
    { name: 'Amlodipine 5mg', genericName: 'Amlodipine', categoryId: categories[4].id, price: 55, stock: 180, unit: 'tablet', dosage: '5mg', manufacturer: 'Addis Pharma', requiresPrescription: true },
    { name: 'Artemether/Lumefantrine', genericName: 'Coartem', categoryId: categories[5].id, price: 85, stock: 300, unit: 'tablet', dosage: '20/120mg', manufacturer: 'Ethiopian Pharma', requiresPrescription: true },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { barcode: `KPH${p.name.replace(/\s/g, '').substring(0, 8)}` },
      update: {},
      create: { ...p, barcode: `KPH${p.name.replace(/\s/g, '').substring(0, 8)}` },
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log('');
  console.log('📋 Test accounts:');
  console.log('   Admin       → admin@kelebet.com       / Admin@1234');
  console.log('   Pharmacist  → pharmacist@kelebet.com  / Pharm@1234');
  console.log('   Customer    → customer@kelebet.com    / Customer@1234');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

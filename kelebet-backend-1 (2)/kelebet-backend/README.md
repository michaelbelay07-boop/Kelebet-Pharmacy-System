# Kelebet Pharmacy — Backend API

Complete REST API built with Node.js, Express, PostgreSQL, and Prisma.

---

## 🚀 Quick Start (step by step)

### Step 1 — Install dependencies
```bash
cd kelebet-backend
npm install
```

### Step 2 — Set up your environment file
```bash
cp .env.example .env
```
Then open `.env` and fill in your values (database URL, JWT secret, etc.)

### Step 3 — Set up your database
You need a PostgreSQL database. Easiest free option: **Railway**
1. Go to railway.app → New Project → PostgreSQL
2. Copy the connection string
3. Paste it as `DATABASE_URL` in your `.env` file

### Step 4 — Run database migrations
```bash
npm run db:migrate
```
This creates all the tables in your database.

### Step 5 — Seed sample data
```bash
npm run db:seed
```
This adds test medicines, categories, and user accounts.

### Step 6 — Start the server
```bash
npm run dev
```
Your API will be running at: **http://localhost:5000**

### Step 7 — Test it
Open your browser and go to: http://localhost:5000/health
You should see: `{"status":"OK","name":"Kelebet Pharmacy API"}`

---

## 📋 Test accounts (after seeding)

| Role        | Email                       | Password       |
|-------------|----------------------------|----------------|
| Admin       | admin@kelebet.com          | Admin@1234     |
| Pharmacist  | pharmacist@kelebet.com     | Pharm@1234     |
| Customer    | customer@kelebet.com       | Customer@1234  |

---

## 🗺️ API Endpoints

### Auth
| Method | URL                           | Access  | Description           |
|--------|-------------------------------|---------|-----------------------|
| POST   | /api/auth/register            | Public  | Create account        |
| POST   | /api/auth/login               | Public  | Login → get token     |
| GET    | /api/auth/me                  | Private | Get my profile        |
| PUT    | /api/auth/update-profile      | Private | Update profile        |
| PUT    | /api/auth/change-password     | Private | Change password       |

### Products (Medicines)
| Method | URL                           | Access  | Description           |
|--------|-------------------------------|---------|-----------------------|
| GET    | /api/products                 | Public  | List all medicines    |
| GET    | /api/products/:id             | Public  | Get one medicine      |
| POST   | /api/products                 | Admin   | Add medicine          |
| PUT    | /api/products/:id             | Admin   | Update medicine       |
| DELETE | /api/products/:id             | Admin   | Remove medicine       |
| POST   | /api/products/:id/reviews     | Private | Add review            |
| GET    | /api/products/low-stock       | Admin   | Low stock alert       |

### Orders
| Method | URL                           | Access  | Description           |
|--------|-------------------------------|---------|-----------------------|
| POST   | /api/orders                   | Private | Place order           |
| GET    | /api/orders/my                | Private | My orders             |
| GET    | /api/orders/:id               | Private | Order details         |
| GET    | /api/orders/all               | Admin   | All orders            |
| PUT    | /api/orders/:id/status        | Admin   | Update order status   |
| GET    | /api/orders/stats             | Admin   | Revenue & stats       |

### Cart
| Method | URL                           | Access  | Description           |
|--------|-------------------------------|---------|-----------------------|
| GET    | /api/cart                     | Private | View cart             |
| POST   | /api/cart                     | Private | Add to cart           |
| PUT    | /api/cart/:id                 | Private | Update quantity       |
| DELETE | /api/cart/:id                 | Private | Remove item           |
| DELETE | /api/cart/clear               | Private | Clear cart            |

### Prescriptions
| Method | URL                              | Access      | Description           |
|--------|----------------------------------|-------------|-----------------------|
| POST   | /api/prescriptions/upload        | Private     | Upload prescription   |
| GET    | /api/prescriptions/my            | Private     | My prescriptions      |
| GET    | /api/prescriptions               | Pharmacist  | All prescriptions     |
| PUT    | /api/prescriptions/:id/verify    | Pharmacist  | Approve/reject        |

### Payments (Chapa — Ethiopian)
| Method | URL                           | Access  | Description           |
|--------|-------------------------------|---------|-----------------------|
| POST   | /api/payments/initialize      | Private | Start payment         |
| POST   | /api/payments/verify          | Private | Verify payment        |
| POST   | /api/payments/webhook         | Public  | Chapa callback        |

---

## 🌐 Deploying to Railway (free)

1. Go to **railway.app** → Sign up with GitHub
2. New Project → Deploy from GitHub repo
3. Add your `.env` variables in Railway dashboard
4. Railway gives you a public URL automatically!

---

## 📁 Project Structure

```
kelebet-backend/
├── src/
│   ├── app.js                  ← Entry point
│   ├── routes/                 ← URL routing
│   │   ├── auth.routes.js
│   │   ├── product.routes.js
│   │   ├── order.routes.js
│   │   ├── cart.routes.js
│   │   ├── prescription.routes.js
│   │   ├── category.routes.js
│   │   ├── user.routes.js
│   │   └── payment.routes.js
│   ├── controllers/            ← Business logic
│   │   ├── auth.controller.js
│   │   ├── product.controller.js
│   │   ├── order.controller.js
│   │   ├── cart.controller.js
│   │   ├── prescription.controller.js
│   │   ├── category.controller.js
│   │   ├── user.controller.js
│   │   └── payment.controller.js
│   ├── middleware/
│   │   └── auth.middleware.js  ← JWT protection
│   └── utils/
│       └── prisma.js           ← Database client
├── prisma/
│   ├── schema.prisma           ← Database tables
│   └── seed.js                 ← Sample data
├── .env.example                ← Copy to .env
├── package.json
└── README.md
```

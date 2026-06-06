# Kelebet Pharmacy — Admin Dashboard (Step 4)

React admin panel for managing Kelebet Pharmacy.
Runs on port 3001. Only ADMIN and PHARMACIST accounts can log in.

---

## 🚀 How to Run

```bash
# 1. Make sure your backend is running first
cd kelebet-backend && npm run dev

# 2. Run the admin panel
cd kelebet-admin
npm install
cp .env.example .env
npm run dev
```

Open: **http://localhost:3001**

---

## 🔐 Login Credentials (from seed data)

| Role       | Email                      | Password     | Access         |
|------------|----------------------------|--------------|----------------|
| Admin      | admin@kelebet.com          | Admin@1234   | Full access    |
| Pharmacist | pharmacist@kelebet.com     | Pharm@1234   | Orders + Rx    |

---

## 📋 Pages & Features

| Page            | Who Can Access | Features |
|-----------------|----------------|----------|
| Dashboard       | All staff      | Revenue chart, order stats, low stock alerts |
| Products        | Admin only     | Add/edit/delete medicines, toggle Rx, set price |
| Categories      | Admin only     | Add/edit/delete medicine categories |
| Orders          | All staff      | View all orders, filter by status, update status |
| Prescriptions   | All staff      | View uploads, approve or reject with notes |
| Users           | Admin only     | View customers, activate/deactivate, change roles |

---

## 🏗️ Structure

```
kelebet-admin/
├── src/
│   ├── main.jsx
│   ├── App.jsx               ← Routes with role-based guards
│   ├── api/client.js         ← API calls (same backend as web)
│   ├── context/AuthContext.jsx
│   ├── components/layout/
│   │   ├── AdminLayout.jsx   ← Sidebar + topbar wrapper
│   │   ├── Sidebar.jsx       ← Dark sidebar with nav links
│   │   └── Topbar.jsx        ← Header with page title
│   └── pages/
│       ├── LoginPage.jsx
│       ├── DashboardPage.jsx ← Charts + stats + alerts
│       ├── ProductsPage.jsx  ← Full medicine CRUD
│       ├── CategoriesPage.jsx
│       ├── OrdersPage.jsx    ← Order management
│       ├── PrescriptionsPage.jsx ← Rx approval workflow
│       └── UsersPage.jsx     ← User management
```

---

## 🌐 Deploy to Vercel

Same as the web app — push to GitHub, import on Vercel, set:
`VITE_API_URL=https://your-backend.railway.app/api`

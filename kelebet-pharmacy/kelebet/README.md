# Kelebet Pharmacy — React Native App

A full-featured pharmacy mobile app built with React Native + Expo.

## Features

- 🔐 Authentication (Login / Register with secure token storage)
- 🏠 Home screen with product search, categories & featured items
- 💊 Product detail with Rx requirement check
- 🛒 Cart with quantity management
- 💳 Checkout with address + payment method (Telebirr, CBE Birr, Cash)
- 📦 Orders list + detail with live status tracker
- 📋 Prescriptions — camera & gallery upload
- 👤 Profile with edit, notifications toggle, logout
- 🌿 Ethiopian green theme with ETB currency

## Project Structure

```
kelebet/
├── App.js                         # Root entry
├── app.json                       # Expo config
├── package.json
├── babel.config.js
└── src/
    ├── api/
    │   └── client.js              # Axios API client (auth, products, cart, orders, prescriptions)
    ├── context/
    │   ├── AuthContext.js         # Auth state + SecureStore
    │   └── CartContext.js         # Cart state with optimistic updates
    ├── navigation/
    │   └── index.js               # Tab + Stack navigators
    ├── theme/
    │   └── index.js               # Colors, typography, spacing, shadows
    ├── components/
    │   ├── index.js               # Button, Input, Card, Badge, EmptyState, etc.
    │   └── ProductCard.js         # Product grid/horizontal card
    └── screens/
        ├── auth/
        │   ├── LoginScreen.js
        │   └── RegisterScreen.js
        └── customer/
            ├── HomeScreen.js
            ├── ProductDetailScreen.js
            ├── CartScreen.js
            ├── CheckoutScreen.js
            ├── OrdersScreen.js
            ├── OrderDetailScreen.js
            ├── PrescriptionsScreen.js
            └── ProfileScreen.js
```

## Setup

### 1. Install dependencies
```bash
cd kelebet
npm install
```

### 2. Configure your API
Edit `src/api/client.js` and update `BASE_URL`:
```js
const BASE_URL = 'https://your-api-server.com/v1';
```
> **Note:** The app works in demo mode with fake data if no API is connected.

### 3. Start the app
```bash
npx expo start
```
Scan the QR code with the **Expo Go** app on your Android/iOS device.

## API Endpoints Expected

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/login | Login |
| POST | /auth/register | Register |
| GET | /products | List products |
| GET | /products/featured | Featured products |
| GET | /cart | Get cart |
| POST | /cart/items | Add to cart |
| GET | /orders | Get orders |
| POST | /orders | Place order |
| GET | /prescriptions | List prescriptions |
| POST | /prescriptions | Upload prescription |

## Demo Mode

All screens work without a live API — demo data is used as fallback. Great for testing and presentation!

## Customization

- **Colors**: Edit `src/theme/index.js` → `colors`
- **API URL**: Edit `src/api/client.js` → `BASE_URL`
- **Currency**: Search `ETB` → replace with your currency
- **App name**: Edit `app.json` → `name`

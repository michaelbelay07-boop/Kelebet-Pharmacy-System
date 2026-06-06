// src/api/client.js
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'http://localhost:5000/api/v1'; // Replace with your actual API URl

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
client.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('auth_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {}
  return config;
});

// Handle 401 globally
client.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('auth_token');
    }
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (email, password) => client.post('/auth/login', { email, password }),
  register: (data) => client.post('/auth/register', data),
  logout: () => client.post('/auth/logout'),
  getProfile: () => client.get('/auth/profile'),
  updateProfile: (data) => client.put('/auth/profile', data),
  changePassword: (data) => client.put('/auth/change-password', data),
};

// ─── Products ────────────────────────────────────────────────────────────────
export const productsAPI = {
  getAll: (params) => client.get('/products', { params }),
  getById: (id) => client.get(`/products/${id}`),
  search: (query) => client.get('/products/search', { params: { q: query } }),
  getCategories: () => client.get('/products/categories'),
  getFeatured: () => client.get('/products/featured'),
};

// ─── Cart ─────────────────────────────────────────────────────────────────────
export const cartAPI = {
  get: () => client.get('/cart'),
  addItem: (productId, quantity) => client.post('/cart/items', { productId, quantity }),
  updateItem: (itemId, quantity) => client.put(`/cart/items/${itemId}`, { quantity }),
  removeItem: (itemId) => client.delete(`/cart/items/${itemId}`),
  clear: () => client.delete('/cart'),
};

// ─── Orders ──────────────────────────────────────────────────────────────────
export const ordersAPI = {
  getAll: () => client.get('/orders'),
  getById: (id) => client.get(`/orders/${id}`),
  create: (data) => client.post('/orders', data),
  cancel: (id) => client.put(`/orders/${id}/cancel`),
};

// ─── Prescriptions ───────────────────────────────────────────────────────────
export const prescriptionsAPI = {
  getAll: () => client.get('/prescriptions'),
  getById: (id) => client.get(`/prescriptions/${id}`),
  upload: (formData) =>
    client.post('/prescriptions', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id) => client.delete(`/prescriptions/${id}`),
};

// ─── Addresses ───────────────────────────────────────────────────────────────
export const addressAPI = {
  getAll: () => client.get('/addresses'),
  add: (data) => client.post('/addresses', data),
  update: (id, data) => client.put(`/addresses/${id}`, data),
  delete: (id) => client.delete(`/addresses/${id}`),
  setDefault: (id) => client.put(`/addresses/${id}/default`),
};

export default client;

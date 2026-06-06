// src/api/client.js
import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api', timeout: 15000 })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kelebet_admin_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) { localStorage.removeItem('kelebet_admin_token'); window.location.href = '/login' }
    return Promise.reject(err.response?.data || { message: 'Network error' })
  }
)

export const authAPI = {
  login:  (data) => api.post('/auth/login', data),
  getMe:  ()     => api.get('/auth/me'),
}
export const productAPI = {
  getAll:     (params) => api.get('/products', { params }),
  getOne:     (id)     => api.get(`/products/${id}`),
  create:     (data)   => api.post('/products', data),
  update:     (id, d)  => api.put(`/products/${id}`, d),
  delete:     (id)     => api.delete(`/products/${id}`),
  getLowStock:()       => api.get('/products/low-stock'),
}
export const categoryAPI = {
  getAll:  () => api.get('/categories'),
  create:  (data) => api.post('/categories', data),
  update:  (id, data) => api.put(`/categories/${id}`, data),
  delete:  (id) => api.delete(`/categories/${id}`),
}
export const orderAPI = {
  getAll:       (params) => api.get('/orders/all', { params }),
  getOne:       (id)     => api.get(`/orders/${id}`),
  updateStatus: (id, d)  => api.put(`/orders/${id}/status`, d),
  getStats:     ()       => api.get('/orders/stats'),
}
export const prescriptionAPI = {
  getAll:  (params) => api.get('/prescriptions', { params }),
  verify:  (id, d)  => api.put(`/prescriptions/${id}/verify`, d),
}
export const userAPI = {
  getAll:       (params) => api.get('/users', { params }),
  getStats:     ()       => api.get('/users/stats'),
  toggleActive: (id)     => api.put(`/users/${id}/toggle-active`),
  updateRole:   (id, d)  => api.put(`/users/${id}/role`, d),
}
export default api

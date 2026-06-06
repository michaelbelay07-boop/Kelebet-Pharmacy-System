import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import AdminLayout from './components/layout/AdminLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ProductsPage from './pages/ProductsPage'
import OrdersPage from './pages/OrdersPage'
import PrescriptionsPage from './pages/PrescriptionsPage'
import UsersPage from './pages/UsersPage'
import CategoriesPage from './pages/CategoriesPage'

const Guard = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"/></div>
  if (!user) return <Navigate to="/login" replace/>
  if (adminOnly && user.role !== 'ADMIN') return <Navigate to="/" replace/>
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage/>}/>
        <Route path="/" element={<Guard><AdminLayout/></Guard>}>
          <Route index element={<DashboardPage/>}/>
          <Route path="products"      element={<ProductsPage/>}/>
          <Route path="categories"    element={<Guard adminOnly><CategoriesPage/></Guard>}/>
          <Route path="orders"        element={<OrdersPage/>}/>
          <Route path="prescriptions" element={<PrescriptionsPage/>}/>
          <Route path="users"         element={<Guard adminOnly><UsersPage/></Guard>}/>
        </Route>
      </Routes>
    </AuthProvider>
  )
}

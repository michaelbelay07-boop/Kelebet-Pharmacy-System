import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FiGrid, FiPackage, FiShoppingBag, FiFileText, FiUsers, FiLogOut } from 'react-icons/fi'

const links = [
  { to: '/', icon: <FiGrid size={18}/>, label: 'Dashboard', end: true },
  { to: '/products', icon: <FiPackage size={18}/>, label: 'Medicines' },
  { to: '/orders', icon: <FiShoppingBag size={18}/>, label: 'Orders' },
  { to: '/prescriptions', icon: <FiFileText size={18}/>, label: 'Prescriptions' },
  { to: '/users', icon: <FiUsers size={18}/>, label: 'Users' },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 flex flex-col flex-shrink-0">
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <div>
              <p className="text-white font-bold text-sm">Kelebet</p>
              <p className="text-gray-400 text-[10px]">Admin Panel</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {links.map(l => (
            <NavLink key={l.to} to={l.to} end={l.end}
              className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
              {l.icon} {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-800">
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            <div className="w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center text-xs font-bold text-white">{user?.name?.[0]}</div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{user?.name}</p>
              <p className="text-gray-500 text-[10px]">{user?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-red-400 text-sm rounded-xl hover:bg-gray-800 transition-all">
            <FiLogOut size={15}/> Sign Out
          </button>
        </div>
      </aside>
      {/* Main */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <Outlet/>
      </main>
    </div>
  )
}

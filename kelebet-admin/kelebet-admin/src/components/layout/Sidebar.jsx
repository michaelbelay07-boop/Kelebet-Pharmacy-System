import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  FiGrid, FiPackage, FiShoppingBag, FiFileText,
  FiUsers, FiTag, FiLogOut, FiX
} from 'react-icons/fi'

const links = [
  { to:'/',             icon:<FiGrid/>,       label:'Dashboard',     exact:true },
  { to:'/products',     icon:<FiPackage/>,    label:'Products'  },
  { to:'/categories',   icon:<FiTag/>,        label:'Categories',    adminOnly:true },
  { to:'/orders',       icon:<FiShoppingBag/>,label:'Orders'    },
  { to:'/prescriptions',icon:<FiFileText/>,   label:'Prescriptions' },
  { to:'/users',        icon:<FiUsers/>,      label:'Users',         adminOnly:true },
]

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  const visibleLinks = links.filter(l => !l.adminOnly || user?.role === 'ADMIN')

  return (
    <>
      {/* Overlay on mobile */}
      {open && <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={onClose}/>}

      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-60 bg-gray-900 flex flex-col transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>

        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">Kelebet</p>
              <p className="text-gray-400 text-[10px] mt-0.5">Admin Panel</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white"><FiX size={18}/></button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {visibleLinks.map(link => (
            <NavLink key={link.to} to={link.to} end={link.exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${isActive ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`
              }
              onClick={onClose}>
              <span className="text-base">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* User + logout */}
        <div className="px-3 py-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-3 py-2.5 mb-2">
            <div className="w-8 h-8 bg-primary-700 rounded-full flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-xs">{user?.name?.[0]?.toUpperCase()}</span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">{user?.name}</p>
              <p className="text-gray-400 text-[10px]">{user?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
            <FiLogOut/> Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}

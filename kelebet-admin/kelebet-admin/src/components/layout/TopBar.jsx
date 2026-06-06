import { FiMenu, FiBell } from 'react-icons/fi'
import { useLocation } from 'react-router-dom'

const PAGE_TITLES = {
  '/':              'Dashboard',
  '/orders':        'Orders',
  '/prescriptions': 'Prescriptions',
  '/products':      'Products',
  '/categories':    'Categories',
  '/low-stock':     'Low Stock Alert',
  '/users':         'Users',
}

export default function TopBar({ onMenuClick }) {
  const { pathname } = useLocation()
  const base = '/' + pathname.split('/')[1]
  const title = PAGE_TITLES[base] || 'Admin'

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 h-14 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="md:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100">
          <FiMenu size={20}/>
        </button>
        <h1 className="font-semibold text-gray-900">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg relative">
          <FiBell size={18}/>
        </button>
        <span className="text-xs text-gray-400 hidden sm:block">{new Date().toLocaleDateString('en-ET',{weekday:'long',month:'short',day:'numeric'})}</span>
      </div>
    </header>
  )
}

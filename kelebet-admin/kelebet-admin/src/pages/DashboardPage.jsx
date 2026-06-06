import { useState, useEffect } from 'react'
import { orderAPI, userAPI, productAPI } from '../api/client'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { FiShoppingBag, FiUsers, FiPackage, FiDollarSign, FiAlertTriangle } from 'react-icons/fi'

const SAMPLE_CHART = [
  { month:'Jan', revenue:12400, orders:34 }, { month:'Feb', revenue:18200, orders:52 },
  { month:'Mar', revenue:15800, orders:41 }, { month:'Apr', revenue:22100, orders:63 },
  { month:'May', revenue:19500, orders:55 }, { month:'Jun', revenue:28400, orders:78 },
  { month:'Jul', revenue:31200, orders:89 }, { month:'Aug', revenue:26700, orders:71 },
]

export default function DashboardPage() {
  const [orderStats, setOrderStats] = useState(null)
  const [userStats,  setUserStats]  = useState(null)
  const [lowStock,   setLowStock]   = useState([])
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    Promise.all([orderAPI.getStats(), userAPI.getStats(), productAPI.getLowStock()])
      .then(([o, u, p]) => {
        setOrderStats(o.stats)
        setUserStats(u.stats)
        setLowStock(p.products || [])
      })
      .finally(() => setLoading(false))
  }, [])

  const stats = [
    { label:'Total Revenue',  value: orderStats ? `${(orderStats.totalRevenue/1000).toFixed(1)}K ETB` : '—', icon:<FiDollarSign size={20}/>, color:'bg-green-50 text-green-600',  change:'+12%' },
    { label:'Total Orders',   value: orderStats?.totalOrders  ?? '—', icon:<FiShoppingBag size={20}/>, color:'bg-blue-50 text-blue-600',   change:'+8%'  },
    { label:'Pending Orders', value: orderStats?.pendingOrders ?? '—', icon:<FiPackage size={20}/>,    color:'bg-orange-50 text-orange-600',change:'Today'},
    { label:'Total Customers',value: userStats?.customers      ?? '—', icon:<FiUsers size={20}/>,      color:'bg-purple-50 text-purple-600',change:'+5%'  },
  ]

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${s.color}`}>{s.icon}</div>
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{s.change}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{loading ? <span className="skeleton w-16 h-6 inline-block"/> : s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Revenue chart */}
        <div className="card p-5 lg:col-span-2">
          <h2 className="font-bold text-gray-800 mb-4">Revenue Overview</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={SAMPLE_CHART}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22a07a" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#22a07a" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="month" tick={{ fontSize:12, fill:'#9ca3af' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:12, fill:'#9ca3af' }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ borderRadius:'12px', border:'none', boxShadow:'0 4px 20px rgba(0,0,0,0.1)' }}/>
              <Area type="monotone" dataKey="revenue" stroke="#22a07a" strokeWidth={2.5} fill="url(#rev)"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Orders bar chart */}
        <div className="card p-5">
          <h2 className="font-bold text-gray-800 mb-4">Orders / Month</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={SAMPLE_CHART}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="month" tick={{ fontSize:11, fill:'#9ca3af' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:11, fill:'#9ca3af' }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ borderRadius:'12px', border:'none', boxShadow:'0 4px 20px rgba(0,0,0,0.1)' }}/>
              <Bar dataKey="orders" fill="#22a07a" radius={[6,6,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <FiAlertTriangle className="text-orange-500" size={18}/>
            <h2 className="font-bold text-gray-800">Low Stock Alert ({lowStock.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100">
                <th className="th">Medicine</th><th className="th">Category</th><th className="th">Stock</th><th className="th">Status</th>
              </tr></thead>
              <tbody>
                {lowStock.slice(0, 8).map(p => (
                  <tr key={p.id} className="table-row">
                    <td className="td font-medium">{p.name}</td>
                    <td className="td text-gray-400">{p.dosage}</td>
                    <td className="td font-bold text-orange-600">{p.stock}</td>
                    <td className="td"><span className={`badge ${p.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>{p.stock === 0 ? 'Out of Stock' : 'Low Stock'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

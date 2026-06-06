import { useState, useEffect } from 'react'
import { orderAPI } from '../api/client'
import { toast } from 'react-hot-toast'
import { FiEye, FiX, FiPackage, FiMapPin, FiPhone } from 'react-icons/fi'

const STATUS_COLORS = {
  PENDING:'bg-yellow-100 text-yellow-700', CONFIRMED:'bg-blue-100 text-blue-700',
  PROCESSING:'bg-purple-100 text-purple-700', SHIPPED:'bg-indigo-100 text-indigo-700',
  DELIVERED:'bg-green-100 text-green-700', CANCELLED:'bg-red-100 text-red-700',
}
const ALL_STATUSES = ['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED']

export default function OrdersPage() {
  const [orders,     setOrders]     = useState([])
  const [pagination, setPagination] = useState({})
  const [loading,    setLoading]    = useState(true)
  const [filter,     setFilter]     = useState('')
  const [page,       setPage]       = useState(1)
  const [selected,   setSelected]   = useState(null)
  const [updating,   setUpdating]   = useState(false)

  const fetchOrders = () => {
    setLoading(true)
    orderAPI.getAll({ status: filter || undefined, page, limit: 15 })
      .then(r => { setOrders(r.orders||[]); setPagination(r.pagination||{}) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchOrders() }, [filter, page])

  const handleStatus = async (id, status) => {
    setUpdating(true)
    try {
      await orderAPI.updateStatus(id, { status })
      toast.success(`Order marked as ${status}`)
      fetchOrders()
      if (selected?.id === id) setSelected(s => ({...s, status}))
    } catch (e) { toast.error(e.message) }
    finally { setUpdating(false) }
  }

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {['', ...ALL_STATUSES].map(s => (
          <button key={s} onClick={() => { setFilter(s); setPage(1) }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter===s ? 'bg-primary-600 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:border-primary-300'}`}>
            {s || 'All Orders'}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="th">Order ID</th>
                <th className="th">Customer</th>
                <th className="th">Items</th>
                <th className="th">Total</th>
                <th className="th">Payment</th>
                <th className="th">Status</th>
                <th className="th">Date</th>
                <th className="th">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(8)].map((_,i) => (
                <tr key={i} className="border-b border-gray-50">
                  {[...Array(8)].map((_,j) => <td key={j} className="td"><div className="skeleton h-4 rounded w-20"/></td>)}
                </tr>
              )) : orders.map(o => (
                <tr key={o.id} className="table-row">
                  <td className="td font-mono text-xs font-semibold text-gray-600">#{o.id.substring(0,8).toUpperCase()}</td>
                  <td className="td">
                    <p className="font-medium text-gray-800 text-xs">{o.user?.name}</p>
                    <p className="text-gray-400 text-xs">{o.user?.phone}</p>
                  </td>
                  <td className="td text-gray-500">{o.items?.length} item(s)</td>
                  <td className="td font-semibold text-primary-700">{(o.totalAmount + o.deliveryFee).toFixed(0)} ETB</td>
                  <td className="td">
                    <span className={`badge ${o.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{o.paymentStatus}</span>
                  </td>
                  <td className="td"><span className={`badge ${STATUS_COLORS[o.status]}`}>{o.status}</span></td>
                  <td className="td text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className="td">
                    <button onClick={() => setSelected(o)} className="btn-ghost p-2 text-primary-600"><FiEye size={14}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pagination.pages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-gray-100">
            {[...Array(pagination.pages)].map((_,i) => (
              <button key={i} onClick={() => setPage(i+1)}
                className={`w-8 h-8 rounded-lg text-sm font-medium ${page===i+1?'bg-primary-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{i+1}</button>
            ))}
          </div>
        )}
      </div>

      {/* Order detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
              <div>
                <h2 className="font-bold text-gray-900">Order #{selected.id.substring(0,8).toUpperCase()}</h2>
                <p className="text-xs text-gray-400">{new Date(selected.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-gray-100 rounded-xl"><FiX size={18}/></button>
            </div>
            <div className="p-5 space-y-5">
              {/* Customer */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Customer</p>
                <p className="font-semibold text-gray-800">{selected.user?.name}</p>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1"><FiPhone size={11}/>{selected.user?.phone}</div>
                <div className="flex items-start gap-1 text-xs text-gray-500 mt-1"><FiMapPin size={11} className="mt-0.5"/>{selected.address}</div>
              </div>
              {/* Items */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Items</p>
                <div className="space-y-2">
                  {selected.items?.map(item => (
                    <div key={item.id} className="flex items-center justify-between text-sm bg-gray-50 rounded-xl px-3 py-2">
                      <div>
                        <p className="font-medium text-gray-800">{item.product?.name}</p>
                        <p className="text-xs text-gray-400">x{item.quantity} × {item.price} ETB</p>
                      </div>
                      <p className="font-semibold">{(item.quantity * item.price).toFixed(0)} ETB</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-bold text-gray-900 pt-3 mt-2 border-t border-gray-100 text-sm">
                  <span>Total</span><span>{(selected.totalAmount + selected.deliveryFee).toFixed(0)} ETB</span>
                </div>
              </div>
              {/* Update status */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {ALL_STATUSES.map(s => (
                    <button key={s} disabled={updating || selected.status === s}
                      onClick={() => handleStatus(selected.id, s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all
                        ${selected.status === s ? STATUS_COLORS[s] + ' border-transparent' : 'border-gray-200 text-gray-500 hover:border-primary-300 hover:text-primary-600'}
                        disabled:opacity-50`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

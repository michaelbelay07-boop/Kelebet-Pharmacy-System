import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { orderAPI } from '../api/client'
import { toast } from 'react-hot-toast'
import { FiArrowLeft, FiMapPin, FiPhone } from 'react-icons/fi'

const STATUSES = ['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED']
const STATUS_COLOR = {
  PENDING:'bg-yellow-100 text-yellow-700', CONFIRMED:'bg-blue-100 text-blue-700',
  PROCESSING:'bg-purple-100 text-purple-700', SHIPPED:'bg-indigo-100 text-indigo-700',
  DELIVERED:'bg-green-100 text-green-700', CANCELLED:'bg-red-100 text-red-700',
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    orderAPI.getOne(id).then(r => setOrder(r.order)).finally(() => setLoading(false))
  }, [id])

  const handleStatusChange = async (status) => {
    setUpdating(true)
    try {
      const res = await orderAPI.updateStatus(id, { status })
      setOrder(res.order)
      toast.success(`Order marked as ${status}`)
    } catch (e) { toast.error(e.message) }
    finally { setUpdating(false) }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"/></div>
  if (!order) return <div className="text-center py-20 text-gray-400">Order not found</div>

  return (
    <div className="space-y-4 max-w-4xl">
      <button onClick={() => navigate('/orders')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors">
        <FiArrowLeft size={14}/> Back to Orders
      </button>

      {/* Header */}
      <div className="card p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Order #{id.substring(0,8).toUpperCase()}</h1>
          <p className="text-sm text-gray-400 mt-1">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`badge text-sm py-1 px-3 ${STATUS_COLOR[order.status]}`}>{order.status}</span>
          <span className={`badge ${order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{order.paymentStatus}</span>
        </div>
      </div>

      {/* Status updater */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-800 mb-3">Update Order Status</h2>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map(s => (
            <button key={s} onClick={() => handleStatusChange(s)} disabled={updating || order.status === s}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${order.status === s ? 'ring-2 ring-primary-400 ' + STATUS_COLOR[s] : 'bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Customer info */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-800 mb-3">Customer</h2>
          <div className="space-y-2 text-sm">
            <p className="font-medium text-gray-900">{order.user?.name}</p>
            <p className="text-gray-500">{order.user?.email}</p>
            <div className="flex items-center gap-1 text-gray-600"><FiPhone size={13}/>{order.phone}</div>
            <div className="flex items-start gap-1 text-gray-600"><FiMapPin size={13} className="mt-0.5 shrink-0"/>{order.address}</div>
            {order.notes && <p className="text-gray-400 italic text-xs border-t border-gray-100 pt-2">"{order.notes}"</p>}
          </div>
        </div>

        {/* Payment summary */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-800 mb-3">Payment Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{order.totalAmount.toFixed(2)} ETB</span></div>
            <div className="flex justify-between text-gray-600"><span>Delivery</span><span>{order.deliveryFee === 0 ? 'Free' : `${order.deliveryFee} ETB`}</span></div>
            <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-2"><span>Total</span><span>{(order.totalAmount + order.deliveryFee).toFixed(2)} ETB</span></div>
            <p className="text-xs text-gray-400">Method: {order.paymentMethod}</p>
            {order.paymentRef && <p className="text-xs text-gray-400 font-mono">Ref: {order.paymentRef}</p>}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Items ({order.items?.length})</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="table-th">Medicine</th>
              <th className="table-th text-center">Qty</th>
              <th className="table-th text-right">Unit Price</th>
              <th className="table-th text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map(item => (
              <tr key={item.id} className="table-tr">
                <td className="table-td">
                  <p className="font-medium text-gray-800">{item.product?.name}</p>
                  <p className="text-xs text-gray-400">{item.product?.dosage}</p>
                </td>
                <td className="table-td text-center">{item.quantity}</td>
                <td className="table-td text-right">{item.price.toFixed(2)} ETB</td>
                <td className="table-td text-right font-semibold">{(item.quantity * item.price).toFixed(2)} ETB</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

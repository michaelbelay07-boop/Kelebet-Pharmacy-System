import { useState, useEffect } from 'react'
import { prescriptionAPI } from '../api/client'
import { toast } from 'react-hot-toast'
import { FiCheck, FiX, FiEye, FiClock, FiFileText } from 'react-icons/fi'

const STATUS_UI = {
  PENDING:  { color:'bg-yellow-100 text-yellow-700', icon:<FiClock size={11}/> },
  APPROVED: { color:'bg-green-100 text-green-700',   icon:<FiCheck size={11}/> },
  REJECTED: { color:'bg-red-100 text-red-700',       icon:<FiX size={11}/> },
}

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState([])
  const [loading,       setLoading]       = useState(true)
  const [filter,        setFilter]        = useState('PENDING')
  const [selected,      setSelected]      = useState(null)
  const [notes,         setNotes]         = useState('')
  const [acting,        setActing]        = useState(false)

  const fetch = () => {
    setLoading(true)
    prescriptionAPI.getAll({ status: filter || undefined })
      .then(r => setPrescriptions(r.prescriptions||[]))
      .finally(() => setLoading(false))
  }

  useEffect(fetch, [filter])

  const handleVerify = async (id, status) => {
    setActing(true)
    try {
      await prescriptionAPI.verify(id, { status, notes })
      toast.success(`Prescription ${status.toLowerCase()}!`)
      setSelected(null); setNotes('')
      fetch()
    } catch (e) { toast.error(e.message) }
    finally { setActing(false) }
  }

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2">
        {[['PENDING','Pending'], ['APPROVED','Approved'], ['REJECTED','Rejected'], ['','All']].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter===v ? 'bg-primary-600 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:border-primary-300'}`}>
            {l}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="th">Patient</th>
                <th className="th">Doctor / Hospital</th>
                <th className="th">Uploaded</th>
                <th className="th">Status</th>
                <th className="th">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(5)].map((_,i) => (
                <tr key={i} className="border-b border-gray-50">
                  {[...Array(5)].map((_,j) => <td key={j} className="td"><div className="skeleton h-4 rounded w-24"/></td>)}
                </tr>
              )) : prescriptions.length === 0 ? (
                <tr><td colSpan={5} className="td text-center py-12 text-gray-400">
                  <FiFileText size={40} className="mx-auto mb-2 text-gray-200"/><p>No prescriptions found</p>
                </td></tr>
              ) : prescriptions.map(rx => (
                <tr key={rx.id} className="table-row">
                  <td className="td">
                    <p className="font-medium text-gray-800">{rx.user?.name}</p>
                    <p className="text-xs text-gray-400">{rx.user?.email}</p>
                  </td>
                  <td className="td">
                    <p className="text-sm">{rx.doctorName ? `Dr. ${rx.doctorName}` : '—'}</p>
                    <p className="text-xs text-gray-400">{rx.hospitalName || ''}</p>
                  </td>
                  <td className="td text-xs text-gray-400">{new Date(rx.createdAt).toLocaleDateString()}</td>
                  <td className="td">
                    <span className={`badge ${STATUS_UI[rx.status].color}`}>{STATUS_UI[rx.status].icon}{rx.status}</span>
                  </td>
                  <td className="td">
                    <button onClick={() => { setSelected(rx); setNotes('') }} className="btn-ghost p-2 text-primary-600"><FiEye size={14}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Review Prescription</h2>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-gray-100 rounded-xl"><FiX size={18}/></button>
            </div>
            <div className="p-5 space-y-4">
              {/* Patient info */}
              <div className="bg-gray-50 rounded-xl p-4 text-sm">
                <p><span className="font-semibold">Patient:</span> {selected.user?.name}</p>
                <p><span className="font-semibold">Phone:</span> {selected.user?.phone || '—'}</p>
                {selected.doctorName && <p><span className="font-semibold">Doctor:</span> Dr. {selected.doctorName}</p>}
                {selected.hospitalName && <p><span className="font-semibold">Hospital:</span> {selected.hospitalName}</p>}
              </div>
              {/* Image */}
              {selected.imageUrl && (
                <a href={selected.imageUrl} target="_blank" rel="noreferrer" className="block">
                  {selected.imageUrl.match(/\.(jpg|jpeg|png|webp)/i)
                    ? <img src={selected.imageUrl} alt="Prescription" className="w-full max-h-64 object-contain rounded-xl border border-gray-200 hover:opacity-90 transition-opacity"/>
                    : <div className="w-full h-32 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 text-sm hover:bg-gray-200 transition-colors"><FiFileText size={24} className="mr-2"/>View PDF</div>
                  }
                </a>
              )}
              {/* Notes */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Notes (optional)</label>
                <textarea className="input" rows={2} placeholder="Add a note for the patient..." value={notes} onChange={e => setNotes(e.target.value)}/>
              </div>
              {/* Actions */}
              {selected.status === 'PENDING' ? (
                <div className="flex gap-3">
                  <button disabled={acting} onClick={() => handleVerify(selected.id, 'APPROVED')}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all">
                    <FiCheck size={16}/>{acting ? '...' : 'Approve'}
                  </button>
                  <button disabled={acting} onClick={() => handleVerify(selected.id, 'REJECTED')}
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all">
                    <FiX size={16}/>{acting ? '...' : 'Reject'}
                  </button>
                </div>
              ) : (
                <div className={`rounded-xl p-3 text-center font-semibold text-sm ${STATUS_UI[selected.status].color}`}>
                  This prescription has been {selected.status.toLowerCase()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

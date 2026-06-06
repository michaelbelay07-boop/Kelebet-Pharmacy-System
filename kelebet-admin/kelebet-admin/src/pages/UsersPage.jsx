import { useState, useEffect } from 'react'
import { userAPI } from '../api/client'
import { toast } from 'react-hot-toast'
import { FiSearch, FiToggleLeft, FiToggleRight, FiShield } from 'react-icons/fi'

const ROLE_COLORS = { CUSTOMER:'bg-blue-100 text-blue-700', PHARMACIST:'bg-purple-100 text-purple-700', ADMIN:'bg-red-100 text-red-700' }

export default function UsersPage() {
  const [users,      setUsers]      = useState([])
  const [pagination, setPagination] = useState({})
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [page,       setPage]       = useState(1)

  const fetchUsers = () => {
    setLoading(true)
    userAPI.getAll({ search, role: roleFilter||undefined, page, limit:15 })
      .then(r => { setUsers(r.users||[]); setPagination(r.pagination||{}) })
      .finally(() => setLoading(false))
  }

  useEffect(fetchUsers, [search, roleFilter, page])

  const handleToggle = async (id, name, isActive) => {
    if (!confirm(`${isActive ? 'Deactivate' : 'Activate'} "${name}"?`)) return
    try {
      await userAPI.toggleActive(id)
      toast.success(`User ${isActive ? 'deactivated' : 'activated'}!`)
      fetchUsers()
    } catch (e) { toast.error(e.message) }
  }

  const handleRole = async (id, role) => {
    try {
      await userAPI.updateRole(id, { role })
      toast.success('Role updated!')
      fetchUsers()
    } catch (e) { toast.error(e.message) }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15}/>
          <input className="input pl-9" placeholder="Search users..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}/>
        </div>
        <select className="input sm:w-40" value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1) }}>
          <option value="">All Roles</option>
          <option value="CUSTOMER">Customer</option>
          <option value="PHARMACIST">Pharmacist</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="th">User</th>
                <th className="th">Phone</th>
                <th className="th">Role</th>
                <th className="th">Status</th>
                <th className="th">Joined</th>
                <th className="th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(8)].map((_,i) => (
                <tr key={i} className="border-b border-gray-50">
                  {[...Array(6)].map((_,j) => <td key={j} className="td"><div className="skeleton h-4 rounded w-24"/></td>)}
                </tr>
              )) : users.map(u => (
                <tr key={u.id} className="table-row">
                  <td className="td">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-primary-700 font-bold text-xs">{u.name[0].toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="td text-xs text-gray-500">{u.phone || '—'}</td>
                  <td className="td">
                    <select value={u.role} onChange={e => handleRole(u.id, e.target.value)}
                      className={`text-xs font-semibold px-2 py-1 rounded-lg border-0 cursor-pointer ${ROLE_COLORS[u.role]}`}>
                      <option value="CUSTOMER">CUSTOMER</option>
                      <option value="PHARMACIST">PHARMACIST</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td className="td">
                    <span className={`badge ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="td text-xs text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="td">
                    <button onClick={() => handleToggle(u.id, u.name, u.isActive)}
                      className={`p-2 rounded-xl transition-all ${u.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                      title={u.isActive ? 'Deactivate' : 'Activate'}>
                      {u.isActive ? <FiToggleRight size={20}/> : <FiToggleLeft size={20}/>}
                    </button>
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
    </div>
  )
}

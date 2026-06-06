import { useState, useEffect } from 'react'
import { productAPI, categoryAPI } from '../api/client'
import { toast } from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiAlertCircle, FiX } from 'react-icons/fi'

const EMPTY = { name:'', genericName:'', description:'', categoryId:'', price:'', salePrice:'', stock:'', unit:'tablet', dosage:'', manufacturer:'', requiresPrescription:false, imageUrl:'' }

export default function ProductsPage() {
  const [products,   setProducts]   = useState([])
  const [categories, setCategories] = useState([])
  const [pagination, setPagination] = useState({})
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [page,       setPage]       = useState(1)
  const [modal,      setModal]      = useState(false)
  const [editing,    setEditing]    = useState(null)
  const [form,       setForm]       = useState(EMPTY)
  const [saving,     setSaving]     = useState(false)

  const fetchProducts = () => {
    setLoading(true)
    productAPI.getAll({ search, page, limit:12 })
      .then(r => { setProducts(r.products||[]); setPagination(r.pagination||{}) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { categoryAPI.getAll().then(r => setCategories(r.categories||[])) }, [])
  useEffect(() => { fetchProducts() }, [search, page])

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit   = (p)  => { setEditing(p); setForm({ ...p, price: p.price, salePrice: p.salePrice||'', stock: p.stock, categoryId: p.categoryId }); setModal(true) }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const data = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock), salePrice: form.salePrice ? parseFloat(form.salePrice) : null }
      if (editing) await productAPI.update(editing.id, data)
      else         await productAPI.create(data)
      toast.success(editing ? 'Product updated!' : 'Product created!')
      setModal(false); fetchProducts()
    } catch (e) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Remove "${name}"?`)) return
    try { await productAPI.delete(id); toast.success('Removed!'); fetchProducts() }
    catch (e) { toast.error(e.message) }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-xs">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15}/>
          <input className="input pl-9" placeholder="Search medicines..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}/>
        </div>
        <button onClick={openCreate} className="btn-primary shrink-0"><FiPlus size={16}/>Add Medicine</button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="th">Medicine</th>
                <th className="th">Category</th>
                <th className="th">Price</th>
                <th className="th">Stock</th>
                <th className="th">Type</th>
                <th className="th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(6)].map((_,i) => (
                <tr key={i} className="border-b border-gray-50">
                  {[...Array(6)].map((_,j) => <td key={j} className="td"><div className="skeleton h-4 rounded w-20"/></td>)}
                </tr>
              )) : products.map(p => (
                <tr key={p.id} className="table-row">
                  <td className="td">
                    <div>
                      <p className="font-semibold text-gray-800">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.genericName} · {p.dosage}</p>
                    </div>
                  </td>
                  <td className="td text-gray-500">{p.category?.name || '—'}</td>
                  <td className="td">
                    <p className="font-semibold text-primary-700">{p.price} ETB</p>
                    {p.salePrice && <p className="text-xs text-gray-400 line-through">{p.salePrice}</p>}
                  </td>
                  <td className="td">
                    <span className={`font-bold ${p.stock === 0 ? 'text-red-600' : p.stock <= 20 ? 'text-orange-600' : 'text-gray-800'}`}>{p.stock}</span>
                  </td>
                  <td className="td">
                    {p.requiresPrescription
                      ? <span className="badge bg-orange-100 text-orange-700"><FiAlertCircle size={10}/>Rx</span>
                      : <span className="badge bg-green-100 text-green-700">OTC</span>}
                  </td>
                  <td className="td">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(p)} className="btn-ghost p-2 text-blue-500"><FiEdit2 size={14}/></button>
                      <button onClick={() => handleDelete(p.id, p.name)} className="btn-ghost p-2 text-red-500"><FiTrash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-gray-100">
            {[...Array(pagination.pages)].map((_,i) => (
              <button key={i} onClick={() => setPage(i+1)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${page===i+1 ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {i+1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="font-bold text-gray-900">{editing ? 'Edit Medicine' : 'Add New Medicine'}</h2>
              <button onClick={() => setModal(false)} className="p-2 hover:bg-gray-100 rounded-xl"><FiX size={18}/></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { label:'Medicine Name *', key:'name', required:true, placeholder:'e.g. Amoxicillin 500mg' },
                  { label:'Generic Name',    key:'genericName', placeholder:'e.g. Amoxicillin' },
                  { label:'Dosage',          key:'dosage', placeholder:'e.g. 500mg' },
                  { label:'Manufacturer',    key:'manufacturer', placeholder:'e.g. Ethiopian Pharma' },
                  { label:'Price (ETB) *',   key:'price', type:'number', required:true, placeholder:'0.00' },
                  { label:'Sale Price (ETB)',key:'salePrice', type:'number', placeholder:'Optional' },
                  { label:'Stock *',         key:'stock', type:'number', required:true, placeholder:'0' },
                  { label:'Image URL',       key:'imageUrl', placeholder:'https://...' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">{f.label}</label>
                    <input type={f.type||'text'} required={f.required} className="input" placeholder={f.placeholder}
                      value={form[f.key]} onChange={e => setForm(v => ({...v, [f.key]: e.target.value}))}/>
                  </div>
                ))}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Category *</label>
                  <select required className="input" value={form.categoryId} onChange={e => setForm(v => ({...v, categoryId: e.target.value}))}>
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Unit</label>
                  <select className="input" value={form.unit} onChange={e => setForm(v => ({...v, unit: e.target.value}))}>
                    {['tablet','capsule','syrup','injection','cream','drops','inhaler','patch'].map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
                <textarea className="input" rows={2} placeholder="Medicine description..." value={form.description} onChange={e => setForm(v => ({...v, description: e.target.value}))}/>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className={`w-10 h-6 rounded-full transition-colors ${form.requiresPrescription ? 'bg-primary-600' : 'bg-gray-200'}`}
                  onClick={() => setForm(v => ({...v, requiresPrescription: !v.requiresPrescription}))}>
                  <div className={`w-4 h-4 bg-white rounded-full mt-1 transition-transform shadow-sm ${form.requiresPrescription ? 'ml-5' : 'ml-1'}`}/>
                </div>
                <span className="text-sm font-medium text-gray-700">Requires Prescription (Rx)</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">{saving ? 'Saving...' : editing ? 'Update Medicine' : 'Add Medicine'}</button>
                <button type="button" onClick={() => setModal(false)} className="btn-ghost">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

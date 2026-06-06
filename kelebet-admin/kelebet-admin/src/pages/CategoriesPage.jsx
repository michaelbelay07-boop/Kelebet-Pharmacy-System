import { useState, useEffect } from 'react'
import { categoryAPI } from '../api/client'
import { toast } from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiTag, FiX } from 'react-icons/fi'

export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [modal,      setModal]      = useState(false)
  const [editing,    setEditing]    = useState(null)
  const [form,       setForm]       = useState({ name:'', description:'' })
  const [saving,     setSaving]     = useState(false)

  const fetch = () => {
    setLoading(true)
    categoryAPI.getAll().then(r => setCategories(r.categories||[])).finally(() => setLoading(false))
  }
  useEffect(fetch, [])

  const openCreate = () => { setEditing(null); setForm({ name:'', description:'' }); setModal(true) }
  const openEdit   = (c)  => { setEditing(c);  setForm({ name: c.name, description: c.description||'' }); setModal(true) }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) await categoryAPI.update(editing.id, form)
      else         await categoryAPI.create(form)
      toast.success(editing ? 'Category updated!' : 'Category created!')
      setModal(false); fetch()
    } catch (e) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Remove category "${name}"?`)) return
    try { await categoryAPI.delete(id); toast.success('Removed!'); fetch() }
    catch (e) { toast.error(e.message) }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={openCreate} className="btn-primary"><FiPlus size={16}/>Add Category</button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_,i) => <div key={i} className="skeleton h-28 rounded-2xl"/>)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map(c => (
            <div key={c.id} className="card p-5 flex flex-col gap-3">
              <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                <FiTag className="text-primary-600" size={18}/>
              </div>
              <div>
                <p className="font-bold text-gray-800">{c.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{c._count?.products || 0} medicines</p>
                {c.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{c.description}</p>}
              </div>
              <div className="flex gap-1 mt-auto">
                <button onClick={() => openEdit(c)} className="btn-ghost p-2 text-blue-500 flex-1 justify-center"><FiEdit2 size={14}/></button>
                <button onClick={() => handleDelete(c.id, c.name)} className="btn-ghost p-2 text-red-500 flex-1 justify-center"><FiTrash2 size={14}/></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">{editing ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setModal(false)} className="p-2 hover:bg-gray-100 rounded-xl"><FiX size={18}/></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Name *</label>
                <input required className="input" placeholder="e.g. Antibiotics" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}/>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
                <textarea className="input" rows={2} placeholder="Short description..." value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}/>
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
                <button type="button" onClick={() => setModal(false)} className="btn-ghost">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

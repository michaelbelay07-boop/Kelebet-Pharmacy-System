import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-hot-toast'
import { FiEye, FiEyeOff, FiLock } from 'react-icons/fi'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email:'', password:'' })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      navigate('/')
    } catch (e) { toast.error(e.message || 'Login failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">K</span>
          </div>
          <h1 className="text-white font-bold text-2xl">Kelebet Admin</h1>
          <p className="text-gray-400 text-sm mt-1">Sign in to manage your pharmacy</p>
        </div>

        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1.5 block">Email</label>
              <input type="email" required className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl px-4 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="admin@kelebet.com" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}/>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1.5 block">Password</label>
              <div className="relative">
                <input type={show ? 'text' : 'password'} required className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl px-4 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-10"
                  placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))}/>
                <button type="button" onClick={() => setShow(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200">
                  {show ? <FiEyeOff size={16}/> : <FiEye size={16}/>}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-500 text-white font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 mt-2">
              <FiLock size={15}/> {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="text-gray-500 text-xs text-center mt-4">Admin and Pharmacist access only</p>
        </div>
      </div>
    </div>
  )
}

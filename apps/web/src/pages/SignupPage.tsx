import React, { useState } from 'react'
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react'
import { apiClient } from '../services/apiClient'
import { useAuthStore } from '../store/authStore'
import { UserRole } from '../types'
import { Logo } from '../components/Logo'

interface SignupPageProps {
  onSignupSuccess: () => void
  onSwitchToLogin: () => void
  onBack: () => void
}

export const SignupPage: React.FC<SignupPageProps> = ({ onSignupSuccess, onSwitchToLogin, onBack }) => {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('patient')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuthStore()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await apiClient.post('/api/v1/auth/register', { email, password, full_name: fullName, role })
      const res = await apiClient.post('/api/v1/auth/login', { email, password })
      const { access_token, role: returnedRole, username } = res.data
      login(access_token, email, returnedRole as UserRole, username)
      onSignupSuccess()
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Registration failed. This email may already be registered.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Racing stripe top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF8000] via-[#FFD700] to-[#FF8000]" />

      {/* Background glow */}
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-[#FF8000]/6 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-[#FFD700]/4 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Logo iconSize={28} />
          </div>
          <p className="text-xs text-slate-500 font-semibold tracking-wider uppercase">
            Create your compliance account
          </p>
        </div>

        {/* Signup Card */}
        <div className="bg-[#1a1a1a] border border-white/8 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="border-l-4 border-[#FF8000] pl-4">
            <h2 className="text-xl font-extrabold text-white">Join Project McCaren</h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">AI-powered claims processing for healthcare providers</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                placeholder="Dr. Ramesh Kumar"
                className="h-12 px-4 rounded-xl border border-white/10 bg-white/5 text-sm focus:outline-none focus:border-[#FF8000]/60 text-white placeholder:text-slate-600 transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@hospital.com"
                className="h-12 px-4 rounded-xl border border-white/10 bg-white/5 text-sm focus:outline-none focus:border-[#FF8000]/60 text-white placeholder:text-slate-600 transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Min. 6 characters"
                  className="w-full h-12 px-4 pr-12 rounded-xl border border-white/10 bg-white/5 text-sm focus:outline-none focus:border-[#FF8000]/60 text-white placeholder:text-slate-600 transition-all"
                />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#FF8000] transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Account Role</label>
              <div className="grid grid-cols-3 gap-2">
                {(['patient', 'provider', 'auditor'] as UserRole[]).map(r => (
                  <button key={r} type="button" onClick={() => setRole(r)}
                    className={`py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                      role === r
                        ? 'bg-[#FF8000] text-white border-[#FF8000] shadow-lg shadow-[#FF8000]/25'
                        : 'border-white/10 text-slate-500 hover:border-[#FF8000]/40 hover:text-[#FF8000]'
                    }`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full h-12 bg-[#FF8000] hover:bg-[#e67300] text-white font-bold rounded-xl shadow-lg shadow-[#FF8000]/25 flex items-center justify-center gap-2 transition-all disabled:opacity-60">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <><span>Create Account</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <div className="text-center text-xs text-slate-500">
            Already have an account?{' '}
            <button onClick={onSwitchToLogin} className="text-[#FF8000] font-bold hover:underline">Sign In</button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <button onClick={onBack} className="text-xs text-slate-600 hover:text-slate-300 font-medium transition-all">
            Back to Home
          </button>
          <div className="text-[10px] text-slate-700 text-center">
            &copy; {new Date().getFullYear()} Project McCaren &mdash; Developed by Shounak Shelke
          </div>
        </div>
      </div>
    </div>
  )
}

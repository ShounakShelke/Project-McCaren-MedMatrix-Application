import React, { useState } from 'react'
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react'
import { apiClient } from '../services/apiClient'
import { useAuthStore } from '../store/authStore'
import { UserRole } from '../types'
import { Logo } from '../components/Logo'

interface LoginPageProps {
  onLoginSuccess: () => void
  onSwitchToSignup: () => void
  onBack: () => void
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onSwitchToSignup, onBack }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuthStore()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await apiClient.post('/api/v1/auth/login', { email, password })
      const { access_token, role, username } = res.data
      login(access_token, email, role as UserRole, username)
      onLoginSuccess()
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail)
    setPassword(demoPass)
    setError('')
    setLoading(true)
    try {
      const res = await apiClient.post('/api/v1/auth/login', { email: demoEmail, password: demoPass })
      const { access_token, role, username } = res.data
      login(access_token, demoEmail, role as UserRole, username)
      onLoginSuccess()
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const demoAccounts = [
    { email: 'admin@project-mccaren.com', password: 'admin123', role: 'Admin' },
    { email: 'provider@project-mccaren.com', password: 'provider123', role: 'Provider' },
    { email: 'patient@project-mccaren.com', password: 'patient123', role: 'Patient' },
  ]

  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Racing stripe top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF8000] via-[#FFD700] to-[#FF8000]" />
      
      {/* Background glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FF8000]/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#FFD700]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Logo iconSize={28} />
          </div>
          <p className="text-xs text-slate-500 font-semibold tracking-wider uppercase">
            AI-Powered Healthcare Claims Platform
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#1a1a1a] border border-white/8 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="border-l-4 border-[#FF8000] pl-4">
            <h2 className="text-xl font-extrabold text-white">Sign in to your account</h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">Enter your credentials to access the compliance dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@hospital.com"
                className="h-12 px-4 rounded-xl border border-white/10 bg-white/5 text-sm focus:outline-none focus:border-[#FF8000]/60 focus:bg-white/8 text-white placeholder:text-slate-600 transition-all"
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
                  placeholder="••••••••"
                  className="w-full h-12 px-4 pr-12 rounded-xl border border-white/10 bg-white/5 text-sm focus:outline-none focus:border-[#FF8000]/60 text-white placeholder:text-slate-600 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#FF8000] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#FF8000] hover:bg-[#e67300] text-white font-bold rounded-xl shadow-lg shadow-[#FF8000]/25 flex items-center justify-center gap-2 transition-all disabled:opacity-60 papaya-glow-sm"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <><span>Sign In</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <div className="text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <button onClick={onSwitchToSignup} className="text-[#FF8000] font-bold hover:underline">
              Create Account
            </button>
          </div>
        </div>

        {/* Demo Accounts */}
        <div className="bg-[#1a1a1a] border border-white/8 rounded-2xl p-5 space-y-3">
          <div className="racing-stripe mb-4" />
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Quick Demo Access</p>
          <div className="grid grid-cols-3 gap-2">
            {demoAccounts.map(acc => (
              <button
                key={acc.role}
                onClick={() => handleDemoLogin(acc.email, acc.password)}
                className="flex flex-col items-center gap-1 p-3 rounded-xl border border-white/8 hover:border-[#FF8000]/40 hover:bg-[#FF8000]/5 transition-all"
              >
                <span className="text-[10px] font-extrabold text-[#FF8000] uppercase">{acc.role}</span>
                <span className="text-[9px] text-slate-600 font-medium">Click to fill</span>
              </button>
            ))}
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

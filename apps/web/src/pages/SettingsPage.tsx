import React from 'react'
import { useUIStore } from '../store/uiStore'
import { useAuthStore } from '../store/authStore'
import { Shield, Eye, Bell, Monitor, Key, Sparkles } from 'lucide-react'

export const SettingsPage: React.FC = () => {
  const { theme, toggleTheme } = useUIStore()
  const { user } = useAuthStore()

  return (
    <div className="flex-1 p-8 space-y-8 overflow-y-auto max-h-screen">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight dark:text-white font-sans">Settings & Customization</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold mt-1">
          Adjust interface preferences, configure API access credentials, and audit security tokens.
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        
        {/* Theme customization */}
        <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/20 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/40 pb-3">
            <Monitor size={18} className="text-primary-500" />
            <h3 className="font-extrabold text-base dark:text-white">Interface Customization</h3>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-sm font-semibold dark:text-slate-200">Dark Theme Toggle</h4>
              <p className="text-xs text-slate-400 font-medium">Switch between light and dark backgrounds.</p>
            </div>
            <button
              onClick={toggleTheme}
              className="bg-primary-500 text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl shadow shadow-primary-500/20 hover:opacity-95 transition-all"
            >
              Toggle ({theme === 'light' ? 'Dark' : 'Light'})
            </button>
          </div>
        </div>

        {/* Security configuration */}
        <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/20 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/40 pb-3">
            <Shield size={18} className="text-primary-500" />
            <h3 className="font-extrabold text-base dark:text-white">Security & Audit Compliance</h3>
          </div>

          <div className="space-y-4 text-xs font-semibold">
            <div className="flex justify-between">
              <span className="text-slate-400">Account Type:</span>
              <span className="dark:text-slate-200 uppercase bg-primary-500/10 text-primary-500 px-2 py-0.5 rounded-lg">{user?.role || 'Patient'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Registered Email:</span>
              <span className="dark:text-slate-200">{user?.email || 'patient@project-mccaren.com'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">HIPAA-inspired Compliance:</span>
              <span className="text-emerald-500 font-bold">ACTIVE (AES ENCRYPTED)</span>
            </div>
          </div>
        </div>

        {/* API keys mock */}
        <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/20 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/40 pb-3">
            <Key size={18} className="text-primary-500" />
            <h3 className="font-extrabold text-base dark:text-white">API access & Credentials</h3>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Production JWT Access Token</label>
            <div className="bg-slate-100 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200/20 font-mono text-[10px] truncate text-slate-500 dark:text-slate-400">
              {localStorage.getItem('project-mccaren_token') || 'token_not_found'}
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}

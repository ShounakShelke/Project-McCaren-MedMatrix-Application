import React from 'react'
import { useAuthStore } from '../store/authStore'
import { useUIStore } from '../store/uiStore'
import { 
  LayoutDashboard, 
  Camera, 
  ShieldAlert, 
  MapPin, 
  Settings, 
  LogOut, 
  Sun, 
  Moon,
  Bot,
  User,
  ShieldCheck
} from 'lucide-react'

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab }) => {
  const { user, logout } = useAuthStore()
  const { theme, toggleTheme } = useUIStore()

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'scan', label: 'New Claim Scan', icon: Camera },
    { id: 'fraud', label: 'Fraud Verification', icon: ShieldAlert },
    { id: 'hospitals', label: 'Hospital Finder', icon: MapPin },
    { id: 'chat', label: 'AI Copilot', icon: Bot },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  // Add admin panel if role permits
  const showAdmin = user?.role === 'admin' || user?.role === 'auditor';

  return (
    <aside className="w-64 h-screen glass border-r border-slate-200/50 dark:border-slate-800/30 flex flex-col justify-between p-6 fixed left-0 top-0 z-40 transition-all duration-300">
      <div className="flex flex-col gap-8">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="size-10 rounded-xl bg-gradient-to-tr from-primary-500 to-accent-500 flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
            <span className="material-symbols-outlined text-2xl font-bold">account_balance_wallet</span>
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight text-slate-800 dark:text-white font-sans">
              CLAIM<span className="text-primary-500">MAX</span>
            </h1>
            <span className="text-[10px] text-accent-600 dark:text-accent-500 font-bold uppercase tracking-wider">AI Healthcare</span>
          </div>
        </div>

        {/* User Card */}
        <div className="flex items-center gap-3 bg-slate-100/50 dark:bg-slate-800/30 p-3 rounded-2xl border border-slate-200/20">
          <div className="size-10 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
            <User size={20} />
          </div>
          <div className="overflow-hidden">
            <h4 className="font-semibold text-sm truncate text-slate-800 dark:text-slate-200">
              {user?.username || 'Guest User'}
            </h4>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[10px] bg-primary-500/10 text-primary-500 dark:text-primary-100 font-bold uppercase px-1.5 py-0.5 rounded">
                {user?.role || 'Patient'}
              </span>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25 dark:shadow-none' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            )
          })}

          {showAdmin && (
            <button
              onClick={() => setCurrentTab('admin')}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold mt-4 border border-dashed ${
                currentTab === 'admin'
                  ? 'bg-emerald-600 text-white border-transparent'
                  : 'text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-500/5'
              }`}
            >
              <ShieldCheck size={18} />
              <span>Admin Audits</span>
            </button>
          )}
        </nav>
      </div>

      {/* Footer Controls */}
      <div className="flex flex-col gap-3">
        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40"
        >
          <div className="flex items-center gap-3.5">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          </div>
          <div className="w-8 h-4 rounded-full bg-slate-200 dark:bg-slate-700 relative flex items-center px-0.5">
            <div className={`size-3 rounded-full bg-white shadow transition-all duration-300 ${theme === 'dark' ? 'translate-x-4 bg-primary-500' : 'translate-x-0'}`} />
          </div>
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/5 transition-all duration-200"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}

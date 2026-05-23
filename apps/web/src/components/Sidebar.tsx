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
import { Logo } from './Logo'

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

  const showAdmin = user?.role === 'admin' || user?.role === 'auditor';

  return (
    <aside className="w-64 h-screen flex flex-col justify-between fixed left-0 top-0 z-40 transition-all duration-300 bg-[#111111] dark:bg-[#0a0a0a] border-r border-white/5">
      
      {/* Papaya stripe at top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF8000] via-[#FFD700] to-[#FF8000]" />
      
      <div className="flex flex-col gap-8 p-6 pt-7">
        {/* Brand Logo */}
        <Logo iconSize={22} />

        {/* User Card */}
        <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10">
          <div className="size-10 rounded-full bg-[#FF8000]/20 border border-[#FF8000]/30 flex items-center justify-center text-[#FF8000]">
            <User size={18} />
          </div>
          <div className="overflow-hidden">
            <h4 className="font-semibold text-sm truncate text-white">
              {user?.username || 'Guest User'}
            </h4>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[10px] bg-[#FF8000]/15 text-[#FF8000] font-bold uppercase px-1.5 py-0.5 rounded">
                {user?.role || 'Patient'}
              </span>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive 
                    ? 'bg-[#FF8000] text-white shadow-lg shadow-[#FF8000]/30' 
                    : 'text-slate-400 hover:bg-white/8 hover:text-white'
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />
                )}
              </button>
            )
          })}

          {showAdmin && (
            <button
              onClick={() => setCurrentTab('admin')}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold mt-4 border border-dashed ${
                currentTab === 'admin'
                  ? 'bg-[#FF8000] text-white border-transparent'
                  : 'text-[#FF8000] border-[#FF8000]/30 hover:bg-[#FF8000]/10'
              }`}
            >
              <ShieldCheck size={18} />
              <span>Admin Audits</span>
            </button>
          )}
        </nav>
      </div>

      {/* Footer Controls */}
      <div className="flex flex-col gap-2 p-6 border-t border-white/8">
        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:bg-white/8 hover:text-white transition-all"
        >
          <div className="flex items-center gap-3.5">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          </div>
          <div className="w-8 h-4 rounded-full bg-white/10 relative flex items-center px-0.5">
            <div className={`size-3 rounded-full shadow transition-all duration-300 ${theme === 'dark' ? 'translate-x-4 bg-[#FF8000]' : 'translate-x-0 bg-white'}`} />
          </div>
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>

        {/* Attribution */}
        <div className="text-[9px] text-slate-600 text-center pt-2 leading-relaxed">
          Made with ❤️ by Shounak Shelke
        </div>
      </div>
    </aside>
  )
}

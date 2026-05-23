import React, { useEffect, useState, Suspense } from 'react'
import { useAuthStore } from './store/authStore'
import { useUIStore } from './store/uiStore'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Sidebar } from './components/Sidebar'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { Dashboard } from './pages/Dashboard'
import { OcrUpload } from './pages/OcrUpload'
import { FraudDetails } from './pages/FraudDetails'
import { HospitalFinder } from './pages/HospitalFinder'
import { SettingsPage } from './pages/SettingsPage'
import { AdminDashboard } from './pages/AdminDashboard'
import { ChatBotPanel } from './components/ChatBotPanel'
import { Logo } from './components/Logo'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    }
  }
})

type AppRoute = 'landing' | 'login' | 'signup' | 'app'
type AppTab = 'dashboard' | 'scan' | 'fraud' | 'hospitals' | 'chat' | 'settings' | 'admin'

function App() {
  const { isAuthenticated, initialize } = useAuthStore()
  const { initializeTheme } = useUIStore()
  const [route, setRoute] = useState<AppRoute>('landing')
  const [currentTab, setCurrentTab] = useState<AppTab>('dashboard')

  // Initialize auth and theme from localStorage on mount
  useEffect(() => {
    initialize()
    initializeTheme()
  }, [])

  // Synchronize state from hash on mount and hashchange
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#/'
      
      if (hash === '#/' || hash === '#/landing') {
        if (isAuthenticated) {
          window.location.hash = '#/app/dashboard'
        } else {
          setRoute('landing')
        }
      } else if (hash === '#/login') {
        if (isAuthenticated) {
          window.location.hash = '#/app/dashboard'
        } else {
          setRoute('login')
        }
      } else if (hash === '#/signup') {
        if (isAuthenticated) {
          window.location.hash = '#/app/dashboard'
        } else {
          setRoute('signup')
        }
      } else if (hash.startsWith('#/app/')) {
        if (!isAuthenticated) {
          window.location.hash = '#/login'
        } else {
          setRoute('app')
          const tab = hash.substring(6) as AppTab
          if (['dashboard', 'scan', 'fraud', 'hospitals', 'chat', 'settings', 'admin'].includes(tab)) {
            setCurrentTab(tab)
          } else {
            setCurrentTab('dashboard')
          }
        }
      } else {
        window.location.hash = isAuthenticated ? '#/app/dashboard' : '#/'
      }
    }

    handleHashChange()

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [isAuthenticated])

  // Redirect based on auth state changes
  useEffect(() => {
    const hash = window.location.hash || '#/'
    if (isAuthenticated) {
      if (hash === '#/' || hash === '#/landing' || hash === '#/login' || hash === '#/signup') {
        window.location.hash = '#/app/dashboard'
      }
    } else {
      if (hash.startsWith('#/app/')) {
        window.location.hash = '#/'
      }
    }
  }, [isAuthenticated])

  if (route === 'landing') {
    return (
      <QueryClientProvider client={queryClient}>
        <LandingPage
          onSwitchToLogin={() => window.location.hash = '#/login'}
          onSwitchToSignup={() => window.location.hash = '#/signup'}
        />
      </QueryClientProvider>
    )
  }

  if (route === 'login') {
    return (
      <QueryClientProvider client={queryClient}>
        <LoginPage
          onLoginSuccess={() => window.location.hash = '#/app/dashboard'}
          onSwitchToSignup={() => window.location.hash = '#/signup'}
          onBack={() => window.location.hash = '#/'}
        />
      </QueryClientProvider>
    )
  }

  if (route === 'signup') {
    return (
      <QueryClientProvider client={queryClient}>
        <SignupPage
          onSignupSuccess={() => window.location.hash = '#/app/dashboard'}
          onSwitchToLogin={() => window.location.hash = '#/login'}
          onBack={() => window.location.hash = '#/'}
        />
      </QueryClientProvider>
    )
  }

  // Main authenticated dashboard app
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen bg-slate-50 dark:bg-dark-bg transition-colors duration-300">
        <Sidebar currentTab={currentTab} setCurrentTab={(tab) => { window.location.hash = `#/app/${tab}` }} />
        {/* Main content offset by sidebar width */}
        <main className="ml-64 flex-1 flex flex-col min-h-screen overflow-hidden">
          {/* Topbar */}
          <header className="h-16 flex items-center justify-between px-8 bg-[#1a1a1a] border-b border-white/6 sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <Logo iconSize={24} />
            </div>
            <div className="text-[10px] font-bold text-slate-600 tracking-widest uppercase flex items-center gap-2">
              Made with ❤️ by Shounak Shelke
            </div>
          </header>
          <div className="absolute top-14 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FF8000] via-[#FFD700] to-[#FF8000]" />
          
          <div className="flex-1 overflow-y-auto pb-10">
          {currentTab === 'dashboard' && <Dashboard />}
          {currentTab === 'scan' && <OcrUpload />}
          {currentTab === 'fraud' && <FraudDetails />}
          {currentTab === 'hospitals' && <HospitalFinder />}
          {currentTab === 'chat' && (
            <div className="p-8 max-w-3xl mx-auto">
              <h1 className="text-3xl font-extrabold tracking-tight dark:text-white mb-2">AI Copilot</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold mb-6">
                Chat with our healthcare RAG assistant for real-time PM-JAY and ESIC policy guidance.
              </p>
              <ChatBotPanel />
            </div>
          )}
          {currentTab === 'settings' && <SettingsPage />}
          {currentTab === 'admin' && <AdminDashboard />}
          </div>

          {/* Footer */}
          <footer className="h-16 flex items-center justify-between px-8 border-t border-white/6 bg-[#1a1a1a] mt-auto">
            <Logo iconSize={18} />
            <p className="text-[10px] font-medium text-slate-700">
              &copy; {new Date().getFullYear()} Project McCaren &mdash; Developed by Shounak Shelke. All rights reserved.
            </p>
          </footer>
        </main>
      </div>
    </QueryClientProvider>
  )
}

export default App

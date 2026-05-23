import React from 'react'
import { Sparkles, ArrowRight, ShieldCheck, HeartPulse, Receipt, Zap, Bot, Search } from 'lucide-react'
import { Logo } from '../components/Logo'

interface LandingPageProps {
  onSwitchToLogin: () => void;
  onSwitchToSignup: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSwitchToLogin, onSwitchToSignup }) => {
  const features = [
    {
      icon: Receipt,
      title: 'Medical OCR Parsing',
      desc: 'Extract itemized hospital charges, admission schedules, and treatment procedures instantly with high-accuracy AI models.'
    },
    {
      icon: ShieldCheck,
      title: 'Document Fraud Shield',
      desc: 'Verify QR codes, detect photoshopped details, inspect holograms, and validate state code criteria in real time.'
    },
    {
      icon: HeartPulse,
      title: 'Smart Scheme Matchmaker',
      desc: 'Automatically evaluate patient details to recommend PM-JAY, ESIC, or local health programs.'
    },
    {
      icon: Bot,
      title: 'Multilingual RAG Chatbot',
      desc: 'Consult policy documents, explain complex hospital receipts, and translate claim criteria between English and Hindi.'
    },
    {
      icon: Search,
      title: 'Empanelled Hospital Finder',
      desc: 'Pinpoint nearby public and private hospitals with bed availability, ratings, and active insurance coverage filters.'
    },
    {
      icon: Zap,
      title: 'Treatment Cost Forecasting',
      desc: 'Predict claim approval probability, estimate processing intervals, and project out-of-pocket expenses.'
    }
  ]

  return (
    <div className="min-h-screen bg-[#111111] text-white selection:bg-[#FF8000] selection:text-black">
      {/* Racing stripe top */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF8000] via-[#FFD700] to-[#FF8000] z-50" />

      {/* Background glow orbs */}
      <div className="fixed top-1/4 left-1/6 w-[600px] h-[600px] bg-[#FF8000]/6 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/6 w-[400px] h-[400px] bg-[#FFD700]/4 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="fixed top-1 left-0 right-0 z-40 px-6 py-4 flex items-center justify-between bg-[#111111]/80 backdrop-blur-xl border-b border-white/6">
        <Logo iconSize={32} />

        <div className="hidden md:block text-xs font-semibold text-slate-600 italic">
          Made with ❤️ by Shounak Shelke
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onSwitchToLogin}
            className="text-sm font-semibold text-slate-400 hover:text-white transition-all"
          >
            Sign In
          </button>
          <button
            onClick={onSwitchToSignup}
            className="bg-[#FF8000] hover:bg-[#e67300] text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-lg shadow-[#FF8000]/25 transition-all papaya-glow-sm"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-36 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
        <div className="inline-flex items-center gap-1.5 bg-[#FF8000]/10 text-[#FF8000] border border-[#FF8000]/25 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-8 animate-papaya-pulse">
          <Sparkles size={12} />
          <span>Next-Gen Healthcare Claims</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] max-w-5xl">
          Automate Healthcare Claims{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF8000] via-[#FFA040] to-[#FFD700]">
            with Agentic AI
          </span>
        </h1>

        <p className="mt-6 text-base md:text-lg text-slate-400 max-w-2xl font-medium leading-relaxed">
          A production-grade claims processing and fraud detection platform designed for Indian government schemes like PM-JAY and ESIC. Built for speed, accuracy, and compliance.
        </p>

        {/* Stats bar */}
        <div className="mt-10 flex flex-wrap gap-6 justify-center">
          {[
            { label: 'Claim Accuracy', value: '98.4%' },
            { label: 'Avg OCR Speed', value: '1.8s' },
            { label: 'Fraud Prevented', value: '₹2.1Cr' },
          ].map(stat => (
            <div key={stat.label} className="flex flex-col items-center gap-1 px-6 py-3 rounded-2xl bg-white/4 border border-white/8">
              <span className="text-2xl font-extrabold text-[#FF8000]">{stat.value}</span>
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{stat.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <button
            onClick={onSwitchToSignup}
            className="bg-[#FF8000] hover:bg-[#e67300] text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-[#FF8000]/30 flex items-center gap-2 transition-all text-sm uppercase tracking-wider papaya-glow"
          >
            <span>Launch Console</span>
            <ArrowRight size={16} />
          </button>
          <a
            href="#features"
            className="border border-white/10 text-slate-300 font-semibold px-8 py-4 rounded-2xl hover:border-[#FF8000]/40 hover:text-white transition-all text-sm"
          >
            Explore Features
          </a>
        </div>

        {/* Dashboard Visual Mock */}
        <div className="mt-16 w-full max-w-5xl rounded-3xl p-px bg-gradient-to-b from-[#FF8000]/40 to-white/5 shadow-2xl relative overflow-hidden">
          <div className="rounded-3xl bg-[#1a1a1a] overflow-hidden">
            {/* Header bar mock */}
            <div className="h-10 bg-[#111111] border-b border-white/6 px-4 flex items-center justify-between">
              <div className="flex gap-1.5">
                <div className="size-2.5 rounded-full bg-red-500" />
                <div className="size-2.5 rounded-full bg-[#FFD700]" />
                <div className="size-2.5 rounded-full bg-green-500" />
              </div>
              <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Project McCaren — COMPLIANCE PANEL</div>
              <div className="size-3" />
            </div>
            {/* Papaya racing stripe */}
            <div className="racing-stripe" />
            {/* Body mock */}
            <div className="p-6 flex flex-col gap-4 aspect-[2.2]">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Auto-Approve Rate', value: '92.4%', color: '#FF8000', change: '+2.1%' },
                  { label: 'Flagged Suspicious', value: '18 Cases', color: '#FFD700', change: 'Under audit' },
                  { label: 'Avg OCR Speed', value: '1.8 Sec', color: '#4ade80', change: 'Direct API' },
                ].map(stat => (
                  <div key={stat.label} className="mclaren-card p-4">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{stat.label}</div>
                    <div className="text-xl font-extrabold mt-1" style={{ color: stat.color }}>{stat.value}</div>
                    <div className="text-[10px] text-slate-600 font-bold mt-1">{stat.change}</div>
                  </div>
                ))}
              </div>
              <div className="flex-1 mclaren-card p-4 flex flex-col justify-center items-center gap-2">
                <HeartPulse className="size-7 text-[#FF8000] animate-papaya-pulse" />
                <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Ready for Simulation Scan</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="racing-stripe w-16 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Complete Multi-Agent AI Features
            </h2>
            <p className="mt-4 text-slate-400 font-medium max-w-xl mx-auto">
              Every module engineered for compliance, speed, and fraud detection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feat, idx) => {
              const Icon = feat.icon
              return (
                <div key={idx} className="mclaren-card p-6 group cursor-default">
                  <div className="size-11 rounded-2xl bg-[#FF8000]/10 text-[#FF8000] flex items-center justify-center mb-5 group-hover:bg-[#FF8000] group-hover:text-white transition-all duration-300">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-base font-bold text-white">{feat.title}</h3>
                  <p className="mt-3 text-sm text-slate-500 leading-relaxed font-medium">
                    {feat.desc}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 px-6 relative z-10">
        <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-r from-[#FF8000]/15 via-[#FF8000]/8 to-[#FFD700]/10 border border-[#FF8000]/20 p-10 text-center">
          <div className="racing-stripe w-24 mx-auto mb-6" />
          <h2 className="text-3xl font-extrabold tracking-tight">Ready to Modernize Claims Processing?</h2>
          <p className="mt-4 text-slate-400 font-medium">Join providers across India using Project McCaren to reduce fraud and speed up approvals.</p>
          <button
            onClick={onSwitchToSignup}
            className="mt-8 bg-[#FF8000] hover:bg-[#e67300] text-white font-bold px-10 py-4 rounded-2xl shadow-xl shadow-[#FF8000]/30 inline-flex items-center gap-2 transition-all text-sm uppercase tracking-wider papaya-glow"
          >
            <span>Get Started Free</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-white/6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600 font-medium">
          <Logo iconSize={24} />
          <div>&copy; {new Date().getFullYear()} Project McCaren. Developed by Shounak Shelke. All rights reserved.</div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-[#FF8000] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#FF8000] transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-[#FF8000] transition-colors">HIPAA Compliance</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

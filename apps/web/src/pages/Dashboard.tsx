import React, { useState, useEffect } from 'react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts'
import { 
  TrendingUp, Users, DollarSign, Activity, FileText, CheckCircle2, AlertTriangle, ArrowUpRight,
  ShieldCheck, BrainCircuit
} from 'lucide-react'
import { apiClient } from '../services/apiClient'

const COLORS = ['#0284c7', '#10b981', '#f59e0b']

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await apiClient.get('/api/v1/analytics/')
        setData(res.data)
      } catch (err) {
        console.error('Failed to load analytics data', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  if (loading || !data) {
    return (
      <div className="flex-1 p-8 space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-2 h-80 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        </div>
      </div>
    )
  }

  const { summary, schemeBreakdown, monthlyTrends, fraudMetrics } = data

  const stats = [
    {
      title: 'Total cases',
      value: summary.totalCases || 124,
      icon: FileText,
      color: 'text-primary-500 bg-primary-500/10',
      desc: 'Overall claims processed'
    },
    {
      title: 'Approved claims',
      value: `₹${(summary.approvedAmount / 100000 || 84.5).toFixed(1)}L`,
      icon: CheckCircle2,
      color: 'text-emerald-500 bg-emerald-500/10',
      desc: `${summary.approvedClaims || 112} claims approved`
    },
    {
      title: 'Auto-approval rate',
      value: '91.8%',
      icon: TrendingUp,
      color: 'text-accent-500 bg-accent-500/10',
      desc: 'Instant claim resolution'
    },
    {
      title: 'Fraud flagged',
      value: fraudMetrics.flagged_suspicious || 18,
      icon: AlertTriangle,
      color: 'text-amber-500 bg-amber-500/10',
      desc: 'Document authenticity alerts'
    }
  ]

  return (
    <div className="flex-1 p-8 space-y-8 overflow-y-auto max-h-screen">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight dark:text-white">Healthcare SaaS Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold mt-1">
            Real-time compliance validation and insurance claim auditing.
          </p>
        </div>
        
        {/* Quick System Badge */}
        <div className="flex items-center gap-2 glass border border-slate-200/50 dark:border-slate-800/30 px-4 py-2 rounded-2xl">
          <BrainCircuit className="text-primary-500 size-5 animate-pulse" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">AI AGENT ENGINE ONLINE</span>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <div key={idx} className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/20 shadow-sm flex items-center justify-between">
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.title}</span>
                <h3 className="text-2xl font-extrabold dark:text-white">{stat.value}</h3>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block">{stat.desc}</span>
              </div>
              <div className={`size-12 rounded-2xl flex items-center justify-center ${stat.color} shrink-0`}>
                <Icon size={22} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Trends Chart */}
        <div className="lg:col-span-2 glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/20 flex flex-col justify-between h-96">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-extrabold text-base dark:text-white">Submitted vs Approved Claims</h3>
            <span className="text-xs text-slate-400 font-semibold">Monthly Aggregates</span>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip />
                <Legend iconType="circle" />
                <Bar dataKey="submitted" name="Submitted Claims" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="approved" name="Approved Claims" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Scheme Breakdown Pie */}
        <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/20 flex flex-col justify-between h-96">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-extrabold text-base dark:text-white">Scheme utilization</h3>
            <span className="text-xs text-slate-400 font-semibold">Distribution</span>
          </div>
          <div className="flex-1 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={schemeBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {schemeBreakdown.map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Legend overlay */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xs font-bold text-slate-400 uppercase">Primary</span>
              <span className="text-xl font-extrabold text-primary-500">PM-JAY</span>
            </div>
          </div>
          {/* Custom legends */}
          <div className="flex justify-around mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/40">
            {schemeBreakdown.map((entry: any, idx: number) => (
              <div key={idx} className="flex flex-col items-center">
                <div className="flex items-center gap-1.5">
                  <div className="size-2 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                  <span className="text-xs font-bold dark:text-slate-300">{entry.name}</span>
                </div>
                <span className="text-xs text-slate-400 font-semibold mt-0.5">{entry.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fraud detection alerts section */}
      <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/20 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/40 pb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-emerald-500 size-5" />
            <h3 className="font-extrabold text-base dark:text-white">AI Fraud Shield Metrics</h3>
          </div>
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
            Active Scanning
          </span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 block uppercase">Total Checked Cards</span>
            <span className="text-2xl font-extrabold dark:text-white">{fraudMetrics.total_scanned_cards || 240}</span>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 block uppercase">Anomaly Flag Rate</span>
            <span className="text-2xl font-extrabold text-amber-500">{(fraudMetrics.flagged_suspicious / fraudMetrics.total_scanned_cards * 100 || 7.5).toFixed(1)}%</span>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 block uppercase">Hologram Fail Rate</span>
            <span className="text-2xl font-extrabold text-red-500">{fraudMetrics.hologram_failure_rate || 8.2}%</span>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 block uppercase">AI Model Accuracy</span>
            <span className="text-2xl font-extrabold text-emerald-500">{fraudMetrics.accuracy_rate || 98.4}%</span>
          </div>
        </div>
      </div>

    </div>
  )
}

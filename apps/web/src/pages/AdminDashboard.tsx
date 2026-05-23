import React, { useState, useEffect } from 'react'
import { 
  ShieldAlert, ShieldCheck, CheckCircle2, XCircle, Clock, FileText, Search, 
  ChevronRight, ArrowRight, UserCheck, RefreshCw, Eye
} from 'lucide-react'
import { apiClient } from '../services/apiClient'
import { Case, Claim } from '../types'

export const AdminDashboard: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([])
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchCases = async () => {
    setLoading(true)
    try {
      const res = await apiClient.get('/api/v1/cases/')
      setCases(res.data)
      // Auto-select first case if present
      if (res.data.length > 0 && !selectedCase) {
        setSelectedCase(res.data[0])
      }
    } catch (err) {
      console.error('Failed to load audit cases', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCases()
  }, [])

  const handleStatusUpdate = async (claimId: number, status: 'approved' | 'declined') => {
    try {
      await apiClient.patch(`/api/v1/cases/claims/${claimId}`, { status })
      
      // Update local state
      if (selectedCase) {
        const updatedClaims = selectedCase.claims.map(c => 
          c.id === claimId ? { ...c, status } : c
        )
        setSelectedCase({ ...selectedCase, claims: updatedClaims })
      }
      
      // Refresh case list
      fetchCases()
    } catch (err) {
      alert('Failed to update claim status. Access restricted to Admin/Auditors.')
    }
  }

  const filteredCases = cases.filter(c => 
    (c.patient_name?.toLowerCase().includes(search.toLowerCase()) || 
     c.session_id.includes(search))
  )

  return (
    <div className="flex-1 p-8 space-y-8 overflow-y-auto max-h-screen">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/40 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight dark:text-white font-sans">Admin Audit Workspace</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold mt-1">
            Review claimant cases, inspect OCR confidence indexes, and override benefit approvals.
          </p>
        </div>
        <button 
          onClick={fetchCases}
          className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition-all"
          title="Refresh dataset"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {loading && cases.length === 0 ? (
        <div className="flex justify-center py-20">
          <RefreshCw className="size-10 text-primary-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left panel: Case List Table */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search case audits by patient name..."
                className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:border-primary-500 dark:text-white text-xs font-semibold shadow-sm"
              />
            </div>

            <div className="glass rounded-3xl border border-slate-200/50 dark:border-slate-800/20 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800/40 bg-slate-100/30 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <th className="py-4 px-6">Patient Name</th>
                      <th className="py-4 px-6">Hospital</th>
                      <th className="py-4 px-6">Bill Amount</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {filteredCases.map((c) => {
                      const isSelected = selectedCase?.id === c.id
                      const pendingCount = c.claims.filter(cl => cl.status === 'pending').length
                      const hasDeclined = c.claims.some(cl => cl.status === 'declined')
                      
                      let statusBadge = (
                        <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-lg text-[10px]">
                          Approved
                        </span>
                      )
                      if (pendingCount > 0) {
                        statusBadge = (
                          <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-lg text-[10px]">
                            Pending ({pendingCount})
                          </span>
                        )
                      } else if (hasDeclined) {
                        statusBadge = (
                          <span className="bg-red-500/10 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-lg text-[10px]">
                            Declined
                          </span>
                        )
                      }

                      return (
                        <tr 
                          key={c.id} 
                          onClick={() => setSelectedCase(c)}
                          className={`hover:bg-slate-100/50 dark:hover:bg-slate-800/20 cursor-pointer transition-all ${
                            isSelected ? 'bg-slate-100/50 dark:bg-slate-800/30' : ''
                          }`}
                        >
                          <td className="py-4 px-6 font-bold dark:text-white">{c.patient_name || 'Raju Kumar'}</td>
                          <td className="py-4 px-6 truncate max-w-[120px]">{c.bill?.hospital_name || 'Unknown Hospital'}</td>
                          <td className="py-4 px-6 font-mono">₹{c.bill?.amount.toLocaleString() || '0'}</td>
                          <td className="py-4 px-6">{statusBadge}</td>
                          <td className="py-4 px-6">
                            <ChevronRight size={14} className="text-slate-400" />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right panel: Selected Case Audit Details */}
          <div className="space-y-6">
            {selectedCase ? (
              <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/30 space-y-6">
                <div className="border-b border-slate-100 dark:border-slate-800/40 pb-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Case Audits Details</span>
                  <h3 className="font-extrabold text-base dark:text-white mt-1">
                    {selectedCase.patient_name || 'Raju Kumar'}
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400 block mt-1">ID: {selectedCase.session_id}</span>
                </div>

                <div className="space-y-4 text-xs font-semibold">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Hospital:</span>
                    <span className="dark:text-slate-200">{selectedCase.bill?.hospital_name || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Treatment:</span>
                    <span className="dark:text-slate-200">{selectedCase.bill?.treatment || 'General'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Dates:</span>
                    <span className="dark:text-slate-200">
                      {selectedCase.bill?.admission_date || 'N/A'} - {selectedCase.bill?.discharge_date || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Claims overrides */}
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/40">
                  <h4 className="font-extrabold text-xs dark:text-white uppercase tracking-wider">Claims Decisions</h4>
                  {selectedCase.claims.map((claim) => (
                    <div key={claim.id} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/20 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-primary-500 uppercase tracking-wider">{claim.scheme}</span>
                        <div className="flex items-center gap-1.5">
                          {claim.status === 'approved' && <CheckCircle2 size={14} className="text-emerald-500" />}
                          {claim.status === 'declined' && <XCircle size={14} className="text-red-500" />}
                          {claim.status === 'pending' && <Clock size={14} className="text-amber-500 animate-pulse" />}
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${
                            claim.status === 'approved' ? 'text-emerald-500' : claim.status === 'declined' ? 'text-red-500' : 'text-amber-500'
                          }`}>
                            {claim.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <p className="text-slate-400 font-semibold max-w-[180px]">{claim.reason}</p>
                        <span className="font-extrabold text-sm dark:text-white">₹{claim.amount.toLocaleString()}</span>
                      </div>
                      
                      {/* Action buttons */}
                      {claim.status === 'pending' && (
                        <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/20">
                          <button
                            onClick={() => handleStatusUpdate(claim.id, 'approved')}
                            className="flex-1 bg-emerald-500 text-white font-bold text-[10px] uppercase py-2 rounded-lg hover:bg-emerald-600 shadow shadow-emerald-500/10 flex items-center justify-center gap-1 transition-all"
                          >
                            <ShieldCheck size={12} />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(claim.id, 'declined')}
                            className="flex-1 bg-red-500 text-white font-bold text-[10px] uppercase py-2 rounded-lg hover:bg-red-600 shadow shadow-red-500/10 flex items-center justify-center gap-1 transition-all"
                          >
                            <XCircle size={12} />
                            <span>Decline</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="glass p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/30 text-center">
                <FileText className="size-10 text-slate-300 mx-auto" />
                <h4 className="font-extrabold text-sm mt-3 dark:text-white">Select Case to Audit</h4>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  )
}

import React, { useState } from 'react'
import { 
  Camera, Upload, FileText, CheckCircle2, ChevronRight, AlertCircle, HelpCircle, 
  ArrowRight, ShieldCheck, DollarSign, Calendar, Sparkles, ShieldQuestion, FileDown
} from 'lucide-react'
import { apiClient } from '../services/apiClient'
import { BillData, Claim } from '../types'

export const OcrUpload: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1) // 1: Upload, 2: Parsing, 3: Form review, 4: Results
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  
  // Editable bill details
  const [billForm, setBillForm] = useState<BillData>({
    hospital_name: '',
    treatment: '',
    treatment_key: 'default',
    amount: 0,
    admission_date: '',
    discharge_date: ''
  })
  
  const [caseId, setCaseId] = useState<number | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  
  // Scheme checks
  const [flags, setFlags] = useState({
    hasPMJAY: true,
    hasESIC: true,
    hasGroupPolicy: false
  })
  
  const [claims, setClaims] = useState<Claim[]>([])
  const [predictions, setPredictions] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImage(file)
      setPreview(URL.createObjectURL(file))
      triggerOcr(file)
    }
  }

  const triggerOcr = async (file: File) => {
    setStep(2)
    const formData = new FormData()
    formData.append('billImage', file)

    try {
      const response = await apiClient.post('/api/extract-bill', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      const { billData, caseId: cid, sessionId: sid } = response.data
      setCaseId(cid)
      setSessionId(sid)
      
      // Populate form
      setBillForm({
        hospital_name: billData.hospitalName || 'Unknown Hospital',
        treatment: billData.treatment || 'General Medical Treatment',
        treatment_key: billData.treatmentKey || 'default',
        amount: billData.amount || 0,
        admission_date: billData.admissionDate || '',
        discharge_date: billData.dischargeDate || ''
      })
      
      setStep(3)
    } catch (err) {
      console.error('OCR failed', err)
      setStep(1)
      alert('Failed to parse bill. Please upload a high-contrast invoice photo.')
    }
  }

  const handleComputeClaims = async () => {
    if (!caseId) return
    setLoading(true)

    try {
      // Compute claims
      const claimsRes = await apiClient.post('/api/compute-claims', {
        caseId,
        billData: {
          hospitalName: billForm.hospital_name,
          treatment: billForm.treatment,
          treatmentKey: billForm.treatment_key,
          amount: billForm.amount,
          admissionDate: billForm.admission_date,
          dischargeDate: billForm.discharge_date
        },
        flags
      })
      
      setClaims(claimsRes.data.claims)

      // Fetch predictions & recommendations
      const predRes = await apiClient.get(`/api/v1/cases/${caseId}/predictions`)
      setPredictions(predRes.data)
      
      setStep(4)
    } catch (err) {
      console.error('Failed to compute claims', err)
      alert('Error calculating scheme benefits. Try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle PDF report download mock
  const downloadReport = () => {
    alert('Generating claim compliance document PDF... Download initiated.')
  }

  return (
    <div className="flex-1 p-8 space-y-8 overflow-y-auto max-h-screen">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight dark:text-white font-sans">AI Claims Automation</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold mt-1">
          Scan hospital bills, auto-fill medical indices, and predict government eligibility.
        </p>
      </div>

      {/* Steps Indicator */}
      <div className="flex items-center gap-4 bg-slate-100/50 dark:bg-slate-800/30 p-3 rounded-2xl border border-slate-200/20 max-w-lg">
        {[
          { num: 1, label: 'Upload' },
          { num: 2, label: 'OCR Parse' },
          { num: 3, label: 'Review' },
          { num: 4, label: 'Results' }
        ].map((s, idx) => (
          <React.Fragment key={idx}>
            <div className="flex items-center gap-1.5">
              <div className={`size-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step === s.num 
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20' 
                  : step > s.num 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
              }`}>
                {step > s.num ? '✓' : s.num}
              </div>
              <span className={`text-xs font-bold ${step === s.num ? 'text-primary-500 dark:text-primary-400' : 'text-slate-400'}`}>
                {s.label}
              </span>
            </div>
            {idx < 3 && <ChevronRight size={14} className="text-slate-300 dark:text-slate-700" />}
          </React.Fragment>
        ))}
      </div>

      {/* Main Stepper Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Upload & Input Panel */}
        <div className="lg:col-span-2 space-y-6">
          
          {step === 1 && (
            <div className="glass p-12 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 flex flex-col items-center justify-center text-center group hover:border-primary-500 transition-all cursor-pointer relative">
              <input 
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="size-20 bg-primary-500/10 text-primary-500 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300">
                <Upload size={32} />
              </div>
              <h3 className="font-extrabold text-lg dark:text-white">Upload Hospital Invoice</h3>
              <p className="text-sm text-slate-400 max-w-sm mt-2 font-medium">
                Drag and drop your receipt image, open your camera, or choose a gallery file.
              </p>
              <button className="mt-8 bg-primary-500 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary-500/20 hover:opacity-95 transition-all">
                Choose Image
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="glass p-12 rounded-3xl border border-slate-200/50 dark:border-slate-800/30 flex flex-col items-center justify-center text-center space-y-6">
              <div className="size-16 bg-primary-500/10 text-primary-500 rounded-full flex items-center justify-center relative">
                <FileText size={28} className="animate-pulse" />
                <div className="absolute inset-0 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
              </div>
              <div>
                <h3 className="font-bold text-base dark:text-white">Analyzing Bill Layout</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs font-semibold">
                  Tesseract OCR scanning and Regex key matching are running on the server...
                </p>
              </div>
              {/* Skeleton Forms */}
              <div className="w-full space-y-4 max-w-md pt-4">
                <div className="h-10 bg-slate-100 dark:bg-slate-800/50 rounded-xl animate-pulse" />
                <div className="h-10 bg-slate-100 dark:bg-slate-800/50 rounded-xl animate-pulse" style={{ animationDelay: '150ms' }} />
                <div className="h-10 bg-slate-100 dark:bg-slate-800/50 rounded-xl animate-pulse" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/30 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/40 pb-4">
                <h3 className="font-extrabold text-lg dark:text-white">Verify Extracted Invoice Details</h3>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-500 font-bold uppercase px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <Sparkles size={10} />
                  OCR Auto-Filled
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Hospital Name</label>
                  <input
                    value={billForm.hospital_name || ''}
                    onChange={(e) => setBillForm({ ...billForm, hospital_name: e.target.value })}
                    className="h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 focus:outline-none focus:border-primary-500 dark:text-white text-sm"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Treatment Description</label>
                  <input
                    value={billForm.treatment || ''}
                    onChange={(e) => setBillForm({ ...billForm, treatment: e.target.value })}
                    className="h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 focus:outline-none focus:border-primary-500 dark:text-white text-sm"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Treatment Category</label>
                  <select
                    value={billForm.treatment_key || 'default'}
                    onChange={(e) => setBillForm({ ...billForm, treatment_key: e.target.value })}
                    className="h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 focus:outline-none focus:border-primary-500 dark:text-white text-sm"
                  >
                    <option value="fracture">Fracture Reconstruction (Ortho)</option>
                    <option value="accident_emergency">Accident & Emergency Care</option>
                    <option value="default">General Routine Admission</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Total Bill Amount (₹)</label>
                  <input
                    type="number"
                    value={billForm.amount || ''}
                    onChange={(e) => setBillForm({ ...billForm, amount: parseFloat(e.target.value) || 0 })}
                    className="h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 focus:outline-none focus:border-primary-500 dark:text-white font-mono text-sm"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Admission Date</label>
                  <input
                    value={billForm.admission_date || ''}
                    onChange={(e) => setBillForm({ ...billForm, admission_date: e.target.value })}
                    className="h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 focus:outline-none focus:border-primary-500 dark:text-white text-sm"
                    placeholder="DD/MM/YYYY"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Discharge Date</label>
                  <input
                    value={billForm.discharge_date || ''}
                    onChange={(e) => setBillForm({ ...billForm, discharge_date: e.target.value })}
                    className="h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 focus:outline-none focus:border-primary-500 dark:text-white text-sm"
                    placeholder="DD/MM/YYYY"
                  />
                </div>
              </div>

              {/* Policy checkbox row */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Policy Coverage for Evaluation</h4>
                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold dark:text-slate-300">
                    <input 
                      type="checkbox" 
                      checked={flags.hasPMJAY}
                      onChange={(e) => setFlags({ ...flags, hasPMJAY: e.target.checked })}
                      className="size-4 rounded accent-primary-500"
                    />
                    <span>PM-JAY Scheme</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold dark:text-slate-300">
                    <input 
                      type="checkbox" 
                      checked={flags.hasESIC}
                      onChange={(e) => setFlags({ ...flags, hasESIC: e.target.checked })}
                      className="size-4 rounded accent-primary-500"
                    />
                    <span>ESIC Benefits</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold dark:text-slate-300">
                    <input 
                      type="checkbox" 
                      checked={flags.hasGroupPolicy}
                      onChange={(e) => setFlags({ ...flags, hasGroupPolicy: e.target.checked })}
                      className="size-4 rounded accent-primary-500"
                    />
                    <span>Private Corporate Policy</span>
                  </label>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                onClick={handleComputeClaims}
                disabled={loading}
                className="w-full h-14 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl font-bold uppercase tracking-wider shadow-lg shadow-primary-500/25 flex items-center justify-center gap-2 transition-all"
              >
                {loading ? 'Evaluating Policy Rules...' : 'Compute Eligible Claims'}
                <ArrowRight size={18} />
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              {/* Claims calculations */}
              <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/30 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/40 pb-4">
                  <h3 className="font-extrabold text-lg dark:text-white">Eligible Benefits Summary</h3>
                  <button 
                    onClick={downloadReport}
                    className="flex items-center gap-2 text-xs font-bold text-primary-500 hover:text-primary-600 border border-primary-500/20 bg-primary-500/5 px-3.5 py-2 rounded-xl transition-all"
                  >
                    <FileDown size={14} />
                    <span>Download Compliance PDF</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {claims.map((claim, idx) => (
                    <div key={idx} className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      claim.eligible 
                        ? 'bg-emerald-500/5 border-emerald-500/10 dark:border-emerald-500/5' 
                        : 'bg-slate-100/40 dark:bg-slate-800/20 border-slate-200/30 dark:border-slate-800/40'
                    }`}>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-lg ${
                            claim.eligible ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                          }`}>
                            {claim.scheme}
                          </span>
                          <span className="text-xs font-semibold text-slate-400">
                            {claim.eligible ? 'Approved' : 'Not Eligible'}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1">{claim.reason}</p>
                      </div>
                      
                      <div className="text-left md:text-right shrink-0">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Claimable Amount</span>
                        <span className={`text-xl font-extrabold block mt-0.5 ${claim.eligible ? 'text-emerald-500' : 'text-slate-400'}`}>
                          ₹{claim.amount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reset scan */}
              <button 
                onClick={() => setStep(1)}
                className="glass border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100/60 font-semibold px-6 py-3.5 rounded-2xl text-xs uppercase tracking-wider transition-all"
              >
                Scan Another Bill
              </button>
            </div>
          )}

        </div>

        {/* Right Side: Visual Mock & Predictions Sidepanel */}
        <div className="space-y-6">
          
          {/* Bill image preview */}
          {preview && (
            <div className="glass p-4 rounded-3xl border border-slate-200/50 dark:border-slate-800/30">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">Scanned Document Preview</span>
              <div className="rounded-2xl overflow-hidden border border-slate-200/30 dark:border-slate-800/20 max-h-64 flex justify-center bg-slate-900">
                <img src={preview} alt="Bill Preview" className="object-contain max-h-full" />
              </div>
            </div>
          )}

          {/* Predictions panel */}
          {step === 4 && predictions && (
            <div className="space-y-6">
              
              {/* Approval prediction */}
              <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/30 space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="text-primary-500 size-5" />
                  <h4 className="font-extrabold text-sm dark:text-white uppercase tracking-wider">AI Approval probability</h4>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="size-20 rounded-full border-4 border-primary-500/20 border-t-primary-500 flex items-center justify-center shrink-0">
                    <span className="font-extrabold text-lg dark:text-white">{predictions.approval_predictions.approval_probability}%</span>
                  </div>
                  <div>
                    <div className="inline-flex text-[10px] bg-primary-500/10 text-primary-500 font-bold uppercase px-2 py-0.5 rounded-lg mb-1">
                      {predictions.approval_predictions.risk_category} RISK LEVEL
                    </div>
                    <p className="text-xs font-semibold text-slate-400">{predictions.approval_predictions.estimated_processing_time}</p>
                  </div>
                </div>

                <div className="space-y-2 border-t border-slate-100 dark:border-slate-800/40 pt-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Risk Factors:</span>
                  {predictions.approval_predictions.factors.map((f: string, i: number) => (
                    <div key={i} className="flex gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                      <span className="text-slate-400">•</span>
                      <p>{f}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Treatment prediction */}
              <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/30 space-y-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="text-primary-500 size-5" />
                  <h4 className="font-extrabold text-sm dark:text-white uppercase tracking-wider">Cost Predictions</h4>
                </div>
                
                <div className="space-y-3 text-xs font-medium">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Normal Price Range:</span>
                    <span className="dark:text-slate-200 font-bold">₹{predictions.cost_predictions.estimated_min_cost.toLocaleString()} - ₹{predictions.cost_predictions.estimated_max_cost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Average Treatment Rate:</span>
                    <span className="dark:text-slate-200 font-bold">₹{predictions.cost_predictions.average_cost_for_treatment.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 dark:border-slate-800/40 pt-3">
                    <span className="text-slate-400 font-bold">Current Bill:</span>
                    <span className="text-primary-500 font-bold font-mono text-sm">₹{predictions.cost_predictions.current_bill_amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Within Standard Range:</span>
                    <span className={`font-bold ${predictions.cost_predictions.is_within_normal_range ? 'text-green-500' : 'text-amber-500'}`}>
                      {predictions.cost_predictions.is_within_normal_range ? 'Yes (Normal Cost)' : 'Out-of-Range (Audit Needed)'}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  )
}

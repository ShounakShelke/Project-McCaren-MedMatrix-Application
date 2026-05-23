import React, { useState } from 'react'
import { 
  ShieldCheck, ShieldAlert, Upload, Sparkles, AlertCircle, RefreshCw, FileText, 
  QrCode, Image as ImageIcon, Binary, ArrowRight, BookOpen
} from 'lucide-react'
import { apiClient } from '../services/apiClient'
import { CardValidationResult } from '../types'

export const FraudDetails: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [cardType, setCardType] = useState<'pmjay' | 'esic'>('pmjay')
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<CardValidationResult | null>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setPreview(URL.createObjectURL(file))
      setLoading(true)
      
      const formData = new FormData()
      formData.append('cardImage', file)
      formData.append('cardType', cardType)

      try {
        const res = await apiClient.post('/api/verify-card', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        
        // Match response keys
        const data = res.data
        setResult({
          is_valid: data.is_valid,
          overall_score: data.overall_score,
          card_type: data.card_type,
          checks: {
            qr_code: data.checks.qr_code,
            hologram: data.checks.hologram,
            id_format: data.checks.id_format,
            tampering: data.checks.tampering
          },
          extracted_info: {
            beneficiary_id: data.extracted_info.beneficiary_id,
            name: data.extracted_info.name,
            state_code: data.extracted_info.state_code
          },
          flags: data.flags
        })
      } catch (err) {
        console.error('Card verification failed', err)
        alert('Failed to verify card. Ensure the card is flat, well-lit, and clear.')
      } finally {
        setLoading(false)
      }
    }
  }

  const resetVerification = () => {
    setPreview(null)
    setResult(null)
  }

  return (
    <div className="flex-1 p-8 space-y-8 overflow-y-auto max-h-screen">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight dark:text-white font-sans">Card Fraud Shield</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold mt-1">
            Detect tampered text, check holograms, and verify card QR signatures using ML.
          </p>
        </div>
      </div>

      {!result ? (
        <div className="max-w-xl mx-auto glass p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/30 space-y-6">
          <div className="flex gap-4 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
            <button
              onClick={() => setCardType('pmjay')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                cardType === 'pmjay' 
                  ? 'bg-primary-500 text-white shadow' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              PM-JAY Scheme Card
            </button>
            <button
              onClick={() => setCardType('esic')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                cardType === 'esic' 
                  ? 'bg-primary-500 text-white shadow' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              ESIC Insurance Card
            </button>
          </div>

          <div className="h-64 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center relative group hover:border-primary-500 transition-all cursor-pointer">
            <input 
              type="file" 
              accept="image/*"
              onChange={handleUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            {loading ? (
              <div className="flex flex-col items-center gap-3">
                <RefreshCw className="size-10 text-primary-500 animate-spin" />
                <span className="text-xs font-bold text-slate-500">Scanning security layers...</span>
              </div>
            ) : (
              <>
                <div className="size-14 bg-primary-500/10 text-primary-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-all">
                  <Upload size={24} />
                </div>
                <h4 className="font-extrabold text-sm dark:text-white">Upload {cardType === 'pmjay' ? 'Ayushman' : 'ESIC'} Card</h4>
                <p className="text-xs text-slate-400 max-w-xs mt-1 font-semibold">
                  Photo of card front side showing the QR code clearly.
                </p>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left panel: Extracted ID information */}
          <div className="space-y-6">
            <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/30">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">Card Document</span>
              <div className="rounded-2xl overflow-hidden border border-slate-200/30 dark:border-slate-800/20 max-h-64 flex justify-center bg-slate-900">
                <img src={preview!} alt="Card Preview" className="object-contain max-h-full" />
              </div>
            </div>

            {/* Verification Stats */}
            <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/30 space-y-4">
              <h4 className="font-extrabold text-sm dark:text-white uppercase tracking-wider">Verification Metrics</h4>
              <div className="space-y-3 text-xs font-semibold">
                <div className="flex justify-between">
                  <span className="text-slate-400">Card Type:</span>
                  <span className="dark:text-slate-200 uppercase">{result.card_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Extracted ID:</span>
                  <span className="dark:text-slate-200 font-mono text-sm">{result.extracted_info.beneficiary_id || 'N/A'}</span>
                </div>
                {result.extracted_info.state_code && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Resident State:</span>
                    <span className="dark:text-slate-200 font-bold">{result.extracted_info.state_code}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Holder Name:</span>
                  <span className="dark:text-slate-200 font-bold">{result.extracted_info.name || 'Raju Kumar'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel: Trust Scores & Individual Checks */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Overall Score Banner */}
            <div className={`p-6 rounded-3xl border flex items-center justify-between gap-6 ${
              result.is_valid 
                ? 'bg-emerald-500/5 border-emerald-500/10 dark:border-emerald-500/5 text-emerald-800 dark:text-emerald-400' 
                : 'bg-red-500/5 border-red-500/10 dark:border-red-500/5 text-red-800 dark:text-red-400'
            }`}>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {result.is_valid ? <ShieldCheck className="size-6 text-emerald-500" /> : <ShieldAlert className="size-6 text-red-500" />}
                  <h3 className="text-lg font-extrabold uppercase tracking-tight">
                    {result.is_valid ? 'CARD VERIFIED APPROVED' : 'CARD SUSPICIOUS / DECLINED'}
                  </h3>
                </div>
                <p className="text-xs font-semibold text-slate-400">
                  {result.is_valid 
                    ? 'All security indices passed. Safe for claim calculation.' 
                    : 'Security checks failed. Flagged for manual audit review.'}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Security Trust Score</span>
                <span className={`text-3xl font-black block mt-0.5 ${result.is_valid ? 'text-emerald-500' : 'text-red-500'}`}>
                  {(result.overall_score * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Checks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* QR Code Check */}
              <div className="glass p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/30 flex items-start gap-4">
                <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
                  result.checks.qr_code.passed ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                }`}>
                  <QrCode size={18} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm dark:text-white">QR Code Validation</h4>
                  <p className="text-xs text-slate-400 font-semibold">{result.checks.qr_code.message}</p>
                  <span className="text-[10px] font-bold text-slate-400 block pt-1">Score: {(result.checks.qr_code.score * 100).toFixed(0)}%</span>
                </div>
              </div>

              {/* Hologram Check */}
              <div className="glass p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/30 flex items-start gap-4">
                <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
                  result.checks.hologram.passed ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                }`}>
                  <Sparkles size={18} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm dark:text-white">Hologram Verification</h4>
                  <p className="text-xs text-slate-400 font-semibold">{result.checks.hologram.message}</p>
                  <span className="text-[10px] font-bold text-slate-400 block pt-1">Score: {(result.checks.hologram.score * 100).toFixed(0)}%</span>
                </div>
              </div>

              {/* ID format */}
              <div className="glass p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/30 flex items-start gap-4">
                <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
                  result.checks.id_format.passed ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                }`}>
                  <Binary size={18} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm dark:text-white">ID Structure Check</h4>
                  <p className="text-xs text-slate-400 font-semibold">{result.checks.id_format.message}</p>
                  <span className="text-[10px] font-bold text-slate-400 block pt-1">Score: {(result.checks.id_format.score * 100).toFixed(0)}%</span>
                </div>
              </div>

              {/* Digital Tampering Check */}
              <div className="glass p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/30 flex items-start gap-4">
                <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
                  result.checks.tampering.passed ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                }`}>
                  <ImageIcon size={18} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm dark:text-white">Pixel Tamper Detection</h4>
                  <p className="text-xs text-slate-400 font-semibold">{result.checks.tampering.message}</p>
                  <span className="text-[10px] font-bold text-slate-400 block pt-1">Score: {(result.checks.tampering.score * 100).toFixed(0)}%</span>
                </div>
              </div>

            </div>

            {/* Flags Alert Row */}
            {result.flags.length > 0 && (
              <div className="p-5 bg-red-500/5 border border-red-500/10 dark:border-red-500/5 rounded-2xl space-y-2 text-red-600 dark:text-red-400">
                <div className="flex items-center gap-2">
                  <AlertCircle size={18} />
                  <h4 className="font-extrabold text-sm uppercase tracking-wide">Security Anomaly Flags</h4>
                </div>
                <div className="space-y-1 text-xs font-semibold">
                  {result.flags.map((f, i) => (
                    <p key={i} className="flex gap-1">
                      <span>•</span>
                      <span>{f}</span>
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Try again button */}
            <button
              onClick={resetVerification}
              className="glass border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 font-semibold px-6 py-3.5 rounded-2xl text-xs uppercase tracking-wider transition-all"
            >
              Verify Another Card
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

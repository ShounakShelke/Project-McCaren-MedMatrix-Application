import React, { useState, useEffect } from 'react'
import { MapPin, Star, Bed, HeartPulse, Search, ShieldCheck, Filter } from 'lucide-react'
import { apiClient } from '../services/apiClient'
import { Hospital } from '../types'

export const HospitalFinder: React.FC = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(true)
  const [city, setCity] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [pmjayOnly, setPmjayOnly] = useState(false)
  const [esicOnly, setEsicOnly] = useState(false)

  const fetchHospitals = async () => {
    setLoading(true)
    try {
      const params: any = {}
      if (city) params.city = city
      if (specialty) params.specialty = specialty
      if (pmjayOnly) params.pmjay = true
      if (esicOnly) params.esic = true

      const res = await apiClient.get('/api/v1/hospitals/', { params })
      setHospitals(res.data)
    } catch (err) {
      console.error('Failed to load hospitals list', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHospitals()
  }, [city, specialty, pmjayOnly, esicOnly])

  return (
    <div className="flex-1 p-8 space-y-8 overflow-y-auto max-h-screen">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight dark:text-white font-sans">Empanelled Hospital Directory</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold mt-1">
          Locate nearby medical centers supporting PM-JAY and ESIC cashless claims.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/20 grid grid-cols-1 md:grid-cols-4 gap-4 items-center shadow-sm">
        
        {/* City Filter */}
        <div className="relative">
          <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Search by city (e.g., Mumbai)..."
            className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 focus:outline-none focus:border-primary-500 dark:text-white text-xs font-semibold"
          />
        </div>

        {/* Specialty Filter */}
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            placeholder="Specialty (e.g., Orthopedics)..."
            className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 focus:outline-none focus:border-primary-500 dark:text-white text-xs font-semibold"
          />
        </div>

        {/* Coverage Checkboxes */}
        <div className="flex flex-col gap-2 md:col-span-2 md:flex-row md:gap-6 justify-center">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <input
              type="checkbox"
              checked={pmjayOnly}
              onChange={(e) => setPmjayOnly(e.target.checked)}
              className="size-4 rounded accent-primary-500"
            />
            <span>Supports PM-JAY</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <input
              type="checkbox"
              checked={esicOnly}
              onChange={(e) => setEsicOnly(e.target.checked)}
              className="size-4 rounded accent-primary-500"
            />
            <span>Supports ESIC</span>
          </label>
        </div>

      </div>

      {/* Hospitals List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-44 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : hospitals.length === 0 ? (
        <div className="text-center py-20 glass rounded-3xl border border-slate-200/50 dark:border-slate-800/30">
          <HeartPulse className="size-12 text-slate-300 mx-auto" />
          <h4 className="font-extrabold text-sm mt-3 dark:text-white">No Hospitals Found</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto font-semibold">
            Try expanding your search query or removing scheme filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hospitals.map((hosp) => (
            <div key={hosp.id} className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/20 shadow-sm flex flex-col justify-between hover:-translate-y-0.5 transition-all duration-300">
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="font-extrabold text-base dark:text-white leading-snug">{hosp.name}</h3>
                  <div className="flex items-center gap-1 text-amber-500 shrink-0">
                    <Star size={14} fill="#f59e0b" />
                    <span className="text-xs font-bold">{hosp.ratings.toFixed(1)}</span>
                  </div>
                </div>
                
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{hosp.address}, {hosp.city} - {hosp.pincode}</p>
                
                {hosp.specialty && (
                  <p className="text-xs text-primary-500 font-bold uppercase tracking-wider">{hosp.specialty}</p>
                )}
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/40">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                  <Bed size={15} />
                  <span>{hosp.bed_availability} Beds Available</span>
                </div>

                <div className="flex gap-2">
                  {hosp.supports_pmjay && (
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold uppercase px-2 py-0.5 rounded-lg border border-emerald-500/10">
                      PM-JAY
                    </span>
                  )}
                  {hosp.supports_esic && (
                    <span className="text-[10px] bg-sky-500/10 text-sky-600 dark:text-sky-400 font-extrabold uppercase px-2 py-0.5 rounded-lg border border-sky-500/10">
                      ESIC
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}

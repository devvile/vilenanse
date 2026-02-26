'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { 
  Moon, 
  Sun, 
  Rocket, 
  Plus, 
  Trash2, 
  Edit2, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Check,
  X,
  TrendingUp
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  subDays, 
  addDays,
  differenceInMinutes,
  parseISO,
  isSameDay
} from 'date-fns'
import { 
  getSleepRecord, 
  getSleepRecordsForWeek, 
  getSleepRecordsLast30Days, 
  upsertSleepRecord, 
  deleteSleepField,
  getSleepPreferences,
  updateSleepPreferences,
  SleepRecord,
  SleepPreferences
} from '@/lib/sleep'
import { TimePicker } from '@/components/health/time-picker'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceDot
} from 'recharts'

// --- Utility Hooks ---

const useSleepData = (selectedDate: Date) => {
  const [record, setRecord] = useState<SleepRecord | null>(null)
  const [prefs, setPrefs] = useState<SleepPreferences | null>(null)
  const [avg30, setAvg30] = useState<{woke: string, start: string, bed: string} | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [rec, preferences, last30] = await Promise.all([
        getSleepRecord(format(selectedDate, 'yyyy-MM-dd')),
        getSleepPreferences(),
        getSleepRecordsLast30Days()
      ])
      
      setRecord(rec)
      setPrefs(preferences)
      
      // Calculate 30-day averages using circular math
      if (last30.length > 0) {
        const calculateAvg = (field: keyof SleepRecord) => {
          const valid = last30.filter(r => r[field]).map(r => {
            const d = new Date(r[field] as string)
            // If it's went_to_bed_at and past midnight, keep it as > 24h for circularity?
            // Simplified circular: convert to minutes since midnight
            let mins = d.getHours() * 60 + d.getMinutes()
            // If we're looking at bed time and it's early morning (e.g. 0-5), add 24h
            if (field === 'went_to_bed_at' && d.getHours() < 12) {
              mins += 24 * 60
            }
            return mins
          })
          
          if (valid.length === 0) return null
          
          const sum = valid.reduce((a, b) => a + b, 0)
          const avgMins = Math.round(sum / valid.length / 15) * 15 // 15m precision
          const h = Math.floor(avgMins / 60) % 24
          const m = avgMins % 60
          return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
        }
        
        setAvg30({
          woke: calculateAvg('woke_up_at') || '--:--',
          start: calculateAvg('started_day_at') || '--:--',
          bed: calculateAvg('went_to_bed_at') || '--:--'
        })
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [selectedDate])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { record, prefs, avg30, loading, refresh: fetchData }
}

// --- Components ---

const LoadingSkeleton = () => (
  <div className="space-y-6 animate-pulse pt-24 max-w-4xl mx-auto px-4">
    <div className="h-64 bg-white/[0.05] rounded-2xl" />
    <div className="h-96 bg-white/[0.05] rounded-2xl" />
  </div>
)

export default function SleepPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [dayType, setDayType] = useState<'today' | 'yesterday' | 'picker'>('today')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [deletingField, setDeletingField] = useState<string | null>(null)
  const [isEditingPrefs, setIsEditingPrefs] = useState(false)
  
  // Week View State
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [weekType, setWeekType] = useState<'this' | 'last' | 'picker'>('this')
  const [showWeekPicker, setShowWeekPicker] = useState(false)
  const [weekData, setWeekData] = useState<any[]>([])

  const { record, prefs, avg30, loading, refresh } = useSleepData(selectedDate)

  // --- Handlers ---

  const handleDayTypeChange = (type: 'today' | 'yesterday' | 'picker') => {
    setDayType(type)
    if (type === 'today') {
      setSelectedDate(new Date())
      setShowDatePicker(false)
    } else if (type === 'yesterday') {
      setSelectedDate(subDays(new Date(), 1))
      setShowDatePicker(false)
    } else {
      setShowDatePicker(true)
    }
  }

  const handleUpsert = async (field: string, value: string) => {
    try {
      await upsertSleepRecord(format(selectedDate, 'yyyy-MM-dd'), { [field]: value })
      setEditingField(null)
      refresh()
    } catch (e) {
      console.error(e)
    }
  }

  const handleDelete = async (field: 'woke_up_at' | 'started_day_at' | 'went_to_bed_at') => {
    try {
      await deleteSleepField(format(selectedDate, 'yyyy-MM-dd'), field)
      setDeletingField(null)
      refresh()
    } catch (e) {
      console.error(e)
    }
  }

  const handlePrefUpdate = async (newPrefs: Partial<SleepPreferences>) => {
    try {
      await updateSleepPreferences(newPrefs)
      setIsEditingPrefs(false)
      refresh()
    } catch (e) {
      console.error(e)
    }
  }

  // --- Week View Logic ---

  const fetchWeekViewData = useCallback(async () => {
    const end = endOfWeek(weekStart, { weekStartsOn: 1 })
    const data = await getSleepRecordsForWeek(format(weekStart, 'yyyy-MM-dd'), format(end, 'yyyy-MM-dd'))
    const preferences = await getSleepPreferences()
    
    const daysInWeek = eachDayOfInterval({ start: weekStart, end })
    
    const chartData = daysInWeek.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd')
      const rec = data.find(r => r.logical_date === dateStr)
      
      const toMinutes = (iso: string | null | undefined, isBed = false) => {
        if (!iso) return null
        const d = new Date(iso)
        let mins = d.getHours() * 60 + d.getMinutes()
        if (isBed && d.getHours() < 12) mins += 24 * 60
        return mins
      }

      const prefToMinutes = (timeStr: string) => {
        const [h, m] = timeStr.split(':').map(Number)
        return h * 60 + m
      }

      const checkDeviation = (mins: number | null, prefTime: string) => {
        if (mins === null) return false
        const prefMins = prefToMinutes(prefTime)
        return Math.abs(mins - prefMins) > 60
      }

      return {
        name: format(day, 'EEE'),
        woke: toMinutes(rec?.woke_up_at),
        wokeLabel: rec?.woke_up_at ? format(new Date(rec.woke_up_at), 'HH:mm') : null,
        wokeDeviates: checkDeviation(toMinutes(rec?.woke_up_at), preferences.desired_woke_up_at),
        
        start: toMinutes(rec?.started_day_at),
        startLabel: rec?.started_day_at ? format(new Date(rec.started_day_at), 'HH:mm') : null,
        startDeviates: checkDeviation(toMinutes(rec?.started_day_at), preferences.desired_started_day_at),
        
        bed: toMinutes(rec?.went_to_bed_at, true),
        bedLabel: rec?.went_to_bed_at ? format(new Date(rec.went_to_bed_at), 'HH:mm') : null,
        bedDeviates: checkDeviation(toMinutes(rec?.went_to_bed_at, true), preferences.desired_went_to_bed_at)
      }
    })
    
    setWeekData(chartData)
  }, [weekStart])

  useEffect(() => {
    fetchWeekViewData()
  }, [fetchWeekViewData])

  const handleWeekTypeChange = (type: 'this' | 'last' | 'picker') => {
    setWeekType(type)
    if (type === 'this') {
      setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))
      setShowWeekPicker(false)
    } else if (type === 'last') {
      setWeekStart(subDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 7))
      setShowWeekPicker(false)
    } else {
      setShowWeekPicker(true)
    }
  }

  if (loading && !record) return <LoadingSkeleton />

  const timeSlots = [
    { id: 'woke_up_at', label: 'Woke up', icon: Sun, color: 'text-blue-400', target: prefs?.desired_woke_up_at },
    { id: 'started_day_at', label: 'Started day', icon: Rocket, color: 'text-emerald-400', target: prefs?.desired_started_day_at },
    { id: 'went_to_bed_at', label: 'Went to bed', icon: Moon, color: 'text-purple-400', target: prefs?.desired_went_to_bed_at },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto pt-24 pb-20 space-y-8 min-h-screen animate-fade-in">
      
      {/* SECTION 1: DAY VIEW */}
      <Card className="bg-card border-white/[0.08] overflow-hidden">
        <div className="p-6 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              Sleep Tracker
            </h2>
            
            <div className="flex bg-background rounded-full p-1 border border-white/[0.05]">
              {(['today', 'yesterday', 'picker'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => handleDayTypeChange(type)}
                  className={cn(
                    "px-4 py-1.5 text-[10px] font-bold rounded-full transition-all uppercase tracking-tight",
                    dayType === type 
                      ? "bg-emerald-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.3)]" 
                      : "text-text-secondary hover:text-text-primary"
                  )}
                >
                  {type === 'picker' ? 'Date' : type}
                </button>
              ))}
            </div>
          </div>

          {showDatePicker && (
            <div className="p-4 bg-background/50 rounded-2xl border border-white/[0.05] flex items-center justify-between gap-4">
              <button onClick={() => setSelectedDate(subDays(selectedDate, 1))} className="p-2 hover:bg-white/5 rounded-full transition-colors"><ChevronLeft className="h-5 w-5"/></button>
              <div className="flex items-center gap-2 font-medium">
                <CalendarIcon className="h-4 w-4 text-emerald-500" />
                <span>{format(selectedDate, 'PPPP')}</span>
              </div>
              <button 
                disabled={isSameDay(selectedDate, new Date())}
                onClick={() => setSelectedDate(addDays(selectedDate, 1))} 
                className="p-2 hover:bg-white/5 rounded-full transition-colors disabled:opacity-20"
              >
                <ChevronRight className="h-5 w-5"/>
              </button>
            </div>
          )}

          <div className="space-y-4">
            {timeSlots.map(slot => {
              const val = record?.[slot.id as keyof SleepRecord] as string | null
              const isEditing = editingField === slot.id
              const isDeleting = deletingField === slot.id

              return (
                <div key={slot.id} className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/[0.05] group hover:border-white/10 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-xl bg-white/[0.03]", slot.color)}>
                      <slot.icon className="h-5 w-5" />
                    </div>
                    <span className="font-semibold text-text-secondary">{slot.label}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {isEditing ? (
                      <TimePicker 
                        value={val} 
                        allowNextDay={slot.id === 'went_to_bed_at'}
                        baseDate={selectedDate}
                        onChange={(v) => handleUpsert(slot.id, v)} 
                        onCancel={() => setEditingField(null)} 
                      />
                    ) : (
                      <>
                        {val ? (
                          <div className="flex items-center gap-3">
                            <span className="text-xl font-bold tracking-tight">{format(new Date(val), 'HH:mm')}</span>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {isDeleting ? (
                                <div className="flex items-center gap-1 bg-accent-red/10 rounded-lg p-1">
                                  <button onClick={() => handleDelete(slot.id as any)} className="p-1 bg-accent-red text-white rounded-md"><Check className="h-3 w-3"/></button>
                                  <button onClick={() => setDeletingField(null)} className="p-1 bg-white/10 text-white rounded-md"><X className="h-3 w-3"/></button>
                                </div>
                              ) : (
                                <>
                                  <button onClick={() => setEditingField(slot.id)} className="p-2 text-text-muted hover:text-white transition-colors"><Edit2 className="h-3.5 w-3.5"/></button>
                                  <button onClick={() => setDeletingField(slot.id)} className="p-2 text-text-muted hover:text-accent-red transition-colors"><Trash2 className="h-3.5 w-3.5"/></button>
                                </>
                              )}
                            </div>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setEditingField(slot.id)}
                            className="p-2 bg-white/[0.03] hover:bg-white/[0.06] rounded-xl text-emerald-500 transition-all"
                          >
                            <Plus className="h-5 w-5" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="pt-4 border-t border-white/[0.05] space-y-4">
            <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted">
              <span>30-day avg:</span>
              <div className="flex items-center gap-4 text-white font-medium">
                <span className="flex items-center gap-1.5"><Sun className="h-3.5 w-3.5 text-blue-400"/> {avg30?.woke}</span>
                <span className="flex items-center gap-1.5"><Rocket className="h-3.5 w-3.5 text-emerald-400"/> {avg30?.start}</span>
                <span className="flex items-center gap-1.5"><Moon className="h-3.5 w-3.5 text-purple-400"/> {avg30?.bed}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4 text-text-muted">
                  <span>Targets:</span>
                  <div className="flex items-center gap-4 text-text-secondary">
                    <span>🌅 {prefs?.desired_woke_up_at.slice(0, 5)}</span>
                    <span>🚀 {prefs?.desired_started_day_at.slice(0, 5)}</span>
                    <span>🌙 {prefs?.desired_went_to_bed_at.slice(0, 5)}</span>
                  </div>
                </div>
                <button onClick={() => setIsEditingPrefs(!isEditingPrefs)} className="p-2 text-text-muted hover:text-emerald-500 transition-colors">
                  <Settings className="h-4 w-4" />
                </button>
              </div>

              {isEditingPrefs && (
                <div className="p-6 bg-white/[0.02] rounded-2xl border border-white/[0.08] animate-in slide-in-from-top-4 duration-300">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted mb-4">Update Targets</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {timeSlots.map(slot => (
                      <div key={slot.id} className="space-y-2">
                        <label className="text-xs font-semibold text-text-muted ml-1">{slot.label}</label>
                        <select
                          className="w-full bg-background border border-white/[0.1] rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500/50 appearance-none"
                          value={(prefs?.[`desired_${slot.id}` as keyof SleepPreferences] || '08:00:00').slice(0, 5)}
                          onChange={(e) => handlePrefUpdate({ [`desired_${slot.id}`]: e.target.value + ':00' })}
                        >
                          {Array.from({ length: 96 }).map((_, i) => {
                            const h = Math.floor(i * 15 / 60)
                            const m = (i * 15) % 60
                            const t = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
                            return <option key={t} value={t}>{t}</option>
                          })}
                        </select>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button onClick={() => setIsEditingPrefs(false)} className="px-4 py-2 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-all">Done</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* SECTION 2: WEEK VIEW */}
      <Card className="bg-card border-white/[0.08]">
        <div className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-emerald-500" />
                Weekly Analysis
              </h2>
            </div>
            
            <div className="flex bg-background rounded-full p-1 border border-white/[0.05]">
              {(['this', 'last', 'picker'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => handleWeekTypeChange(type)}
                  className={cn(
                    "px-4 py-1.5 text-[10px] font-bold rounded-full transition-all uppercase tracking-tight",
                    weekType === type 
                      ? "bg-emerald-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.3)]" 
                      : "text-text-secondary hover:text-text-primary"
                  )}
                >
                  {type === 'picker' ? 'Week' : (type === 'this' ? 'This week' : 'Last week')}
                </button>
              ))}
            </div>
          </div>

          {showWeekPicker && (
            <div className="p-4 bg-background/50 rounded-2xl border border-white/[0.05] flex items-center justify-between">
              <button onClick={() => setWeekStart(subDays(weekStart, 7))} className="p-2 hover:bg-white/5 rounded-full transition-colors"><ChevronLeft className="h-5 w-5"/></button>
              <div className="text-center">
                <div className="text-[10px] text-text-muted uppercase tracking-widest font-bold mb-0.5">Week of</div>
                <div className="font-medium text-sm">{format(weekStart, 'MMM d')} – {format(endOfWeek(weekStart, { weekStartsOn: 1 }), 'MMM d, yyyy')}</div>
              </div>
              <button onClick={() => setWeekStart(addDays(weekStart, 7))} className="p-2 hover:bg-white/5 rounded-full transition-colors"><ChevronRight className="h-5 w-5"/></button>
            </div>
          )}

          <div className="h-[350px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weekData} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }} 
                  dy={10}
                />
                <YAxis 
                  domain={[300, 1800]} 
                  ticks={[360, 480, 600, 720, 840, 960, 1080, 1200, 1320, 1440, 1560, 1680]}
                  tickFormatter={(val) => {
                    const h = Math.floor(val / 60) % 24
                    return `${h.toString().padStart(2, '0')}:00`
                  }}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a24', border: '1px solid #ffffff10', borderRadius: '16px', padding: '12px' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  labelStyle={{ marginBottom: '8px', color: '#9ca3af', fontWeight: 'bold' }}
                  formatter={(val: any, name: string | undefined) => {
                    const h = Math.floor(val / 60) % 24
                    const m = val % 60
                    return [`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`, name || '']
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  align="center" 
                  iconType="circle"
                  wrapperStyle={{ paddingTop: '30px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}
                />
                
                <Line 
                  connectNulls
                  type="monotone" 
                  dataKey="woke" 
                  name="Woke up"
                  stroke="#60a5fa" 
                  strokeWidth={3}
                  dot={(props: any) => {
                    const { cx, cy, value } = props
                    if (value === null || value === undefined) return null
                    return (
                      <circle key={`dot-woke-${cx}-${cy}`} cx={cx} cy={cy} r={4} fill="#60a5fa" stroke="#0d0d12" strokeWidth={2} />
                    )
                  }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
                <Line 
                  connectNulls
                  type="monotone" 
                  dataKey="start" 
                  name="Started Day"
                  stroke="#34d399" 
                  strokeWidth={3}
                  dot={(props: any) => {
                    const { cx, cy, value } = props
                    if (value === null || value === undefined) return null
                    return (
                      <circle key={`dot-start-${cx}-${cy}`} cx={cx} cy={cy} r={4} fill="#34d399" stroke="#0d0d12" strokeWidth={2} />
                    )
                  }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
                <Line 
                  connectNulls
                  type="monotone" 
                  dataKey="bed" 
                  name="Went to Bed"
                  stroke="#a855f7" 
                  strokeWidth={3}
                  dot={(props: any) => {
                    const { cx, cy, value } = props
                    if (value === null || value === undefined) return null
                    return (
                      <circle key={`dot-bed-${cx}-${cy}`} cx={cx} cy={cy} r={4} fill="#a855f7" stroke="#0d0d12" strokeWidth={2} />
                    )
                  }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 pt-4 border-t border-white/[0.05] text-xs font-bold uppercase tracking-wider text-text-muted">
             {(() => {
                const getAvg = (key: string) => {
                  const valid = weekData.filter(d => d[key] !== null).map(d => d[key])
                  if (valid.length === 0) return '--:--'
                  const avg = Math.round(valid.reduce((a, b) => a + b, 0) / valid.length)
                  const h = Math.floor(avg / 60) % 24
                  const m = avg % 60
                  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
                }
                return (
                  <>
                    <span className="flex items-center gap-2">Avg Weak: <span className="text-blue-400">{getAvg('woke')}</span></span>
                    <span className="flex items-center gap-2">Avg Start: <span className="text-emerald-400">{getAvg('start')}</span></span>
                    <span className="flex items-center gap-2">Avg Bed: <span className="text-purple-400">{getAvg('bed')}</span></span>
                  </>
                )
             })()}
          </div>
        </div>
      </Card>
    </div>
  )
}

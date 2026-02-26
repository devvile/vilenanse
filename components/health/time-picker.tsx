'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TimePickerProps {
  value: string | null // ISO string or HH:mm
  onChange: (value: string) => void
  onCancel: () => void
  allowNextDay?: boolean
  baseDate?: Date
}

export function TimePicker({ value, onChange, onCancel, allowNextDay = false, baseDate = new Date() }: TimePickerProps) {
  const [selectedTime, setSelectedTime] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  // Generate options: 00:00 to 23:45 in 15m increments
  const options = []
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const time = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
      options.push({ value: time, label: time })
    }
  }

  useEffect(() => {
    if (value) {
      const date = new Date(value)
      if (!isNaN(date.getTime())) {
        const h = date.getHours()
        const m = date.getMinutes()
        setSelectedTime(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`)
      } else if (typeof value === 'string' && value.includes(':')) {
        setSelectedTime(value.slice(0, 5))
      }
    }
  }, [value])

  const handleConfirm = () => {
    if (!selectedTime) return
    
    const [h, m] = selectedTime.split(':').map(Number)
    const resultDate = new Date(baseDate)
    
    // Logic: If this is a bedtime slot (allowNextDay) and the hour is early (e.g. 0-11 AM),
    // it's likely the "night of" the logical date, which falls on the next calendar day.
    if (allowNextDay && h < 12) {
      resultDate.setDate(resultDate.getDate() + 1)
    }
    
    resultDate.setHours(h, m, 0, 0)
    onChange(resultDate.toISOString())
  }

  return (
    <div className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
      <div className="relative">
        <select
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
          className="bg-background-secondary border border-white/[0.08] rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none focus:border-accent-green/50 appearance-none min-w-[100px]"
        >
          <option value="" disabled>Time</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      <button
        onClick={handleConfirm}
        className="p-1.5 bg-accent-green text-white rounded-lg hover:bg-accent-green-light transition-colors"
      >
        <Check className="h-4 w-4" />
      </button>
      <button
        onClick={onCancel}
        className="p-1.5 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

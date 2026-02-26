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
      options.push({ value: time, label: time, isNextDay: false })
    }
  }

  // Add next day options if allowed (up to 05:00)
  if (allowNextDay) {
    for (let h = 0; h < 6; h++) {
      for (let m = 0; m < 60; m += 15) {
        if (h === 5 && m > 0) break
        const displayH = 24 + h
        const time = `${displayH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
        options.push({ value: time, label: time, isNextDay: true })
      }
    }
  }

  useEffect(() => {
    if (value) {
      const date = new Date(value)
      if (!isNaN(date.getTime())) {
        let h = date.getHours()
        const m = date.getMinutes()
        
        // Check if it's the "next day" relative to baseDate
        const isNextDay = date.getDate() !== new Date(baseDate).getDate()
        if (isNextDay) h += 24
        
        setSelectedTime(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`)
      } else if (typeof value === 'string' && value.includes(':')) {
        setSelectedTime(value)
      }
    }
  }, [value, baseDate])

  const handleConfirm = () => {
    if (!selectedTime) return
    
    const [h, m] = selectedTime.split(':').map(Number)
    const resultDate = new Date(baseDate)
    
    if (h >= 24) {
      resultDate.setDate(resultDate.getDate() + 1)
      resultDate.setHours(h - 24, m, 0, 0)
    } else {
      resultDate.setHours(h, m, 0, 0)
    }
    
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
        className="p-1.5 bg-accent-green text-black rounded-lg hover:bg-accent-green-light transition-colors"
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

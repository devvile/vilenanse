'use client'

import { cn } from '@/lib/utils'
import { format, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'

interface HabitHorizontalPickerProps {
    selectedDate: Date
    onDateSelect: (date: Date) => void
}

export function HabitHorizontalPicker({ selectedDate, onDateSelect }: HabitHorizontalPickerProps) {
    const today = new Date()
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 })
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

    return (
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 no-scrollbar">
            {days.map((day) => {
                const isSelected = isSameDay(day, selectedDate)
                const isToday = isSameDay(day, today)

                return (
                    <button
                        key={day.toString()}
                        onClick={() => onDateSelect(day)}
                        className="flex flex-col items-center gap-2 min-w-[50px] transition-all"
                    >
                        <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest",
                            isToday ? "text-emerald-400" : "text-gray-500"
                        )}>
                            {format(day, 'eee')}
                        </span>
                        <div className={cn(
                            "w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold border-2 transition-all",
                            isSelected
                                ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)] scale-110"
                                : isToday
                                    ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/5"
                                    : "border-white/5 text-gray-400 hover:border-white/20"
                        )}>
                            {format(day, 'd')}
                        </div>
                        {isToday && !isSelected && (
                            <div className="w-1 h-1 rounded-full bg-emerald-500" />
                        )}
                    </button>
                )
            })}
        </div>
    )
}

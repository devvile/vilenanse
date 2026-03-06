'use client'

import { cn } from '@/lib/utils'
import {
    format,
    addDays,
    startOfWeek,
    isSameDay,
    isToday,
    subWeeks,
    addWeeks
} from 'date-fns'
import { ChevronLeft, ChevronRight, Dumbbell } from 'lucide-react'
import { Training } from '@/lib/fitness'

interface FitnessWeeklyTimelineProps {
    selectedDate: Date
    onDateSelect: (date: Date) => void
    trainings: Training[]
}

export function FitnessWeeklyTimeline({
    selectedDate,
    onDateSelect,
    trainings
}: FitnessWeeklyTimelineProps) {
    // We always show the current week of the selected date
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

    const handlePrevWeek = () => onDateSelect(addDays(selectedDate, -7))
    const handleNextWeek = () => onDateSelect(addDays(selectedDate, 7))

    const hasTrainingOnDay = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd')
        return trainings.some((t: Training) => t.training_date === dateStr)
    }

    return (
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-[2.5rem] p-6">
            <div className="flex items-center justify-between mb-6 px-2">
                <button
                    onClick={handlePrevWeek}
                    className="w-10 h-10 flex items-center justify-center bg-white/[0.05] rounded-xl hover:bg-white/[0.1] transition-all"
                >
                    <ChevronLeft className="h-5 w-5 text-gray-400" />
                </button>

                <div className="text-center">
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-1">
                        {format(weekStart, 'MMMM yyyy')}
                    </h3>
                    <div className="text-lg font-bold text-white tracking-tight">
                        Week {format(weekStart, 'I')}
                    </div>
                </div>

                <button
                    onClick={handleNextWeek}
                    className="w-10 h-10 flex items-center justify-center bg-white/[0.05] rounded-xl hover:bg-white/[0.1] transition-all"
                >
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-2">
                {days.map((day) => {
                    const active = isSameDay(day, selectedDate)
                    const current = isToday(day)
                    const training = hasTrainingOnDay(day)

                    return (
                        <button
                            key={day.toString()}
                            onClick={() => onDateSelect(day)}
                            className={cn(
                                "flex flex-col items-center gap-2 py-4 rounded-2xl transition-all relative group",
                                active
                                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                                    : "bg-white/[0.03] hover:bg-white/[0.08] text-gray-400"
                            )}
                        >
                            <span className={cn(
                                "text-[10px] font-black uppercase tracking-tighter",
                                active ? "text-white/70" : "text-gray-500"
                            )}>
                                {format(day, 'EEE')}
                            </span>
                            <span className="text-base font-bold tabular-nums">
                                {format(day, 'd')}
                            </span>

                            {training && (
                                <div className={cn(
                                    "absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#0a0a0b] shadow-sm animate-in zoom-in-50 duration-300",
                                    active ? "bg-white text-blue-500" : "bg-blue-500 text-white"
                                )}>
                                    <Dumbbell className="h-2.5 w-2.5" />
                                </div>
                            )}

                            {current && !active && (
                                <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-blue-500" />
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

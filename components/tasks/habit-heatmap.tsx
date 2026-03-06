'use client'

import { cn } from '@/lib/utils'
import {
    format,
    startOfWeek,
    subWeeks,
    eachDayOfInterval,
    isSameDay,
    isAfter,
    startOfDay
} from 'date-fns'

interface HabitHeatmapProps {
    completions: string[] // Array of YYYY-MM-DD
    color: string
}

export function HabitHeatmap({ completions, color }: HabitHeatmapProps) {
    const today = startOfDay(new Date())
    const weeksToShow = 15
    const startDate = startOfWeek(subWeeks(today, weeksToShow - 1), { weekStartsOn: 1 })

    // Generate days for the grid
    const days = eachDayOfInterval({
        start: startDate,
        end: today
    })

    // Group days by week (7 days per column)
    const weeks: Date[][] = []
    for (let i = 0; i < days.length; i += 7) {
        weeks.push(days.slice(i, i + 7))
    }

    return (
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-6 overflow-hidden">
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-2">
                {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-1.5">
                        {week.map((day) => {
                            const dateStr = format(day, 'yyyy-MM-dd')
                            const isDone = completions.includes(dateStr)
                            const isFuture = isAfter(day, today)
                            const isToday = isSameDay(day, today)

                            return (
                                <div
                                    key={dateStr}
                                    title={dateStr}
                                    className={cn(
                                        "w-3.5 h-3.5 rounded-sm transition-all duration-500",
                                        isDone
                                            ? "shadow-[0_0_8px_rgba(255,255,255,0.1)]"
                                            : "bg-white/[0.05]",
                                        isToday && !isDone && "border border-white/20",
                                        isFuture && "opacity-0"
                                    )}
                                    style={{
                                        backgroundColor: isDone ? color : undefined,
                                        opacity: isFuture ? 0 : isDone ? 1 : undefined
                                    }}
                                />
                            )
                        })}
                    </div>
                ))}
            </div>
            <div className="mt-4 flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">
                <span>{format(startDate, 'MMM d')}</span>
                <span className="text-emerald-500/50">Consistency Grid</span>
                <span>Today</span>
            </div>
        </div>
    )
}

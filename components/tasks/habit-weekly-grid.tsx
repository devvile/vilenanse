'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
    format,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    addWeeks,
    subWeeks,
    isSameDay,
    isAfter,
    startOfDay,
    parseISO
} from 'date-fns'
import { ChevronLeft, ChevronRight, Check, Trophy, Flame } from 'lucide-react'
import { Habit, HabitCompletion, toggleHabitCompletion, getHabitStreaks } from '@/lib/habits'

interface HabitWeeklyGridProps {
    habits: Habit[]
    completions: HabitCompletion[]
    onRefresh: () => void
}

export function HabitWeeklyGrid({ habits, completions, onRefresh }: HabitWeeklyGridProps) {
    const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))
    const [streaks, setStreaks] = useState<Record<string, { current: number; longest: number }>>({})

    const today = startOfDay(new Date())
    const weekStart = currentWeekStart
    const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 })
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

    useEffect(() => {
        const fetchStreaks = async () => {
            const results: Record<string, { current: number; longest: number }> = {}
            for (const habit of habits) {
                results[habit.id] = await getHabitStreaks(habit.id)
            }
            setStreaks(results)
        }
        fetchStreaks()
    }, [habits, completions])

    const handlePrevWeek = () => {
        setCurrentWeekStart(subWeeks(currentWeekStart, 1))
    }

    const handleNextWeek = () => {
        const nextWeek = addWeeks(currentWeekStart, 1)
        if (!isAfter(nextWeek, startOfWeek(new Date(), { weekStartsOn: 1 }))) {
            setCurrentWeekStart(nextWeek)
        }
    }

    const isCompleted = (habitId: string, day: Date) => {
        const dayStr = format(day, 'yyyy-MM-dd')
        return completions.some(c => c.habit_id === habitId && c.completed_at === dayStr)
    }

    const handleToggle = async (habitId: string, day: Date) => {
        // Retroactive check-ins not allowed
        if (!isSameDay(day, today)) return

        try {
            await toggleHabitCompletion(habitId, format(day, 'yyyy-MM-dd'))
            onRefresh()
        } catch (error) {
            console.error(error)
        }
    }

    const activeHabits = habits.filter(h => !h.is_archived)

    return (
        <Card className="bg-card border-white/[0.08] overflow-hidden">
            <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Check className="h-5 w-5 text-emerald-500" />
                            Weekly Analysis
                        </h2>
                        <div className="px-3 py-1 bg-white/[0.05] rounded-full text-[10px] font-black uppercase tracking-widest text-text-secondary">
                            {format(weekStart, 'MMM d')} – {format(weekEnd, 'MMM d')}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-background/50 rounded-xl p-1 border border-white/[0.05]">
                        <button
                            onClick={handlePrevWeek}
                            className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-text-secondary hover:text-white"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
                            className="px-3 py-1 text-[10px] font-bold uppercase tracking-tight hover:text-emerald-400 transition-colors"
                        >
                            Today
                        </button>
                        <button
                            onClick={handleNextWeek}
                            disabled={isSameDay(weekStart, startOfWeek(new Date(), { weekStartsOn: 1 }))}
                            className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-text-secondary hover:text-white disabled:opacity-20"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/[0.05]">
                                <th className="py-4 text-left font-black text-[10px] text-gray-500 uppercase tracking-widest min-w-[140px]">Habit</th>
                                {days.map(day => {
                                    const isToday = isSameDay(day, today)
                                    return (
                                        <th key={day.toString()} className="py-4 px-2 min-w-[48px]">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className={cn(
                                                    "text-[10px] font-black uppercase tracking-widest",
                                                    isToday ? "text-emerald-400" : "text-gray-500"
                                                )}>
                                                    {format(day, 'EEE')}
                                                </span>
                                                <span className={cn(
                                                    "w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold",
                                                    isToday ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" : "text-white"
                                                )}>
                                                    {format(day, 'd')}
                                                </span>
                                            </div>
                                        </th>
                                    )
                                })}
                                <th className="py-4 px-4 text-center font-black text-[10px] text-gray-500 uppercase tracking-widest min-w-[80px]">Streak</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                            {activeHabits.map(habit => (
                                <tr key={habit.id} className="group hover:bg-white/[0.01] transition-colors">
                                    <td className="py-4 pr-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">{habit.emoji}</span>
                                            <span className="text-sm font-bold text-white whitespace-nowrap">{habit.name}</span>
                                        </div>
                                    </td>
                                    {days.map(day => {
                                        const done = isCompleted(habit.id, day)
                                        const isToday = isSameDay(day, today)
                                        const isPast = !isToday && !isAfter(day, today)

                                        return (
                                            <td key={day.toString()} className="py-4 px-2 text-center">
                                                <button
                                                    disabled={!isToday}
                                                    onClick={() => handleToggle(habit.id, day)}
                                                    className={cn(
                                                        "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                                                        done
                                                            ? "shadow-lg"
                                                            : isToday
                                                                ? "bg-white/[0.05] hover:bg-white/[0.1] border border-white/10"
                                                                : "bg-white/[0.02] border border-transparent",
                                                        !isToday && "cursor-default"
                                                    )}
                                                    style={{
                                                        backgroundColor: done ? habit.color : undefined,
                                                        boxShadow: done ? `0 4px 12px ${habit.color}40` : undefined
                                                    }}
                                                >
                                                    {done && <Check className="h-4 w-4 text-white" />}
                                                </button>
                                            </td>
                                        )
                                    })}
                                    <td className="py-4 px-4">
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="flex items-center gap-1.5 text-orange-400">
                                                <Flame className="h-3.5 w-3.5 fill-current" />
                                                <span className="text-sm font-black">{streaks[habit.id]?.current || 0}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-[8px] font-bold text-gray-500 uppercase tracking-tighter">
                                                <Trophy className="h-2 w-2" />
                                                Best {streaks[habit.id]?.longest || 0}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Card>
    )
}

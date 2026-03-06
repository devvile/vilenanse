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
    const [optimisticCompletions, setOptimisticCompletions] = useState<Record<string, boolean>>({})

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

    useEffect(() => {
        const todayStr = format(today, 'yyyy-MM-dd')
        const current = completions
            .filter(c => c.completed_at === todayStr)
            .reduce((acc, c) => ({ ...acc, [c.habit_id]: true }), {})
        setOptimisticCompletions(current)
    }, [completions])

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
        const isToday = isSameDay(day, today)

        if (isToday) {
            return !!optimisticCompletions[habitId]
        }
        return completions.some(c => c.habit_id === habitId && c.completed_at === dayStr)
    }

    const handleToggle = async (habitId: string, day: Date) => {
        // Retroactive check-ins not allowed
        if (!isSameDay(day, today)) return

        // Optimistic update
        setOptimisticCompletions(prev => ({
            ...prev,
            [habitId]: !prev[habitId]
        }))

        try {
            await toggleHabitCompletion(habitId, format(day, 'yyyy-MM-dd'))
            onRefresh()
        } catch (error) {
            console.error(error)
            // Revert optimistic update on error
            setOptimisticCompletions(prev => ({
                ...prev,
                [habitId]: !prev[habitId]
            }))
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
                                <th className="py-4 text-left font-black text-[10px] text-gray-500 uppercase tracking-widest min-w-[48px] pl-4">Habit</th>
                                {days.map(day => {
                                    const isToday = isSameDay(day, today)
                                    return (
                                        <th key={day.toString()} className="py-4 px-1 min-w-[40px] text-center">
                                            <div className="flex flex-col items-center justify-center gap-1 mx-auto">
                                                <span className={cn(
                                                    "text-[9px] font-black uppercase tracking-tight",
                                                    isToday ? "text-emerald-400" : "text-gray-500"
                                                )}>
                                                    {format(day, 'EEEEEE')}
                                                </span>
                                                <span className={cn(
                                                    "w-7 h-7 flex items-center justify-center rounded-full text-[11px] font-bold transition-all",
                                                    isToday ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" : "text-white hover:bg-white/5"
                                                )}>
                                                    {format(day, 'd')}
                                                </span>
                                            </div>
                                        </th>
                                    )
                                })}
                                <th className="py-4 px-2 text-center font-black text-[10px] text-gray-500 uppercase tracking-widest min-w-[50px]">Streak</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                            {activeHabits.map(habit => (
                                <tr key={habit.id} className="group hover:bg-white/[0.01] transition-colors">
                                    <td className="py-4 pl-4 pr-2">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-xl" style={{ backgroundColor: `${habit.color}15` }}>
                                            <span className="text-lg leading-none">{habit.emoji}</span>
                                        </div>
                                    </td>
                                    {days.map(day => {
                                        const done = isCompleted(habit.id, day)
                                        const isToday = isSameDay(day, today)

                                        return (
                                            <td key={day.toString()} className="py-4 px-2">
                                                <div className="flex justify-center">
                                                    <button
                                                        disabled={!isToday}
                                                        onClick={() => handleToggle(habit.id, day)}
                                                        className={cn(
                                                            "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                                                            done
                                                                ? "shadow-lg"
                                                                : isToday
                                                                    ? "bg-white/[0.05] hover:bg-white/[0.1] border border-white/10"
                                                                    : "bg-white/[0.02] border border-transparent",
                                                            !isToday && "cursor-default opacity-40"
                                                        )}
                                                        style={{
                                                            backgroundColor: done ? habit.color : undefined,
                                                            boxShadow: done ? `0 4px 12px ${habit.color}40` : undefined
                                                        }}
                                                    >
                                                        {done && <Check className="h-4 w-4 text-white" />}
                                                    </button>
                                                </div>
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

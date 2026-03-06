'use client'

import { cn } from '@/lib/utils'
import { Flame, Check, Trophy } from 'lucide-react'
import { Habit, HabitCompletion, toggleHabitCompletion, getHabitStreaks } from '@/lib/habits'
import { useEffect, useState, useCallback } from 'react'
import { isSameDay, format, isAfter, startOfDay } from 'date-fns'

interface HabitDailyListProps {
    habits: Habit[]
    completions: HabitCompletion[]
    selectedDate: Date
    onRefresh: () => void
}

export function HabitDailyList({ habits, completions, selectedDate, onRefresh }: HabitDailyListProps) {
    const [streaks, setStreaks] = useState<Record<string, { current: number; longest: number }>>({})
    const [optimisticCompletions, setOptimisticCompletions] = useState<string[]>([])

    const today = startOfDay(new Date())
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    const isSelectedToday = isSameDay(selectedDate, today)

    // Sync optimistic state with props when they change (e.g. after refresh or page load)
    useEffect(() => {
        setOptimisticCompletions(
            completions
                .filter(c => c.completed_at === dateStr)
                .map(c => c.habit_id)
        )
    }, [completions, dateStr])

    const fetchStreaks = useCallback(async () => {
        const results: Record<string, { current: number; longest: number }> = {}
        for (const habit of habits) {
            results[habit.id] = await getHabitStreaks(habit.id)
        }
        setStreaks(results)
    }, [habits])

    useEffect(() => {
        fetchStreaks()
    }, [fetchStreaks])

    const handleToggle = async (habitId: string) => {
        if (!isSelectedToday) return

        // Optimistic update
        const isCurrentlyDone = optimisticCompletions.includes(habitId)
        setOptimisticCompletions(prev =>
            isCurrentlyDone
                ? prev.filter(id => id !== habitId)
                : [...prev, habitId]
        )

        try {
            await toggleHabitCompletion(habitId, dateStr)
            // Still refresh to get official state and updated streaks
            onRefresh()
        } catch (error) {
            console.error(error)
            // Revert on error
            setOptimisticCompletions(prev =>
                isCurrentlyDone
                    ? [...prev, habitId]
                    : prev.filter(id => id !== habitId)
            )
        }
    }

    const activeHabits = habits.filter(h => !h.is_archived)

    return (
        <div className="space-y-4">
            {activeHabits.map((habit) => {
                const isDone = optimisticCompletions.includes(habit.id)
                const streak = streaks[habit.id]

                return (
                    <button
                        key={habit.id}
                        onClick={() => handleToggle(habit.id)}
                        disabled={!isSelectedToday}
                        className={cn(
                            "w-full flex items-center justify-between p-4 rounded-[2.5rem] transition-all border outline-none group",
                            isDone
                                ? "border-transparent shadow-lg"
                                : "bg-white/[0.03] border-white/[0.05] hover:bg-white/[0.06] active:scale-[0.98]",
                            !isSelectedToday && "cursor-default opacity-80"
                        )}
                        style={{
                            backgroundColor: isDone ? habit.color : undefined,
                            boxShadow: isDone ? `0 10px 30px ${habit.color}30` : undefined,
                            borderColor: isDone ? 'transparent' : undefined
                        }}
                    >
                        <div className="flex items-center gap-5">
                            <div className={cn(
                                "w-14 h-14 flex items-center justify-center rounded-[1.5rem] text-3xl transition-transform",
                                isDone ? "bg-black/10 scale-95" : "bg-white/[0.05]"
                            )}>
                                {habit.emoji}
                            </div>
                            <div className="text-left">
                                <h3 className={cn(
                                    "text-lg font-bold tracking-tight",
                                    isDone ? "text-black" : "text-white"
                                )}>
                                    {habit.name}
                                </h3>
                                <div className={cn(
                                    "text-xs font-black uppercase tracking-widest mt-0.5",
                                    isDone ? "text-black/60" : "text-gray-500"
                                )}>
                                    {isDone ? '1 / 1' : '0 / 1'}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 pr-2">
                            {streak && streak.current > 0 && (
                                <div className={cn(
                                    "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors",
                                    isDone ? "bg-black/10 text-black" : "bg-orange-500/10 text-orange-400"
                                )}>
                                    <Flame className={cn("h-3 w-3", isDone ? "fill-black" : "fill-orange-400")} />
                                    {streak.current} {streak.current === 1 ? 'Day' : 'Days'}
                                </div>
                            )}
                            {isDone && (
                                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-black/10">
                                    <Check className="h-5 w-5 text-black stroke-[3]" />
                                </div>
                            )}
                        </div>
                    </button>
                )
            })}

            {activeHabits.length === 0 && (
                <div className="text-center py-20 bg-white/[0.02] border border-dashed border-white/[0.1] rounded-[2.5rem]">
                    <p className="text-text-secondary font-medium italic">No habits for today. Go manage them below!</p>
                </div>
            )}
        </div>
    )
}

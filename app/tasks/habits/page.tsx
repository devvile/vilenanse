'use client'

import { useState, useEffect, useCallback } from 'react'
import { CheckSquare, Calendar, Plus, Settings2, Target } from 'lucide-react'
import { getHabits, getHabitCompletions, Habit, HabitCompletion } from '@/lib/habits'
import { HabitWeeklyGrid } from '@/components/tasks/habit-weekly-grid'
import { HabitManager } from '@/components/tasks/habit-manager'
import { format, startOfWeek, endOfWeek } from 'date-fns'

export default function HabitsPage() {
    const [habits, setHabits] = useState<Habit[]>([])
    const [completions, setCompletions] = useState<HabitCompletion[]>([])
    const [loading, setLoading] = useState(true)
    const [showManager, setShowManager] = useState(false)

    const fetchData = useCallback(async () => {
        try {
            // Fetch habits and completions for current week range
            const h = await getHabits()
            setHabits(h)

            const start = startOfWeek(new Date(), { weekStartsOn: 1 })
            const end = endOfWeek(new Date(), { weekStartsOn: 1 })
            const c = await getHabitCompletions(format(start, 'yyyy-MM-dd'), format(end, 'yyyy-MM-dd'))
            setCompletions(c)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    if (loading) {
        return (
            <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto pt-24 space-y-6 animate-pulse">
                <div className="h-64 bg-white/[0.05] rounded-3xl" />
                <div className="h-96 bg-white/[0.05] rounded-3xl" />
            </div>
        )
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto pt-24 pb-20 space-y-8 min-h-screen">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        <Target className="h-8 w-8 text-emerald-500" />
                        Habits Tracker
                    </h1>
                    <p className="text-text-secondary font-medium mt-1">Aim for consistency, achieve excellence.</p>
                </div>

                <button
                    onClick={() => setShowManager(!showManager)}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-white/[0.05] hover:bg-white/[0.08] text-white font-bold rounded-2xl transition-all border border-white/[0.08] hover:border-white/[0.2] shadow-xl"
                >
                    {showManager ? (
                        <>
                            <Calendar className="h-4 w-4" />
                            Show Grid
                        </>
                    ) : (
                        <>
                            <Settings2 className="h-4 w-4" />
                            Manage Habits
                        </>
                    )}
                </button>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {showManager ? (
                    <HabitManager habits={habits} onRefresh={fetchData} />
                ) : (
                    <HabitWeeklyGrid habits={habits} completions={completions} onRefresh={fetchData} />
                )}
            </div>

            {!showManager && habits.filter(h => !h.is_archived).length === 0 && (
                <div className="text-center py-20 bg-white/[0.02] border border-dashed border-white/[0.1] rounded-3xl animate-in fade-in duration-500">
                    <CheckSquare className="h-12 w-12 text-gray-600 mx-auto mb-4 opacity-20" />
                    <h2 className="text-xl font-bold text-white mb-2">Build Your Routine</h2>
                    <p className="text-text-secondary max-w-md mx-auto mb-8">
                        Start by adding habits you want to track daily. You can track up to 5 habits at a time.
                    </p>
                    <button
                        onClick={() => setShowManager(true)}
                        className="px-8 py-3 bg-emerald-500 text-black font-black rounded-2xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
                    >
                        Add Your First Habit
                    </button>
                </div>
            )}
        </div>
    )
}

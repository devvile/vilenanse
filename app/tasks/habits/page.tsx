'use client'

import { useState, useEffect, useCallback } from 'react'
import { CheckSquare, Calendar, Plus, Settings2, Target } from 'lucide-react'
import { getHabits, getHabitCompletions, Habit, HabitCompletion } from '@/lib/habits'
import { HabitWeeklyGrid } from '@/components/tasks/habit-weekly-grid'
import { HabitManager } from '@/components/tasks/habit-manager'
import { HabitDailyList } from '@/components/tasks/habit-daily-list'
import { HabitHorizontalPicker } from '@/components/tasks/habit-horizontal-picker'
import { HabitDetailsView } from '@/components/tasks/habit-details-view'
import { format, startOfWeek, endOfWeek, startOfDay } from 'date-fns'

export default function HabitsPage() {
    const [habits, setHabits] = useState<Habit[]>([])
    const [completions, setCompletions] = useState<HabitCompletion[]>([])
    const [loading, setLoading] = useState(true)
    const [showManager, setShowManager] = useState(false)
    const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null)
    const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()))

    const fetchData = useCallback(async () => {
        try {
            const h = await getHabits()
            setHabits(h)

            const start = startOfWeek(selectedDate, { weekStartsOn: 1 })
            const end = endOfWeek(selectedDate, { weekStartsOn: 1 })
            const c = await getHabitCompletions(format(start, 'yyyy-MM-dd'), format(end, 'yyyy-MM-dd'))
            setCompletions(c)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }, [selectedDate])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    if (loading) {
        return (
            <div className="p-4 sm:p-6 lg:p-8 max-w-lg md:max-w-2xl lg:max-w-5xl mx-auto pt-24 space-y-6 animate-pulse">
                <div className="h-20 bg-white/[0.05] rounded-[2.5rem]" />
                <div className="h-64 bg-white/[0.05] rounded-[2.5rem]" />
                <div className="h-64 bg-white/[0.05] rounded-[2.5rem]" />
            </div>
        )
    }

    if (selectedHabitId) {
        return (
            <div className="p-4 sm:p-6 lg:p-8 max-w-lg md:max-w-2xl lg:max-w-5xl mx-auto pt-24 pb-20 min-h-screen">
                <HabitDetailsView
                    habits={habits}
                    activeHabitId={selectedHabitId}
                    onBack={() => setSelectedHabitId(null)}
                    onHabitChange={setSelectedHabitId}
                    onRefresh={fetchData}
                    onCreateHabit={() => {
                        setSelectedHabitId(null)
                        setShowManager(true)
                    }}
                />
            </div>
        )
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-lg md:max-w-2xl lg:max-w-5xl mx-auto pt-24 pb-20 space-y-10 min-h-screen">
            {/* Header Area */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-text-secondary">
                        {format(selectedDate, 'eeee')}
                    </h2>
                    <h1 className="text-4xl font-black text-white tracking-tighter mt-1">
                        Today
                    </h1>
                </div>

                <button
                    onClick={() => setShowManager(!showManager)}
                    className="w-12 h-12 flex items-center justify-center bg-white/[0.05] border border-white/[0.08] hover:border-white/[0.2] rounded-2xl text-white transition-all"
                >
                    <Settings2 className="h-5 w-5" />
                </button>
            </div>

            {showManager ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <HabitManager
                        habits={habits}
                        onRefresh={fetchData}
                        onViewDetails={setSelectedHabitId}
                    />
                    <button
                        onClick={() => setShowManager(false)}
                        className="w-full mt-8 py-4 bg-white/[0.05] text-white font-black uppercase tracking-widest text-[10px] rounded-[1.5rem] hover:bg-white/[0.08] transition-all"
                    >
                        Back to Tracking
                    </button>
                </div>
            ) : (
                <>
                    {/* Horizontal Week Picker */}
                    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                        <HabitHorizontalPicker
                            selectedDate={selectedDate}
                            onDateSelect={setSelectedDate}
                        />
                    </div>

                    {/* Daily Progress List */}
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
                        <HabitDailyList
                            habits={habits}
                            completions={completions}
                            selectedDate={selectedDate}
                            onRefresh={fetchData}
                        />
                    </div>

                    {/* Weekly Analysis */}
                    <div className="pt-10">
                        <HabitWeeklyGrid habits={habits} completions={completions} onRefresh={fetchData} />
                    </div>
                </>
            )}

            {!showManager && habits.filter(h => !h.is_archived).length === 0 && (
                <div className="text-center py-20 bg-white/[0.02] border border-dashed border-white/[0.1] rounded-[3rem] animate-in fade-in duration-700">
                    <Target className="h-10 w-10 text-gray-600 mx-auto mb-4 opacity-20" />
                    <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Focus Protocol</h2>
                    <p className="text-text-secondary text-sm px-8 leading-relaxed mb-8">
                        The journey to excellence starts with a single habit. Define yours now.
                    </p>
                    <button
                        onClick={() => setShowManager(true)}
                        className="px-8 py-4 bg-emerald-500 text-black font-black uppercase tracking-widest text-[10px] rounded-[1.5rem] hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20"
                    >
                        Initialize Habits
                    </button>
                </div>
            )}
        </div>
    )
}

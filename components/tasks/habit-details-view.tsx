'use client'

import { useState, useEffect, useCallback } from 'react'
import {
    ChevronLeft,
    Plus,
    MoreHorizontal,
    Calendar,
    Target,
    Flame,
    Trophy,
    BarChart3,
    Activity,
    PieChart,
    Archive,
    Trash2,
    ChevronDown,
    Settings2,
    Loader2
} from 'lucide-react'
import {
    Habit,
    HabitCompletion,
    getHabitCompletionsForHabit,
    getHabitStreaks,
    updateHabit,
    deleteHabit
} from '@/lib/habits'
import { cn } from '@/lib/utils'
import { format, startOfMonth, endOfMonth, differenceInDays, parseISO } from 'date-fns'
import { HabitHeatmap } from './habit-heatmap'
import { HabitMetricCard } from './habit-metrics'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface HabitDetailsViewProps {
    habits: Habit[]
    activeHabitId: string
    onBack: () => void
    onHabitChange: (id: string) => void
    onRefresh: () => void
    onCreateHabit: () => void
}

export function HabitDetailsView({
    habits,
    activeHabitId,
    onBack,
    onHabitChange,
    onRefresh,
    onCreateHabit
}: HabitDetailsViewProps) {
    const [completions, setCompletions] = useState<HabitCompletion[]>([])
    const [streaks, setStreaks] = useState({ current: 0, longest: 0 })
    const [loading, setLoading] = useState(true)

    const habit = habits.find(h => h.id === activeHabitId)
    const activeHabits = habits.filter(h => !h.is_archived)

    const fetchDetails = useCallback(async () => {
        if (!activeHabitId) return
        setLoading(true)
        try {
            const [c, s] = await Promise.all([
                getHabitCompletionsForHabit(activeHabitId),
                getHabitStreaks(activeHabitId)
            ])
            setCompletions(c)
            setStreaks(s)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }, [activeHabitId])

    useEffect(() => {
        fetchDetails()
    }, [fetchDetails])

    if (!habit) return null

    // Calculations
    const totalCompletions = completions.length
    const now = new Date()
    const startOfCurrentMonth = startOfMonth(now)
    const completionsThisMonth = completions.filter(c =>
        new Date(c.completed_at) >= startOfCurrentMonth
    ).length

    const daysSinceCreated = differenceInDays(now, parseISO(habit.created_at)) + 1
    const overallRate = daysSinceCreated > 0
        ? (totalCompletions / daysSinceCreated) * 100
        : 0
    const dailyAvg = daysSinceCreated > 0
        ? (totalCompletions / daysSinceCreated).toFixed(2)
        : "0.00"

    const handleArchive = async () => {
        try {
            await updateHabit(habit.id, { is_archived: true })
            onRefresh()
            onBack()
        } catch (error) {
            console.error(error)
        }
    }

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to permanently delete this habit and all its history?')) return
        try {
            await deleteHabit(habit.id)
            onRefresh()
            onBack()
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Top Navigation */}
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={onBack}
                    className="w-12 h-12 flex items-center justify-center bg-white/[0.05] rounded-2xl hover:bg-white/[0.1] transition-all"
                >
                    <ChevronLeft className="h-6 w-6 text-white" />
                </button>

                <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-3 px-6 py-3 bg-white/[0.05] rounded-[2rem] outline-none hover:bg-white/[0.1] transition-all border border-white/5">
                        <span className="text-2xl leading-none">{habit.emoji}</span>
                        <span className="text-lg font-black text-white tracking-tight">{habit.name}</span>
                        <ChevronDown className="h-5 w-5 text-gray-500 ml-1" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-[#1a1a1f] border-white/[0.08] text-white rounded-3xl w-64 p-2 shadow-2xl">
                        {activeHabits.map(h => (
                            <DropdownMenuItem
                                key={h.id}
                                onClick={() => onHabitChange(h.id)}
                                className="flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-white/[0.05] cursor-pointer"
                            >
                                <span className="text-2xl">{h.emoji}</span>
                                <span className="font-bold text-base">{h.name}</span>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                <button
                    onClick={onCreateHabit}
                    className="w-12 h-12 flex items-center justify-center bg-emerald-500 rounded-2xl hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 active:scale-90"
                >
                    <Plus className="h-6 w-6 text-black stroke-[3]" />
                </button>
            </div>

            {/* Horizontal Icons Row */}
            <div className="flex items-center justify-center gap-4 mb-10 overflow-x-auto no-scrollbar pb-2">
                {activeHabits.map(h => (
                    <button
                        key={h.id}
                        onClick={() => onHabitChange(h.id)}
                        className={cn(
                            "w-12 h-12 flex items-center justify-center rounded-2xl transition-all shrink-0",
                            h.id === activeHabitId
                                ? "bg-white/[0.1] scale-110 shadow-lg border border-white/10"
                                : "opacity-40 hover:opacity-100 hover:bg-white/[0.05]"
                        )}
                    >
                        <span className="text-2xl">{h.emoji}</span>
                    </button>
                ))}
            </div>

            {/* Contribution Grid */}
            <div className="mb-10">
                {loading ? (
                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-6 h-[178px] flex flex-col items-center justify-center gap-4">
                        <Loader2 className="h-8 w-8 text-emerald-500 animate-spin opacity-50" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 animate-pulse">
                            Loading Analysis...
                        </span>
                    </div>
                ) : (
                    <HabitHeatmap
                        completions={completions.map(c => c.completed_at)}
                        color={habit.color}
                    />
                )}
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4 mb-10">
                <HabitMetricCard
                    icon={Calendar}
                    iconColor={habit.color}
                    value={completionsThisMonth}
                    label="Days"
                    sublabel={`success in ${format(now, 'MMMM')}`}
                />
                <HabitMetricCard
                    icon={Target}
                    iconColor="#10b981"
                    value={totalCompletions}
                    label="Days"
                    sublabel="Total Success"
                />
                <HabitMetricCard
                    icon={Flame}
                    iconColor="#f97316"
                    value={streaks.current}
                    label="Days"
                    sublabel="Current Streak"
                />
                <HabitMetricCard
                    icon={Trophy}
                    iconColor="#eab308"
                    value={streaks.longest}
                    label="Days"
                    sublabel="Best Streak"
                />
                <HabitMetricCard
                    icon={Activity}
                    iconColor={habit.color}
                    value={completionsThisMonth}
                    label=""
                    sublabel={`Vol. in ${format(now, 'MMM')}`}
                />
                <HabitMetricCard
                    icon={BarChart3}
                    iconColor="#818cf8"
                    value={totalCompletions}
                    label=""
                    sublabel="Vol. Total"
                />
                <HabitMetricCard
                    icon={PieChart}
                    iconColor="#f472b6"
                    value={dailyAvg}
                    label=""
                    sublabel="Daily Avg."
                />
                <HabitMetricCard
                    icon={Activity}
                    iconColor="#2dd4bf"
                    value={`${overallRate.toFixed(2)}%`}
                    label=""
                    sublabel="Overall Rate"
                />
            </div>

            {/* Actions / Danger Zone */}
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-[2.5rem] p-8 space-y-4">
                <div className="flex items-center gap-3 mb-4">
                    <Settings2 className="h-5 w-5 text-gray-500" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Habit Management</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                        onClick={handleArchive}
                        className="flex items-center justify-center gap-3 py-4 px-6 bg-white/[0.03] border border-white/5 rounded-[1.5rem] hover:bg-white/5 hover:border-white/10 transition-all text-sm font-bold text-white group"
                    >
                        <Archive className="h-4 w-4 text-gray-500 group-hover:text-amber-500 transition-colors" />
                        Archive Habit
                    </button>
                    <button
                        onClick={handleDelete}
                        className="flex items-center justify-center gap-3 py-4 px-6 bg-red-500/5 border border-red-500/10 rounded-[1.5rem] hover:bg-red-500/10 hover:border-red-500/20 transition-all text-sm font-bold text-red-500"
                    >
                        <Trash2 className="h-4 w-4" />
                        Permanently Delete
                    </button>
                </div>
            </div>
        </div>
    )
}

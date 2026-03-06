'use client'

import { useState } from 'react'
import { Plus, X, Palette, Smile, Trash2, Archive, Check } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { addHabit, updateHabit, deleteHabit, Habit } from '@/lib/habits'

const COLORS = [
    { name: 'Emerald', value: '#10b981' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Rose', value: '#f43f5e' },
    { name: 'Indigo', value: '#6366f1' },
]

const EMOJIS = ['🚀', '💪', '💧', '🥗', '🧘', '📚', '🏃', '💤', '🧠', '✨']

interface HabitManagerProps {
    habits: Habit[]
    onRefresh: () => void
}

export function HabitManager({ habits, onRefresh }: HabitManagerProps) {
    const [isAdding, setIsAdding] = useState(false)
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
    const [name, setName] = useState('')
    const [emoji, setEmoji] = useState(EMOJIS[0])
    const [color, setColor] = useState(COLORS[0].value)
    const [loading, setLoading] = useState(false)

    const activeHabits = habits.filter(h => !h.is_archived)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name || loading) return

        setLoading(true)
        try {
            if (editingHabit) {
                await updateHabit(editingHabit.id, { name, emoji, color })
            } else {
                await addHabit({ name, emoji, color })
            }
            resetForm()
            onRefresh()
        } catch (error) {
            console.error(error)
            alert(error instanceof Error ? error.message : 'Failed to save habit')
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setName('')
        setEmoji(EMOJIS[0])
        setColor(COLORS[0].value)
        setIsAdding(false)
        setEditingHabit(null)
    }

    const handleEdit = (habit: Habit) => {
        setEditingHabit(habit)
        setName(habit.name)
        setEmoji(habit.emoji)
        setColor(habit.color)
        setIsAdding(true)
    }

    const handleArchive = async (habit: Habit) => {
        if (!confirm('Archive this habit? It will be hidden from daily tracking but historical data will be preserved.')) return
        await updateHabit(habit.id, { is_archived: true })
        onRefresh()
    }

    const handleDelete = async (habit: Habit) => {
        if (!confirm('Delete this habit and ALL its history? This cannot be undone.')) return
        await deleteHabit(habit.id)
        onRefresh()
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Smile className="h-5 w-5 text-emerald-500" />
                    My Habits
                    <span className="text-xs font-medium text-text-secondary ml-2 bg-white/[0.05] px-2 py-0.5 rounded-full">
                        {activeHabits.length}/5
                    </span>
                </h2>
                {!isAdding && activeHabits.length < 5 && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-xl text-xs font-bold transition-all"
                    >
                        <Plus className="h-4 w-4" />
                        Add Habit
                    </button>
                )}
            </div>

            {isAdding && (
                <Card className="p-6 bg-[#1a1a24] border-white/[0.08] animate-in slide-in-from-top-4 duration-300">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary">
                                {editingHabit ? 'Edit Habit' : 'New Habit'}
                            </h3>
                            <button type="button" onClick={resetForm} className="text-gray-500 hover:text-white transition-colors">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary ml-1">Habit Name</label>
                                <input
                                    autoFocus
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="e.g. Drink Water"
                                    className="w-full bg-background border border-white/[0.1] rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500/50"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-text-secondary ml-1">Icon</label>
                                    <div className="flex flex-wrap gap-2">
                                        {EMOJIS.map(e => (
                                            <button
                                                key={e}
                                                type="button"
                                                onClick={() => setEmoji(e)}
                                                className={cn(
                                                    "w-10 h-10 flex items-center justify-center rounded-xl transition-all text-xl",
                                                    emoji === e ? "bg-emerald-500 scale-110 shadow-lg shadow-emerald-500/20" : "bg-white/[0.03] hover:bg-white/[0.08]"
                                                )}
                                            >
                                                {e}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-text-secondary ml-1">Color</label>
                                    <div className="flex flex-wrap gap-2">
                                        {COLORS.map(c => (
                                            <button
                                                key={c.value}
                                                type="button"
                                                onClick={() => setColor(c.value)}
                                                className={cn(
                                                    "w-10 h-10 rounded-xl transition-all border-2",
                                                    color === c.value ? "border-white scale-110" : "border-transparent opacity-60 hover:opacity-100"
                                                )}
                                                style={{ backgroundColor: c.value }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            disabled={loading || !name}
                            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                        >
                            {loading ? 'Saving...' : editingHabit ? 'Save Changes' : 'Create Habit'}
                        </button>
                    </form>
                </Card>
            )}

            <div className="grid gap-4">
                {activeHabits.map(habit => (
                    <div
                        key={habit.id}
                        className="group flex items-center justify-between p-4 bg-white/[0.02] hover:bg-white/[0.04] rounded-2xl border border-white/[0.05] transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div
                                className="w-12 h-12 flex items-center justify-center rounded-2xl text-2xl shadow-lg"
                                style={{ backgroundColor: `${habit.color}20`, color: habit.color }}
                            >
                                {habit.emoji}
                            </div>
                            <div>
                                <h4 className="font-bold text-white">{habit.name}</h4>
                                <p className="text-xs text-text-secondary">Daily Goal</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => handleEdit(habit)}
                                className="p-2 text-gray-500 hover:text-white transition-colors"
                            >
                                <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => handleArchive(habit)}
                                className="p-2 text-gray-500 hover:text-amber-500 transition-colors"
                                title="Archive"
                            >
                                <Archive className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => handleDelete(habit)}
                                className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                                title="Delete Forever"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}

                {activeHabits.length === 0 && !isAdding && (
                    <div className="text-center py-12 bg-white/[0.02] border border-dashed border-white/[0.1] rounded-3xl">
                        <p className="text-sm text-text-secondary">No active habits. Create one to start tracking!</p>
                    </div>
                )}
            </div>
        </div>
    )
}

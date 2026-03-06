'use client'

import { useState, useEffect } from 'react'
import { Training } from '@/lib/fitness'
import { X, Loader2, Dumbbell, Flame, AlignLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FitnessTrainingFormProps {
    training?: Training
    selectedDate: string // YYYY-MM-DD
    onSave: (data: Partial<Training>) => Promise<void>
    onCancel: () => void
}

export function FitnessTrainingForm({
    training,
    selectedDate,
    onSave,
    onCancel
}: FitnessTrainingFormProps) {
    const [name, setName] = useState(training?.name || '')
    const [calories, setCalories] = useState(training?.calories?.toString() || '')
    const [description, setDescription] = useState(training?.description || '')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name || !calories || loading) return

        setLoading(true)
        try {
            await onSave({
                name,
                calories: parseInt(calories),
                description: description || null,
                training_date: selectedDate
            })
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-[#0a0a0b] border border-white/10 rounded-[3rem] w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 flex items-center justify-center bg-blue-500/10 rounded-2xl text-blue-500">
                            <Dumbbell className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white tracking-tight">
                                {training ? 'Edit Training' : 'New Session'}
                            </h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                                {selectedDate}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onCancel}
                        className="w-10 h-10 flex items-center justify-center bg-white/[0.05] rounded-full text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Session Name</label>
                        <div className="relative">
                            <Dumbbell className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                            <input
                                autoFocus
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white font-bold outline-none focus:border-blue-500/50 transition-all"
                                placeholder="Running, Gym, Yoga..."
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Burnt Calories</label>
                        <div className="relative">
                            <Flame className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                            <input
                                type="number"
                                value={calories}
                                onChange={e => setCalories(e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white font-bold outline-none focus:border-blue-500/50 transition-all font-mono"
                                placeholder="0"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Intel (Optional)</label>
                        <div className="relative">
                            <AlignLeft className="absolute left-4 top-4 h-4 w-4 text-gray-600" />
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white font-bold outline-none focus:border-blue-500/50 transition-all min-h-[120px] resize-none"
                                placeholder="How was it? Any PRs?"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 py-4 bg-white/[0.05] text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-white/[0.1] transition-all"
                        >
                            Abort
                        </button>
                        <button
                            disabled={loading || !name || !calories}
                            className="flex-[2] py-4 bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                "Record Protocol"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

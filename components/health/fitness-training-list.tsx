'use client'

import { Training } from '@/lib/fitness'
import { Dumbbell, Flame, Edit2, Trash2, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface FitnessTrainingListProps {
    trainings: Training[]
    onEdit: (training: Training) => void
    onDelete: (id: string) => void
}

export function FitnessTrainingList({
    trainings,
    onEdit,
    onDelete
}: FitnessTrainingListProps) {
    if (trainings.length === 0) {
        return (
            <div className="text-center py-20 bg-white/[0.02] border border-dashed border-white/[0.1] rounded-[2.5rem]">
                <Dumbbell className="h-10 w-10 text-gray-600 mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-bold text-white mb-2 tracking-tight">No sessions recorded</h3>
                <p className="text-text-secondary text-sm px-8 leading-relaxed">
                    Every champion was once a contender who refused to give up. Start your session now.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {trainings.map((training) => (
                <div
                    key={training.id}
                    className="group bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.05] hover:border-white/[0.1] rounded-[2.5rem] p-6 transition-all"
                >
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 flex items-center justify-center bg-blue-500/10 rounded-[1.5rem] text-blue-500 shrink-0">
                                <Dumbbell className="h-8 w-8" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold text-white tracking-tight">{training.name}</h3>
                                {training.description && (
                                    <p className="text-sm text-gray-500 leading-relaxed font-medium">
                                        {training.description}
                                    </p>
                                )}
                                <div className="flex items-center gap-4 pt-2">
                                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-[10px] font-black uppercase tracking-widest">
                                        <Flame className="h-3 w-3 fill-orange-400" />
                                        {training.calories} kcal
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-600">
                                        <Clock className="h-3 w-3" />
                                        {format(new Date(training.created_at), 'HH:mm')}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => onEdit(training)}
                                className="w-10 h-10 flex items-center justify-center bg-white/[0.05] rounded-xl text-white hover:bg-blue-500 hover:text-white transition-all shadow-lg"
                            >
                                <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => onDelete(training.id)}
                                className="w-10 h-10 flex items-center justify-center bg-white/[0.05] rounded-xl text-white hover:bg-red-500 hover:text-white transition-all shadow-lg"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

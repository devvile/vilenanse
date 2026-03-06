'use client'

import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface HabitMetricCardProps {
    icon: LucideIcon
    iconColor: string
    value: string | number
    label: string
    sublabel: string
}

export function HabitMetricCard({ icon: Icon, iconColor, value, label, sublabel }: HabitMetricCardProps) {
    return (
        <div className="bg-white/[0.03] border border-white/[0.05] rounded-[2rem] p-6 flex flex-col gap-4">
            <div className={cn(
                "w-12 h-12 flex items-center justify-center rounded-2xl transition-all",
                "bg-white/[0.05]"
            )}>
                <Icon className="h-6 w-6" style={{ color: iconColor }} />
            </div>

            <div>
                <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-white tracking-tight">{value}</span>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{label}</span>
                </div>
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-1">
                    {sublabel}
                </p>
            </div>
        </div>
    )
}

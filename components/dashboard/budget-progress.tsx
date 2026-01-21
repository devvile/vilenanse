'use client'

import { Card } from '@/components/ui/card'

interface BudgetProgressProps {
  spent: number
  limit: number
}

export function BudgetProgress({ spent, limit }: BudgetProgressProps) {
  const percentage = Math.min((spent / limit) * 100, 100)
  const isOverBudget = spent > limit

  return (
    <Card className="p-6 bg-[#1a1a24] border-white/[0.08]">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-white">Monthly Budget</h3>
        <span className="text-sm text-gray-400">
           {percentage.toFixed(0)}% Used
        </span>
      </div>
      
      <div className="h-3 w-full bg-[#0d0d12] rounded-full overflow-hidden mb-2">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? 'bg-red-500' : 'bg-emerald-500'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="flex justify-between text-sm">
        <span className="text-white font-medium">{spent.toLocaleString()} PLN</span>
        <span className="text-gray-400">Limit: {limit.toLocaleString()} PLN</span>
      </div>
    </Card>
  )
}

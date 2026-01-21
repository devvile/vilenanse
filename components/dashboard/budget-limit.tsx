'use client'

import { Card } from '@/components/ui/card'

interface BudgetLimitProps {
  spent?: number
  limit?: number
}

export function BudgetLimit({ spent = 7456.78, limit = 9500.00 }: BudgetLimitProps) {
  const percentage = Math.min((spent / limit) * 100, 100)
  const remaining = limit - spent

  return (
    <Card className="p-6">
      <h3 className="text-base font-semibold text-white mb-4">Monthly Budget Limit</h3>
      
      {/* Progress bar */}
      <div className="mb-4">
        <div className="h-2 w-full rounded-full bg-white/[0.08]">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Labels */}
      <div className="flex items-center justify-between text-sm">
        <div>
          <span className="text-white font-medium">${spent.toLocaleString()}</span>
          <span className="text-gray-500 ml-1">Spend out of</span>
        </div>
        <span className="text-white font-medium">${limit.toLocaleString()}</span>
      </div>
    </Card>
  )
}

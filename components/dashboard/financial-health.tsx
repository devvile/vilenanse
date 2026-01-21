'use client'

import { Card } from '@/components/ui/card'
import { BarChart, Bar, ResponsiveContainer } from 'recharts'

interface FinancialHealthProps {
  amount?: number
  percentageChange?: number
  isPositive?: boolean
  data?: { value: number }[]
}

const defaultData = [
  { value: 30 }, { value: 45 }, { value: 25 }, { value: 60 }, 
  { value: 35 }, { value: 80 }, { value: 55 }, { value: 40 },
  { value: 70 }, { value: 45 }, { value: 55 }, { value: 35 },
  { value: 65 }, { value: 40 }, { value: 50 }, { value: 75 },
  { value: 30 }, { value: 60 }, { value: 45 }, { value: 55 },
]

export function FinancialHealth({ 
  amount = 374.84, 
  percentageChange = 24,
  isPositive = false,
  data = defaultData
}: FinancialHealthProps) {
  const formatted = Math.round(amount)

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Financial Health</h3>
      
      {/* Status Badge */}
      <div className="mb-4">
        <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
          On track
        </span>
      </div>

      {/* Amount */}
      <div className="mb-2">
        <span className="text-3xl font-bold text-white">{formatted.toLocaleString()}</span>
        <span className="text-sm font-medium text-gray-400 ml-1">PLN</span>
      </div>

      {/* Percentage change */}
      <div className="flex items-center gap-2 mb-6">
        <span className={`text-sm font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
          {isPositive ? '+' : '-'}{percentageChange}%
        </span>
        <span className="text-sm text-gray-500">For this last month</span>
      </div>

      {/* Bar Chart */}
      <div className="h-20">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={2}>
            <Bar 
              dataKey="value" 
              fill="#22c55e" 
              radius={[2, 2, 0, 0]}
              maxBarSize={8}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Info text */}
      <p className="mt-4 text-xs text-gray-500">
        This condition is based on your last 30-day transaction data.
      </p>
    </Card>
  )
}

'use client'

import { Card } from '@/components/ui/card'
import { BarChart, Bar, XAxis, ResponsiveContainer } from 'recharts'
import { ChevronDown } from 'lucide-react'

interface TransactionChartProps {
  total?: number
  data?: { day: string; amount: number }[]
  period?: string
}

const defaultData = [
  { day: 'Mon', amount: 120 },
  { day: 'Tue', amount: 180 },
  { day: 'Wed', amount: 90 },
  { day: 'Thu', amount: 140 },
  { day: 'Fri', amount: 200 },
  { day: 'Sat', amount: 160 },
  { day: 'Sun', amount: 110 },
  { day: 'Mon', amount: 95 },
  { day: 'Tue', amount: 175 },
  { day: 'Wed', amount: 130 },
  { day: 'Thu', amount: 85 },
  { day: 'Fri', amount: 145 },
]

export function TransactionChart({ 
  total = 6721.48, 
  data = defaultData,
  period = 'Weekly'
}: TransactionChartProps) {
  const formatAmount = (value: number) => {
    const [whole, decimal] = value.toFixed(2).split('.')
    return { whole, decimal }
  }

  const formatted = formatAmount(total)

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Transaction Count</h3>
        
        {/* Period selector */}
        <button className="flex items-center gap-2 rounded-lg bg-white/[0.05] px-3 py-1.5 text-sm text-gray-400 hover:bg-white/[0.08] transition-colors">
          {period}
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      {/* Total amount */}
      <div className="mb-6">
        <span className="text-3xl font-bold text-white">${formatted.whole}</span>
        <span className="text-xl font-medium text-gray-500">.{formatted.decimal}</span>
      </div>

      {/* Chart */}
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={4}>
            <XAxis 
              dataKey="day" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 10 }}
              interval={0}
            />
            <Bar 
              dataKey="amount" 
              fill="#22c55e" 
              radius={[2, 2, 0, 0]}
              maxBarSize={16}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Y-axis reference */}
      <div className="mt-2 flex justify-end gap-4 text-xs text-gray-500">
        <span>145</span>
        <span>116</span>
        <span>87</span>
        <span>58</span>
      </div>
    </Card>
  )
}

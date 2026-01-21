'use client'

import { Card } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

interface TransferChartProps {
  data?: { name: string; value: number; color: string }[]
  total?: number
  percentage?: number
}

const defaultData = [
  { name: 'Product', value: 45755, color: '#22c55e' },
  { name: 'Restaurants and bars', value: 34575, color: '#a855f7' },
  { name: 'Internet and media', value: 12475, color: '#3b82f6' },
]

export function TransferChart({ 
  data = defaultData, 
  total = 92805,
  percentage = 43 
}: TransferChartProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-white mb-6">Transfer</h3>
      
      <div className="flex items-center justify-between">
        {/* Donut Chart */}
        <div className="relative h-40 w-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-white">{percentage}%</span>
            <span className="text-xs text-gray-400">Total</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div 
                  className="h-2 w-2 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-400 truncate max-w-[120px]">
                  {item.name}
                </span>
              </div>
              <span className="text-sm font-medium text-white">
                {item.value.toLocaleString()} PLN
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

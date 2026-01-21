'use client'

import { Card } from '@/components/ui/card'
import { BarChart, Bar, XAxis, ResponsiveContainer, Legend } from 'recharts'

interface AnalyticsChartProps {
  data?: { name: string; stocks: number; bonds: number; other: number }[]
}

const defaultData = [
  { name: 'Jan', stocks: 2487.85, bonds: 1200, other: 800 },
  { name: 'Feb', stocks: 1800, bonds: 950, other: 600 },
  { name: 'Mar', stocks: 3745.29, bonds: 1500, other: 900 },
  { name: 'Apr', stocks: 2100, bonds: 1100, other: 750 },
  { name: 'May', stocks: 6087.12, bonds: 2000, other: 1200 },
]

export function AnalyticsChart({ data = defaultData }: AnalyticsChartProps) {
  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Analytics Performance</h3>
        
        {/* Legend */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-purple-500" />
            <span className="text-xs text-gray-400">Stocks</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-blue-500" />
            <span className="text-xs text-gray-400">Bonds</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-purple-300" />
            <span className="text-xs text-gray-400">Other Instruments</span>
          </div>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={4}>
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            <Bar 
              dataKey="stocks" 
              fill="#a855f7" 
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
            <Bar 
              dataKey="bonds" 
              fill="#3b82f6" 
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
            <Bar 
              dataKey="other" 
              fill="#c4b5fd" 
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Y-axis labels */}
      <div className="mt-4 flex justify-between text-xs text-gray-500">
        <span>$2,487.85</span>
        <span>$3,745.29</span>
        <span>$6,087.12</span>
      </div>
    </Card>
  )
}

'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts'
import { getSpendingOverTime, DateRange } from '@/lib/actions/dashboard'
import { cn } from '@/lib/utils'
import { BarChart3, TrendingUp, Loader2 } from 'lucide-react'

interface SpendingLineChartProps {
  initialData: { date: string; amount: number }[]
}

export function SpendingLineChart({ initialData }: SpendingLineChartProps) {
  const [data, setData] = useState(initialData)
  const [dateRange, setDateRange] = useState<DateRange>('this_year')
  const [loading, setLoading] = useState(false)
  const [chartType, setChartType] = useState<'line' | 'bar'>('line')

  const handleRangeChange = async (range: DateRange) => {
    setDateRange(range)
    setLoading(true)
    try {
      const newData = await getSpendingOverTime(range)
      setData(newData)
    } catch (error) {
      console.error('Failed to fetch spending data', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6 bg-[#1a1a24] border-white/[0.08] h-full flex flex-col relative">
      {loading && (
        <div className="absolute inset-0 z-10 bg-[#1a1a24]/50 flex items-center justify-center backdrop-blur-sm rounded-2xl">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="font-semibold text-white">Spending Over Time</h3>
          <p className="text-sm text-gray-400">Visualizing your expense trends</p>
        </div>
        
        <div className="flex items-center gap-2">
           <div className="flex bg-[#0d0d12] rounded-lg p-1 mr-2">
             <button
               onClick={() => setChartType('line')}
               className={cn(
                 "p-1.5 rounded-md transition-all",
                 chartType === 'line' ? "bg-emerald-500/20 text-emerald-500" : "text-gray-400 hover:text-white"
               )}
             >
               <TrendingUp className="h-4 w-4" />
             </button>
             <button
               onClick={() => setChartType('bar')}
               className={cn(
                 "p-1.5 rounded-md transition-all",
                 chartType === 'bar' ? "bg-emerald-500/20 text-emerald-500" : "text-gray-400 hover:text-white"
               )}
             >
               <BarChart3 className="h-4 w-4" />
             </button>
           </div>
          
           <div className="flex bg-[#0d0d12] rounded-lg p-1">
            <button
               onClick={() => handleRangeChange('this_month')}
               className={cn(
                 "px-3 py-1 text-xs font-medium rounded-md transition-all",
                 dateRange === 'this_month' 
                   ? "bg-[#272732] text-white shadow-sm" 
                   : "text-gray-400 hover:text-gray-300"
               )}
             >
              Month
             </button>
             <button
               onClick={() => handleRangeChange('this_year')}
               className={cn(
                 "px-3 py-1 text-xs font-medium rounded-md transition-all",
                 dateRange === 'this_year' 
                   ? "bg-[#272732] text-white shadow-sm" 
                   : "text-gray-400 hover:text-gray-300"
               )}
             >
               Year
             </button>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-[300px]">
        {data.length === 0 ? (
           <div className="h-full flex items-center justify-center text-gray-500 text-sm">
             No spending data for this period
           </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => {
                     // If monthly, format as MMM
                     if (value.length === 7) return value
                     // If daily, format as DD
                     return value.split('-')[2]
                  }}
                />
                <YAxis 
                  stroke="#6b7280" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: '#1a1a24', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px'
                  }}
                  itemStyle={{ color: '#22c55e' }}
                  formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Spent']}
                  labelStyle={{ color: '#9ca3af', marginBottom: '0.25rem' }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#22c55e"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#1a1a24', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#22c55e' }}
                />
              </LineChart>
            ) : (
              <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280" 
                  fontSize={12}
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => {
                     if (value.length === 7) return value
                     return value.split('-')[2]
                  }}
                />
                <YAxis 
                  stroke="#6b7280" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ 
                    backgroundColor: '#1a1a24', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px'
                  }}
                  formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Spent']}
                  labelStyle={{ color: '#9ca3af', marginBottom: '0.25rem' }}
                />
                <Bar 
                  dataKey="amount" 
                  fill="#22c55e" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  )
}

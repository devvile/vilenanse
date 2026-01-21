'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { getExpensesByCategory, DateRange } from '@/lib/actions/dashboard'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface ExpensesDonutChartProps {
  initialData: {
    id: string
    name: string
    value: number
    color: string
    parent_id: string | null
  }[]
}

const COLORS = ['#22c55e', '#a855f7', '#3b82f6', '#f97316', '#ef4444', '#eab308', '#ec4899', '#6366f1']

export function ExpensesDonutChart({ initialData }: ExpensesDonutChartProps) {
  const [data, setData] = useState(initialData)
  const [dateRange, setDateRange] = useState<DateRange>('this_month')
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined)

  const handleRangeChange = async (range: DateRange) => {
    setDateRange(range)
    setLoading(true)
    try {
      const newData = await getExpensesByCategory(range)
      setData(newData)
    } catch (error) {
      console.error('Failed to fetch expenses', error)
    } finally {
      setLoading(false)
    }
  }

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index)
  }

  const ranges: { label: string; value: DateRange }[] = [
    { label: 'Week', value: 'this_week' },
    { label: 'Month', value: 'this_month' },
    { label: 'Year', value: 'this_year' },
  ]

  const totalValue = data.reduce((sum, item) => sum + item.value, 0)

  // Custom Legend
  const renderLegend = (props: any) => {
    const { payload } = props
    
    return (
      <div className="grid grid-cols-2 gap-2 text-xs mt-4">
        {payload.map((entry: any, index: number) => {
           const percent = totalValue > 0 ? (entry.payload.value / totalValue) * 100 : 0
           return (
            <div key={`item-${index}`} className="flex items-center gap-2">
              <div 
                className="h-2 w-2 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-400 truncate max-w-[80px]" title={entry.value}>
                {entry.value}
              </span>
              <span className="text-white ml-auto">
                 {Math.round(percent)}%
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <Card className="p-6 bg-[#1a1a24] border-white/[0.08] h-full flex flex-col relative">
      {loading && (
        <div className="absolute inset-0 z-10 bg-[#1a1a24]/50 flex items-center justify-center backdrop-blur-sm rounded-2xl">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
        </div>
      )}
      
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-white">Expenses by Category</h3>
        <div className="flex bg-[#0d0d12] rounded-lg p-1">
          {ranges.map((range) => (
            <button
              key={range.value}
              onClick={() => handleRangeChange(range.value)}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md transition-all",
                dateRange === range.value 
                  ? "bg-[#272732] text-white shadow-sm" 
                  : "text-gray-400 hover:text-gray-300"
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-[300px] relative">
         {data.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
               No expenses for this period
            </div>
         ) : (
            <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                onMouseEnter={onPieEnter}
                activeIndex={activeIndex}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color || COLORS[index % COLORS.length]} 
                    stroke="rgba(26, 26, 36, 1)"
                    strokeWidth={2}
                    className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1a1a24', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                itemStyle={{ color: '#fff' }}
                cursor={false}
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
              />
              <Legend content={renderLegend} verticalAlign="bottom" height={100}/>
            </PieChart>
          </ResponsiveContainer>
         )}
        
        {data.length > 0 && (
          <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <p className="text-xs text-gray-400">Total</p>
            <p className="text-xl font-bold text-white">${totalValue.toLocaleString()}</p>
          </div>
        )}
      </div>
    </Card>
  )
}

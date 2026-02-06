'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { cn } from '@/lib/utils'
import { Loader2, RotateCcw } from 'lucide-react'
import { useTheme } from '../theme-provider'

interface ExpensesDonutChartProps {
  initialData: {
    id: string
    name: string
    value: number
    color: string
    parent_id: string | null
  }[]
  onCategorySelect?: (category: { id: string; name: string }) => void
  onReset?: () => void
  selectedCategoryId?: string
}

const COLORS = ['#22c55e', '#a855f7', '#3b82f6', '#f97316', '#ef4444', '#eab308', '#ec4899', '#6366f1']

export function ExpensesDonutChart({ 
  initialData, 
  onCategorySelect, 
  onReset,
  selectedCategoryId, 
}: ExpensesDonutChartProps) {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined)

  // Sync state with props when data changes from parent
  useEffect(() => {
    setData(initialData)
  }, [initialData])

  const handlePieClick = (entry: any) => {
    if (onCategorySelect) {
      onCategorySelect({ id: entry.id, name: entry.name })
    }
  }

  const handleReset = () => {
    if (onReset) {
      onReset()
    }
  }

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index)
  }

  const onPieLeave = () => {
    setActiveIndex(undefined)
  }

  const totalValue = data.reduce((sum, item) => sum + item.value, 0)

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0]
      const percentage = totalValue > 0 ? ((item.value / totalValue) * 100).toFixed(1) : 0
      
      return (
        <div className="bg-card border border-card-border rounded-lg p-3 shadow-xl">
          <p className="text-text-primary font-semibold text-sm mb-1">{item.name}</p>
          <p className="text-emerald-500 font-bold text-lg">
            {Number(item.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PLN
          </p>
          <p className="text-text-muted text-xs mt-1">
            {percentage}% of total
          </p>
        </div>
      )
    }
    return null
  }

  // Custom Legend
  const renderLegend = (props: any) => {
    const { payload } = props
    
    return (
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs pt-4">
        {payload.map((entry: any, index: number) => {
           const percent = totalValue > 0 ? (entry.payload.value / totalValue) * 100 : 0
           return (
            <div key={`item-${index}`} className="flex items-center gap-2">
              <div 
                className="h-2 w-2 rounded-full shrink-0" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-text-secondary truncate max-w-[90px]" title={entry.value}>
                {entry.value}
              </span>
              <span className="text-text-primary ml-auto font-medium">
                 {Math.round(percent)}%
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <Card className="p-6 bg-card border-card-border h-full flex flex-col relative overflow-hidden group">
       {/* Ambient background glow */}
       <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-colors" />

      {loading && (
        <div className="absolute inset-0 z-50 bg-card/50 flex items-center justify-center backdrop-blur-sm rounded-2xl">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 relative z-10">
        <div>
          <h3 className="font-semibold text-text-primary">Expenses by Category</h3>
          <p className="text-sm text-text-muted">Analysis of your spending patterns</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-text-muted uppercase tracking-wider font-medium">Total Expenses</p>
            <p className="text-xl font-bold text-emerald-500">
              {totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm font-medium opacity-70">PLN</span>
            </p>
          </div>

          {selectedCategoryId && (
            <button 
              onClick={handleReset}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-black transition-all duration-300 active:scale-95 group/reset"
            >
              <RotateCcw className="h-3 w-3 group-hover/reset:rotate-[-45deg] transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest">Reset Value</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-[300px] relative">
         {data.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-text-muted text-sm">
               No expenses for this period
            </div>
         ) : (
            <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="40%"
                innerRadius={70}
                outerRadius={95}
                paddingAngle={4}
                dataKey="value"
                onMouseEnter={onPieEnter}
                onMouseLeave={onPieLeave}
                onClick={handlePieClick}
                // @ts-ignore
                activeIndex={activeIndex}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color || COLORS[index % COLORS.length]} 
                    stroke={isLight ? "#fff" : (selectedCategoryId === entry.id ? "#fff" : "rgba(26, 26, 36, 1)")}
                    strokeWidth={2}
                    className="transition-all duration-300 hover:opacity-80 cursor-pointer outline-none"
                    style={{
                      filter: selectedCategoryId === entry.id ? 'brightness(1.2) drop-shadow(0 0 5px rgba(255,255,255,0.2))' : 'none',
                      opacity: selectedCategoryId && selectedCategoryId !== entry.id ? 0.3 : 1,
                      transform: activeIndex === index ? 'scale(1.02)' : 'scale(1)',
                      transformOrigin: 'center'
                    }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                content={renderLegend} 
                verticalAlign="bottom" 
                height={130}
                wrapperStyle={{ paddingBottom: '30px' }}
              />
            </PieChart>
          </ResponsiveContainer>
         )}
      </div>
    </Card>
  )
}